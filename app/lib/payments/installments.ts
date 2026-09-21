export const ASAAS_LAST_INSTALLMENT_REMAINDER_V1 =
    'ASAAS_LAST_INSTALLMENT_REMAINDER_V1' as const;

type InstallmentOption = {
    codigo?: unknown;
    totalParcelas?: unknown;
    valorCadaParcela?: unknown;
};

type InstallmentPricingSource = {
    paymentConfig?: { precos?: { parcelamentos?: InstallmentOption[] } };
    paymentConfigOriginal?: { precos?: { parcelamentos?: InstallmentOption[] } };
    valoresCentavos?: { final?: { CREDIT_CARD?: unknown } };
    perfilUtilizador?: unknown;
    origemPreco?: unknown;
};

export type SelectedCreditCardAmounts = {
    installmentCount: number;
    originalCents: number;
    finalCents: number;
    discountCents: number;
    regularInstallmentCents: number;
    lastInstallmentCents: number;
    selectedValueSnapshot: {
        original: number;
        desconto: number;
        final: number;
    };
};

export function paymentValueInCents(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : null;
}

export function asaasInstallmentDistribution(totalCents: number, count: number) {
    if (!Number.isInteger(totalCents) || totalCents < 0) return null;
    if (!Number.isInteger(count) || count < 1) return null;
    const regularInstallmentCents = Math.floor(totalCents / count);
    const lastInstallmentCents = totalCents - regularInstallmentCents * (count - 1);
    return { regularInstallmentCents, lastInstallmentCents };
}

export function expectedInstallmentValueCents(
    plan: Record<string, unknown> | null | undefined,
    installmentNumber: unknown,
): number | null {
    if (!plan) return null;
    if (plan.valueDistribution !== ASAAS_LAST_INSTALLMENT_REMAINDER_V1) {
        const legacyValue = Number(plan.installmentValueCentavos);
        return Number.isInteger(legacyValue) && legacyValue >= 0 ? legacyValue : null;
    }

    const count = Number(plan.count);
    const totalCents = Number(plan.totalValueCentavos);
    const number = Number(installmentNumber);
    const distribution = asaasInstallmentDistribution(totalCents, count);
    if (!distribution || !Number.isInteger(number) || number < 1 || number > count) return null;
    return number === count
        ? distribution.lastInstallmentCents
        : distribution.regularInstallmentCents;
}

export function resolveSelectedCreditCardAmounts(
    source: InstallmentPricingSource,
    selectedCode: unknown,
): SelectedCreditCardAmounts | null {
    const selected = source.paymentConfig?.precos?.parcelamentos?.find(
        (option) => Number(option.codigo) === Number(selectedCode),
    );
    if (!selected) return null;

    const installmentCount = Number(selected.totalParcelas);
    const selectedInstallmentValue = Number(selected.valorCadaParcela);
    if (
        !Number.isInteger(installmentCount) ||
        installmentCount < 1 ||
        !Number.isFinite(selectedInstallmentValue) ||
        selectedInstallmentValue < 0
    ) {
        return null;
    }
    const selectedTotalCents = paymentValueInCents(
        selectedInstallmentValue * installmentCount,
    );
    if (selectedTotalCents === null) return null;

    const original = source.paymentConfigOriginal?.precos?.parcelamentos?.find(
        (option) => Number(option.codigo) === Number(selectedCode),
    );
    const originalInstallmentValue = original
        ? Number(original.valorCadaParcela)
        : selectedInstallmentValue;
    const originalCount = original ? Number(original.totalParcelas) : installmentCount;
    if (
        !Number.isFinite(originalInstallmentValue) ||
        originalInstallmentValue < 0 ||
        !Number.isInteger(originalCount) ||
        originalCount !== installmentCount
    ) {
        return null;
    }
    const originalCents = paymentValueInCents(originalInstallmentValue * originalCount);
    if (originalCents === null) return null;

    const configuredFinalCents = Number(source.valoresCentavos?.final?.CREDIT_CARD);
    const fixedOrganizerPrice =
        source.perfilUtilizador === 'ORGANIZADOR' ||
        source.origemPreco === 'ORGANIZADOR_CONFIGURADO';
    const finalCents = fixedOrganizerPrice
        ? configuredFinalCents
        : selectedTotalCents;
    if (!Number.isInteger(finalCents) || finalCents < 0) return null;

    const distribution = asaasInstallmentDistribution(finalCents, installmentCount);
    if (!distribution) return null;
    const discountCents = Math.max(0, originalCents - finalCents);
    return {
        installmentCount,
        originalCents,
        finalCents,
        discountCents,
        ...distribution,
        selectedValueSnapshot: {
            original: originalCents,
            desconto: discountCents,
            final: finalCents,
        },
    };
}
