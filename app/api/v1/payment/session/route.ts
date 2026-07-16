import { NextResponse } from 'next/server';
import { ObjectId } from 'bson';
import { getUserId } from '@/lib/getUserId';
import { connectToDatabase } from '@/lib/mongodb';
import PaymentTicketProps from '@/lib/types/payments/paymentTicket.t';
import { ILoteAutomatico } from '@/lib/types/payments/payment.t';
import { IUser } from '@/lib/types/user/user.t';

/**
 * 
 * @param request Cria uma sessão para o usuário ou retorna uma caso ele já possua.
 */
export async function POST(request: Request) {
    try {
        const userId = await getUserId(request);
        const { db } = await connectToDatabase();

        // Procurando usuário
        const usuario: IUser | null = await db.collection("usuarios").findOne({
            "_id": new ObjectId(userId)
        });

        //

        // --- NOVO: Extraindo e validando os dados enviados pelo Frontend ---
        const body = await request.json();
        const { nome, cpf, cep, rua, numero, bairro, complemento, loteAtualFrontEnd, telefone, email } = body;
        // Validação de segurança no Backend
        if (!nome || !cpf || !cep || !rua || !numero || !bairro || !loteAtualFrontEnd || !telefone || !email) {
            return NextResponse.json(
                { error: 'Todos os campos obrigatórios devem ser preenchidos.' },
                { status: 400 }
            );
        }
        // -------------------------------------------------------------------

        // 1. Pega a hora atual para podermos comparar
        const now = new Date();

        // 2. Tenta encontrar uma sessão válida (que ainda não expirou)
        const sessaoAtiva: PaymentTicketProps | null = await db.collection('pagamentos.sessoes').findOne({
            owner: new ObjectId(userId),
            type: "ticket",
            expiresAt: { $gt: now } // O segredo está aqui: expiresAt maior que o momento atual
        });

        // 3. Se encontrou uma sessão válida, retorna ela e encerra a execução
        if (sessaoAtiva) {
            return NextResponse.json({
                success: true,
                sessao: sessaoAtiva,
                message: "Sessão ativa recuperada com sucesso."
            }, { status: 200 }); // 200 OK
        }

        // ==========================================
        // 4.1. Se não encontrou, vamos verificar se o plano que ele enviou ainda está vigente.
        // ==========================================
        const ticketConfig = await db.collection("ingressos_config").findOne(
            { _id: new ObjectId("66bcfceedc9c7250e85b2ac6") }
        )
        if (!ticketConfig) {
            return NextResponse.json({ message: "Configuração não encontrada" }, { status: 404 });
        }
        // Verficando o plano atual vigente:
        const numeroInscritosPagantes = await db.collection("usuarios").countDocuments({
            "pagamento.situacao": 1, // Se o usuário pagou.
            // NÃO pode ser "organizador".
            "pagamento.tipo_pagamento": { $not: /^organizador$/i }
        });

        const sessoesAtivas: number = await db.collection("pagamentos.sessoes").countDocuments({
            // Traz apenas os documentos onde o 'expiresAt' é MAIOR que 'now'
            expiresAt: { $gt: now },
            status: "PENDENTE" // Evita contar quem já pagou dentro dos 15 minutos
        });

        const pagamentosRealizadosESessoesAbertas = sessoesAtivas + numeroInscritosPagantes;
        // Calculando lote
        let loteAtual: ILoteAutomatico | null = null;
        const lotes = ticketConfig.configuracaoLotesAutomaticos?.lotes;
        if (lotes && lotes.length > 0) {
            let vagasAcumuladas = 0;

            for (let i = 0; i < lotes.length; i++) {
                const lote = lotes[i];
                vagasAcumuladas += lote.limiteVagas;

                const isUltimoLote = i === lotes.length - 1;

                // Se o total de ocupantes não estourou a capacidade acumulada, ou é o último lote
                if (pagamentosRealizadosESessoesAbertas < vagasAcumuladas || isUltimoLote) {
                    loteAtual = lote;
                    break; // Achou o lote, encerra o loop
                }
            }
        }
        // O lote do cliente é o mesmo lote que está vigente ? Se não for, vamos retornar a ele o lote vigente para ele atualizar no frontend. 
        // Isso é uma medida de segurança para evitar que o cliente tente burlar o sistema enviando um lote antigo, ou garantir que ele saiba que o lote atualizou!
        if (!loteAtual || loteAtual.codigo !== loteAtualFrontEnd.codigo) {
            return NextResponse.json({
                success: false,
                message: "O lote que você selecionou não está mais vigente. Por favor, o lote atual foi atualizado em sua página.",
                loteVigente: loteAtual
            }, { status: 409 }); // 409 Conflict - O cliente tentou criar uma sessão com um lote que não é mais vigente. O front-end deve atualizar o lote vigente e avisar ao usuário.
        }
        // ==========================================
        // 4.2. Se não tiver problemas, vamos criar uma nova sessão de pagamento
        // ==========================================
        const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

        // Integração com Gateway (Mock)
        // Criando o pagamento PIX:
        const asaasApiUrl = process.env.ASAAS_API_URL
        const ASAAS_API_KEY = process.env.ASAAS_API_KEY
        const ASAAS_URL_CALLBACK = process.env.ASAAS_URL_CALLBACK
        const ASAAS_URL_REDIRECT = process.env.ASAAS_URL_REDIRECT

        const newSessionId = new ObjectId()

        const modeloFetchAssas = {
            "billingTypes": ["PIX"],
            "minutesToExpire": 14,
            "customer": usuario.id_api,
            "chargeTypes": ["DETACHED"],
            "externalReference": `${newSessionId}`,
            "callback": {
                "successUrl": ASAAS_URL_CALLBACK,
                "cancelUrl": ASAAS_URL_REDIRECT,
                "expiredUrl": ASAAS_URL_CALLBACK
            },
            "items": [
                {
                    "description": loteAtual.nome,
                    "name": loteAtual.nome,
                    "quantity": 1,
                    "value": loteAtual.precos.valorPix
                }
            ],
            /*
            "customerData": {
                "name": nome,
                "cpfCnpj": cpf,
                "email": email,
                "phone": telefone,
                "address": bairro,
                "addressNumber": numero,
                "complement": complemento || "",
                "province": usuario.informacoes_usuario.país,
                "postalCode": cep,
            }
                */
        }
        const fetchCheckoutPIX = await fetch(`${asaasApiUrl}/checkouts`, {
            method: "POST",
            headers: {
                'User-Agent': 'NomeDaSuaAplicacao/1.0.0', // Nome do seu app
                'accept': 'application/json',
                'content-type': 'application/json',
                'access_token': ASAAS_API_KEY
            },
            body: JSON.stringify(modeloFetchAssas)
        })

        if (!fetchCheckoutPIX.ok) {
            return Response.json({ message: "Infelizmente ocorreu algum erro inesperado. Recarregue a página e tente novamente." }, { status: 500 })
        }
        const checkoutPix: { link: string, id: string } = await fetchCheckoutPIX.json() // tem mais informações, mas é só isso que importa.


        //

        // Monta o objeto da sessão
        const novaSessao: PaymentTicketProps = {
            _id: newSessionId,
            orderId: checkoutPix.id,
            owner: new ObjectId(userId),
            pixCode: null,
            paymentConfig: loteAtual,
            paymentUrl: checkoutPix.link,
            type: "ticket",
            expiresAt: expiresAt,
            // --- NOVO: Adicionando os dados validados à nova sessão ---
            status: "UNPAID",
            userProps: {
                name: nome,
                cpf: cpf,
                zipCode: cep,
                phone: telefone,
                email: email,
                street: rua,
                number: numero,
                neighborhood: bairro,
                complement: complemento || "Não informado" // Complemento é opcional, então colocamos um valor padrão caso não seja fornecido, para não dar bug no Asaas.
            }
        }

        // Insere na coleção
        await db.collection('pagamentos.sessoes').insertOne(novaSessao);

        // Retorna a nova sessão criada
        return NextResponse.json({
            success: true,
            sessao: novaSessao,
            message: "Nova sessão criada com sucesso."
        }, { status: 201 }); // 201 Created

    } catch (error) {
        console.error('Erro ao processar sessão de pagamento:', error);
        return NextResponse.json(
            { error: 'Erro interno ao processar sessão.' },
            { status: 500 }
        );
    }
}