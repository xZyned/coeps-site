import { NextResponse } from 'next/server';
import { ObjectId } from 'bson';
import { getUserId } from '@/lib/getUserId';
import { connectToDatabase } from '@/lib/mongodb';
import PaymentTicketProps from '@/lib/types/payments/paymentTicket.t';

export async function POST(request: Request) {
    try {
        const userId = await getUserId(request);
        const { db } = await connectToDatabase();

        // --- NOVO: Extraindo e validando os dados enviados pelo Frontend ---
        const body = await request.json();
        const { nome, cpf, cep, rua, numero, bairro, complemento, loteAtualFrontEnd } = body;
        // Validação de segurança no Backend
        if (!nome || !cpf || !cep || !rua || !numero || !bairro || !loteAtualFrontEnd) {
            return NextResponse.json(
                { error: 'Todos os campos obrigatórios devem ser preenchidos.' },
                { status: 400 }
            );
        }
        // -------------------------------------------------------------------

        // 1. Pega a hora atual para podermos comparar
        const now = new Date();

        // 2. Tenta encontrar uma sessão válida (que ainda não expirou)
        const sessaoAtiva = await db.collection('pagamentos.sessoes').findOne({
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

        const sessoesAtivas = await db.collection("pagamentos.sessoes").countDocuments({
            // Traz apenas os documentos onde o 'expiresAt' é MAIOR que 'now'
            expiresAt: { $gt: now },
            status: "PENDENTE" // Evita contar quem já pagou dentro dos 15 minutos
        });

        const pagamentosRealizadosESessoesAbertas = sessoesAtivas + numeroInscritosPagantes;
        // Calculando lote
        let loteAtual = null;
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
        const mockPixCode = `00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000_mock_gerado_${now.getTime()}`;

        // Monta o objeto da sessão
        const novaSessao: Omit<PaymentTicketProps, "_id"> = {
            orderId: new ObjectId(),
            owner: new ObjectId(userId),
            pixCode: mockPixCode,
            paymentConfig: loteAtual,
            paymentUrl: "www.google.com.br",
            type: "ticket",
            expiresAt: expiresAt,
            // --- NOVO: Adicionando os dados validados à nova sessão ---
            userProps: {
                name: nome,
                cpf: cpf,
                zipCode: cep,
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