// Versão única para a Política de Privacidade (LGPD) e os Termos de Uso.
// Ao alterar qualquer um dos textos em app/components/ConsentTerms.tsx, troque
// esta versão: todo usuário com cadastro completo verá o pedido de aceite de novo.
export const LGPD_CONSENT_VERSION = 'cieps-lgpd-termos-2026-10-16';

export type ConsentRecord = {
    aceito: boolean;
    aceitoEm: string | Date;
    versao: string;
};

export type ConsentHistoryRecord = ConsentRecord & {
    tipo: 'lgpd' | 'termosUso';
};

export type UserConsents = {
    lgpd?: ConsentRecord | null;
    termosUso?: ConsentRecord | null;
    historico?: ConsentHistoryRecord[];
} | null | undefined;

function isCurrent(record: ConsentRecord | null | undefined): boolean {
    return record?.aceito === true && record.versao === LGPD_CONSENT_VERSION;
}

export function hasCurrentConsent(consents: UserConsents): boolean {
    return isCurrent(consents?.lgpd) && isCurrent(consents?.termosUso);
}

// Monta o update do MongoDB que registra o aceite da versão atual. Aceites de
// versões anteriores vão para consentimentos.historico em vez de serem
// sobrescritos, para preservar quando cada versão foi aceita.
export function buildConsentUpdate(consents: UserConsents, now: Date) {
    const current = (record: ConsentRecord | null | undefined): ConsentRecord => ({
        aceito: true,
        aceitoEm: record && isCurrent(record) ? record.aceitoEm : now,
        versao: LGPD_CONSENT_VERSION,
    });

    const archived: ConsentHistoryRecord[] = [];
    for (const tipo of ['lgpd', 'termosUso'] as const) {
        const record = consents?.[tipo];
        if (record && !isCurrent(record)) archived.push({ ...record, tipo });
    }

    return {
        $set: {
            'consentimentos.lgpd': current(consents?.lgpd),
            'consentimentos.termosUso': current(consents?.termosUso),
        },
        ...(archived.length > 0
            ? { $push: { 'consentimentos.historico': { $each: archived } } }
            : {}),
    };
}
