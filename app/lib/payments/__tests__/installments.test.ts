import test from 'node:test';
import assert from 'node:assert/strict';
import {
    ASAAS_LAST_INSTALLMENT_REMAINDER_V1,
    asaasInstallmentDistribution,
    expectedInstallmentValueCents,
    resolveSelectedCreditCardAmounts,
} from '../installments.ts';

function pricingSource(overrides = {}) {
    return {
        paymentConfigOriginal: {
            precos: {
                parcelamentos: [
                    { codigo: 1, totalParcelas: 1, valorCadaParcela: 200 },
                    { codigo: 6, totalParcelas: 6, valorCadaParcela: 40 },
                ],
            },
        },
        paymentConfig: {
            precos: {
                parcelamentos: [
                    { codigo: 1, totalParcelas: 1, valorCadaParcela: 180 },
                    { codigo: 6, totalParcelas: 6, valorCadaParcela: 36.66 },
                ],
            },
        },
        valoresCentavos: { final: { CREDIT_CARD: 18_000 } },
        perfilUtilizador: 'CONGRESSISTA',
        origemPreco: 'DESCONTO_PERCENTUAL',
        ...overrides,
    };
}

test('distribui R$ 220,00 em 6x com o restante na última parcela', () => {
    assert.deepEqual(asaasInstallmentDistribution(22_000, 6), {
        regularInstallmentCents: 3_666,
        lastInstallmentCents: 3_670,
    });
});

test('multiplica o valor configurado antes de arredondar o total de R$ 220,00', () => {
    const selected = resolveSelectedCreditCardAmounts(pricingSource({
        paymentConfigOriginal: {
            precos: { parcelamentos: [{ codigo: 6, totalParcelas: 6, valorCadaParcela: 220 / 6 }] },
        },
        paymentConfig: {
            precos: { parcelamentos: [{ codigo: 6, totalParcelas: 6, valorCadaParcela: 220 / 6 }] },
        },
        origemPreco: 'LOTE',
    }), 6);
    assert.equal(selected?.finalCents, 22_000);
    assert.equal(selected?.regularInstallmentCents, 3_666);
    assert.equal(selected?.lastInstallmentCents, 3_670);
});

test('resolve o total da opção escolhida em vez da primeira opção', () => {
    const selected = resolveSelectedCreditCardAmounts(pricingSource(), 6);
    assert.deepEqual(selected, {
        installmentCount: 6,
        originalCents: 24_000,
        finalCents: 21_996,
        discountCents: 2_004,
        regularInstallmentCents: 3_666,
        lastInstallmentCents: 3_666,
        selectedValueSnapshot: {
            original: 24_000,
            desconto: 2_004,
            final: 21_996,
        },
    });
});

test('organizador mantém o preço fixo em qualquer quantidade de parcelas', () => {
    const selected = resolveSelectedCreditCardAmounts(pricingSource({
        valoresCentavos: { final: { CREDIT_CARD: 22_000 } },
        perfilUtilizador: 'ORGANIZADOR',
        origemPreco: 'ORGANIZADOR_CONFIGURADO',
    }), 6);
    assert.equal(selected?.finalCents, 22_000);
    assert.equal(selected?.regularInstallmentCents, 3_666);
    assert.equal(selected?.lastInstallmentCents, 3_670);
});

test('mantém divisão exata e pagamento em uma parcela', () => {
    assert.deepEqual(asaasInstallmentDistribution(12_000, 3), {
        regularInstallmentCents: 4_000,
        lastInstallmentCents: 4_000,
    });
    const selected = resolveSelectedCreditCardAmounts(pricingSource(), 1);
    assert.equal(selected?.installmentCount, 1);
    assert.equal(selected?.finalCents, 18_000);
    assert.equal(selected?.regularInstallmentCents, 18_000);
    assert.equal(selected?.lastInstallmentCents, 18_000);
});

test('valida plano novo pelo número da parcela e preserva regra legada', () => {
    const currentPlan = {
        count: 6,
        totalValueCentavos: 22_000,
        installmentValueCentavos: 3_667,
        valueDistribution: ASAAS_LAST_INSTALLMENT_REMAINDER_V1,
    };
    assert.equal(expectedInstallmentValueCents(currentPlan, 1), 3_666);
    assert.equal(expectedInstallmentValueCents(currentPlan, 6), 3_670);
    assert.equal(expectedInstallmentValueCents(currentPlan, 7), null);
    assert.equal(expectedInstallmentValueCents({ installmentValueCentavos: 3_667 }, 6), 3_667);
});
