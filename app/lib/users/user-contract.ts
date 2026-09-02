import { isRegistrationProfileComplete } from '../registration-gate.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringOrEmpty(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function normalizePaymentSituation(value: unknown): 0 | 1 | 2 {
    const parsed = Number(value);
    return parsed === 1 || parsed === 2 ? parsed : 0;
}

export type NormalizedUserDocument = {
    _id: string | null;
    id_api: string;
    isPos_registration: boolean;
    cadastroPendente: boolean;
    informacoes_usuario: Record<string, unknown> & {
        cpf: string;
        numero_telefone: string;
        nome: string;
        email: string;
        data_criacao: string | Date | null;
        titulo_honorario: string;
    };
    pagamento: Record<string, unknown> & {
        situacao: 0 | 1 | 2;
        tipo_pagamento: string;
        situacao_animacao: boolean;
        lista_pagamentos: unknown[];
    };
};

export function normalizeUserDocument(value: unknown): NormalizedUserDocument {
    const user = isRecord(value) ? value : {};
    const rawProfile = isRecord(user.informacoes_usuario)
        ? user.informacoes_usuario
        : {};
    const rawPayment = isRecord(user.pagamento) ? user.pagamento : {};
    const isPosRegistration = user.isPos_registration === true || user.isPos_registration === 1;
    const profile = {
        ...rawProfile,
        cpf: stringOrEmpty(rawProfile.cpf),
        numero_telefone: stringOrEmpty(rawProfile.numero_telefone),
        nome: stringOrEmpty(rawProfile.nome),
        email: stringOrEmpty(rawProfile.email),
        data_criacao:
            rawProfile.data_criacao instanceof Date ||
            typeof rawProfile.data_criacao === 'string'
                ? rawProfile.data_criacao
                : null,
        titulo_honorario: stringOrEmpty(rawProfile.titulo_honorario),
    };
    const normalized: NormalizedUserDocument = {
        _id: user._id === null || user._id === undefined || String(user._id) === ''
            ? null
            : String(user._id),
        id_api: stringOrEmpty(user.id_api),
        isPos_registration: isPosRegistration,
        cadastroPendente: true,
        informacoes_usuario: profile,
        pagamento: {
            ...rawPayment,
            situacao: normalizePaymentSituation(rawPayment.situacao),
            tipo_pagamento: stringOrEmpty(rawPayment.tipo_pagamento),
            situacao_animacao: rawPayment.situacao_animacao === true,
            lista_pagamentos: Array.isArray(rawPayment.lista_pagamentos)
                ? rawPayment.lista_pagamentos
                : [],
        },
    };

    normalized.cadastroPendente = !isRegistrationProfileComplete(normalized);
    return normalized;
}
