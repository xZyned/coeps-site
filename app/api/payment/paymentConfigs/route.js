import { connectToDatabase } from '../../../lib/mongodb'
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { withApiAuthRequired } from '@/lib/auth0-compat';
import { getUserId } from '@/lib/getUserId';

export const dynamic = 'force-dynamic'

// GAMBIARRA DAS BRABASSSSSS
// POR ENQUANTO ELE PUXA SÓ O 66bcfceedc9c7250e85b2ac6
// SE PRECISAR DEPOIS ELE PUXA O RESTANTE BASEADO NA DATA E SEI LÁ O QUE MAIS.

/** @type {any} */
export const GET = withApiAuthRequired(async function GET(request, { params }) {
  try {
    const userId = await getUserId(request);
    const { db } = await connectToDatabase();
    const colecao = "ingressos_config"

    // Usando findOne para evitar erros com Promises e índices de array
    const result = await db.collection(colecao).findOne(
      { _id: new ObjectId("66bcfceedc9c7250e85b2ac6") }
    )

    if (!result) {
      return NextResponse.json({ message: "Configuração não encontrada" }, { status: 404 });
    }

    const numeroInscritosPagantes = await db.collection("usuarios").countDocuments({
      "pagamento.situacao": 1, // Se o usuário pagou.
      // NÃO pode ser "organizador".
      "pagamento.tipo_pagamento": { $not: /^organizador$/i }
    });

    const now = new Date();
    const sessoesAtivas = await db.collection("pagamentos.sessoes").countDocuments({
      // Traz apenas os documentos onde o 'expiresAt' é MAIOR que 'now'
      expiresAt: { $gt: now },
      status: "PENDENTE" // Evita contar quem já pagou dentro dos 15 minutos
    });

    const pagamentosRealizadosESessoesAbertas = sessoesAtivas + numeroInscritosPagantes;

    // ==========================================
    // Calculando lote
    // ==========================================
    let loteAtual = null;
    const lotes = result.configuracaoLotesAutomaticos?.lotes;
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
    // ==========================================
    // Procurando sessão atual de pagamento automático
    const sessaoAtiva = await db.collection('pagamentos.sessoes').findOne({
      owner: new ObjectId(userId),
      type: "ticket",
      expiresAt: { $gt: now } // O segredo está aqui: expiresAt maior que o momento atual
    });


    //
    return NextResponse.json({
      ...result,
      loteAutomaticoAtual: loteAtual, // Devolve o objeto inteiro do lote encontrado
      sessaoPagamentoAutomáticoAtiva: sessaoAtiva ? sessaoAtiva : false // true se tiver sessão ativa, false caso contrário
    }, { status: 200 });

  }
  catch (error) {
    console.log(error)
    return NextResponse.json({ "message": error.message || error }, { status: 500 })
  }
})