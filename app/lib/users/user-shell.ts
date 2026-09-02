import type { Db, Document } from 'mongodb';
import { ObjectId } from 'mongodb';

const REQUIRED_PROFILE_STRING_FIELDS = [
    'cpf',
    'numero_telefone',
    'nome',
    'email',
    'titulo_honorario',
] as const;

export type Auth0UserIdentity = {
    sub: unknown;
    email?: unknown;
    name?: unknown;
};

export class UserProvisioningError extends Error {
    code: 'INVALID_AUTH0_SUBJECT' | 'USER_SHELL_NOT_PERSISTED' | 'USER_SHELL_INVALID';

    constructor(
        code: UserProvisioningError['code'],
        message: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
        this.name = 'UserProvisioningError';
        this.code = code;
    }
}

function optionalString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

export function auth0SubjectToObjectId(subject: unknown): ObjectId {
    const normalized = optionalString(subject).replace(/^auth0\|/, '');
    if (!ObjectId.isValid(normalized)) {
        throw new UserProvisioningError(
            'INVALID_AUTH0_SUBJECT',
            'A identidade autenticada não possui um identificador compatível.',
        );
    }
    return new ObjectId(normalized);
}

export function buildUserShellUpdate(input: {
    owner: ObjectId;
    email?: unknown;
    name?: unknown;
    now: Date;
}): Document[] {
    const defaultName = optionalString(input.name);
    const defaultEmail = optionalString(input.email);
    const profileDefaults = {
        cpf: '',
        numero_telefone: '',
        nome: defaultName,
        email: defaultEmail,
        data_criacao: input.now,
        titulo_honorario: '',
    };
    const paymentDefaults = {
        _id: input.owner,
        situacao: 0,
        tipo_pagamento: '',
        situacao_animacao: false,
        lista_pagamentos: [],
    };

    return [
        {
            $set: {
                id_api: {
                    $cond: [
                        { $in: [{ $type: '$id_api' }, ['missing', 'null']] },
                        '',
                        '$id_api',
                    ],
                },
                isPos_registration: {
                    $cond: [
                        { $in: [{ $type: '$isPos_registration' }, ['missing', 'null']] },
                        false,
                        {
                            $cond: [
                                { $in: ['$isPos_registration', [0, 1]] },
                                { $eq: ['$isPos_registration', 1] },
                                '$isPos_registration',
                            ],
                        },
                    ],
                },
                informacoes_usuario: {
                    $mergeObjects: [
                        profileDefaults,
                        {
                            $cond: [
                                { $eq: [{ $type: '$informacoes_usuario' }, 'object'] },
                                '$informacoes_usuario',
                                {},
                            ],
                        },
                    ],
                },
                pagamento: {
                    $mergeObjects: [
                        paymentDefaults,
                        {
                            $cond: [
                                { $eq: [{ $type: '$pagamento' }, 'object'] },
                                '$pagamento',
                                {},
                            ],
                        },
                    ],
                },
            },
        },
        {
            $set: {
                'informacoes_usuario.cpf': {
                    $cond: [
                        { $in: [{ $type: '$informacoes_usuario.cpf' }, ['missing', 'null']] },
                        '',
                        '$informacoes_usuario.cpf',
                    ],
                },
                'informacoes_usuario.numero_telefone': {
                    $cond: [
                        { $in: [{ $type: '$informacoes_usuario.numero_telefone' }, ['missing', 'null']] },
                        '',
                        '$informacoes_usuario.numero_telefone',
                    ],
                },
                'informacoes_usuario.nome': {
                    $cond: [
                        { $in: [{ $type: '$informacoes_usuario.nome' }, ['missing', 'null']] },
                        defaultName,
                        '$informacoes_usuario.nome',
                    ],
                },
                'informacoes_usuario.email': {
                    $cond: [
                        { $in: [{ $type: '$informacoes_usuario.email' }, ['missing', 'null']] },
                        defaultEmail,
                        '$informacoes_usuario.email',
                    ],
                },
                'informacoes_usuario.data_criacao': {
                    $cond: [
                        { $in: [{ $type: '$informacoes_usuario.data_criacao' }, ['missing', 'null']] },
                        input.now,
                        '$informacoes_usuario.data_criacao',
                    ],
                },
                'informacoes_usuario.titulo_honorario': {
                    $cond: [
                        { $in: [{ $type: '$informacoes_usuario.titulo_honorario' }, ['missing', 'null']] },
                        '',
                        '$informacoes_usuario.titulo_honorario',
                    ],
                },
                'pagamento.situacao': {
                    $cond: [
                        { $in: [{ $type: '$pagamento.situacao' }, ['missing', 'null']] },
                        0,
                        '$pagamento.situacao',
                    ],
                },
                'pagamento.tipo_pagamento': {
                    $cond: [
                        { $in: [{ $type: '$pagamento.tipo_pagamento' }, ['missing', 'null']] },
                        '',
                        '$pagamento.tipo_pagamento',
                    ],
                },
                'pagamento.situacao_animacao': {
                    $cond: [
                        { $in: [{ $type: '$pagamento.situacao_animacao' }, ['missing', 'null']] },
                        false,
                        {
                            $cond: [
                                { $in: ['$pagamento.situacao_animacao', [0, 1]] },
                                { $eq: ['$pagamento.situacao_animacao', 1] },
                                '$pagamento.situacao_animacao',
                            ],
                        },
                    ],
                },
                'pagamento.lista_pagamentos': {
                    $cond: [
                        { $in: [{ $type: '$pagamento.lista_pagamentos' }, ['missing', 'null']] },
                        [],
                        '$pagamento.lista_pagamentos',
                    ],
                },
            },
        },
    ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isStructurallyValidUserShell(value: unknown, owner: ObjectId): boolean {
    if (!isRecord(value) || String(value._id || '') !== owner.toHexString()) return false;
    if (typeof value.id_api !== 'string') return false;
    if (typeof value.isPos_registration !== 'boolean') return false;

    const profile = value.informacoes_usuario;
    if (!isRecord(profile)) return false;
    if (REQUIRED_PROFILE_STRING_FIELDS.some((field) => typeof profile[field] !== 'string')) {
        return false;
    }
    if (!(profile.data_criacao instanceof Date) && typeof profile.data_criacao !== 'string') {
        return false;
    }

    const payment = value.pagamento;
    if (!isRecord(payment)) return false;
    if (![0, 1, 2].includes(Number(payment.situacao))) return false;
    if (typeof payment.tipo_pagamento !== 'string') return false;
    if (typeof payment.situacao_animacao !== 'boolean') return false;
    if (!Array.isArray(payment.lista_pagamentos)) return false;
    return true;
}

export async function ensureUserShell(input: {
    db: Db;
    identity: Auth0UserIdentity;
    now?: () => Date;
}): Promise<{ owner: ObjectId; document: Document }> {
    const owner = auth0SubjectToObjectId(input.identity.sub);
    const document = await input.db.collection('usuarios').findOneAndUpdate(
        { _id: owner },
        buildUserShellUpdate({
            owner,
            email: input.identity.email,
            name: input.identity.name,
            now: (input.now ?? (() => new Date()))(),
        }),
        { upsert: true, returnDocument: 'after' },
    );

    if (!document) {
        throw new UserProvisioningError(
            'USER_SHELL_NOT_PERSISTED',
            'O usuário-base não pôde ser confirmado no banco de dados.',
        );
    }
    if (!isStructurallyValidUserShell(document, owner)) {
        throw new UserProvisioningError(
            'USER_SHELL_INVALID',
            'O usuário-base persistido não atende ao contrato estrutural.',
        );
    }
    return { owner, document };
}
