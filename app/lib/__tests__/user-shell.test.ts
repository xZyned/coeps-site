import test from 'node:test';
import assert from 'node:assert/strict';
import type { Db, Document } from 'mongodb';
import { ObjectId } from 'mongodb';
import {
    auth0SubjectToObjectId,
    ensureUserShell,
} from '../users/user-shell.ts';

function createMemoryDb(seed?: Document) {
    let document = seed;
    let insertions = 0;

    const db = {
        collection(name: string) {
            assert.equal(name, 'usuarios');
            return {
                async findOneAndUpdate(
                    filter: { _id: ObjectId },
                    _update: unknown,
                    options: { upsert?: boolean; returnDocument?: string },
                ) {
                    assert.equal(options.upsert, true);
                    assert.equal(options.returnDocument, 'after');
                    const defaults = {
                        _id: filter._id,
                        id_api: '',
                        isPos_registration: false,
                        informacoes_usuario: {
                            cpf: '', numero_telefone: '', nome: '', email: '',
                            data_criacao: new Date('2026-09-02T12:00:00.000Z'),
                            titulo_honorario: '',
                        },
                        pagamento: {
                            _id: filter._id,
                            situacao: 0, tipo_pagamento: '', situacao_animacao: false,
                            lista_pagamentos: [],
                        },
                    };
                    if (!document) insertions += 1;
                    document = {
                        ...defaults,
                        ...document,
                        isPos_registration: document?.isPos_registration === 1
                            ? true
                            : document?.isPos_registration === 0
                                ? false
                                : document?.isPos_registration ?? false,
                        informacoes_usuario: {
                            ...defaults.informacoes_usuario,
                            ...(document?.informacoes_usuario || {}),
                        },
                        pagamento: {
                            ...defaults.pagamento,
                            ...(document?.pagamento || {}),
                            situacao_animacao: document?.pagamento?.situacao_animacao === 1
                                ? true
                                : document?.pagamento?.situacao_animacao === 0
                                    ? false
                                    : document?.pagamento?.situacao_animacao ?? false,
                        },
                    };
                    return document;
                },
            };
        },
    } as unknown as Db;

    return {
        db,
        getDocument: () => document,
        getInsertions: () => insertions,
    };
}

test('vinte bootstraps concorrentes produzem um único usuário-base', async () => {
    const memory = createMemoryDb();
    const identity = {
        sub: 'auth0|507f1f77bcf86cd799439011',
        email: 'maria@example.com',
        name: 'Maria da Silva',
    };
    const results = await Promise.all(Array.from({ length: 20 }, () =>
        ensureUserShell({ db: memory.db, identity })));

    assert.equal(memory.getInsertions(), 1);
    assert.equal(results.length, 20);
    assert.equal(String(memory.getDocument()?._id), '507f1f77bcf86cd799439011');
});

test('bootstrap repara documento somente com ID sem apagar perfil completo', async () => {
    const owner = new ObjectId('507f1f77bcf86cd799439011');
    const completeProfile = {
        cpf: '52998224725',
        numero_telefone: '34999999999',
        nome: 'Maria da Silva',
        email: 'maria@example.com',
        data_criacao: new Date('2024-01-01T00:00:00.000Z'),
        titulo_honorario: 'Dra.',
    };
    const memory = createMemoryDb({
        _id: owner,
        id_api: 'cus_existing',
        isPos_registration: true,
        informacoes_usuario: completeProfile,
        pagamento: {
            situacao: 1,
            tipo_pagamento: 'asaas',
            situacao_animacao: true,
            lista_pagamentos: [{ id: 'pay_existing' }],
        },
    });

    await ensureUserShell({ db: memory.db, identity: { sub: `auth0|${owner}` } });
    assert.deepEqual(memory.getDocument()?.informacoes_usuario, completeProfile);
    assert.equal(memory.getDocument()?.pagamento?.situacao, 1);

    const idOnly = createMemoryDb({ _id: owner });
    await ensureUserShell({ db: idOnly.db, identity: { sub: `auth0|${owner}` } });
    assert.equal(idOnly.getDocument()?.isPos_registration, false);
    assert.deepEqual(idOnly.getDocument()?.pagamento?.lista_pagamentos, []);

    const numericFlags = createMemoryDb({
        _id: owner,
        isPos_registration: 1,
        pagamento: { situacao_animacao: 0 },
    });
    await ensureUserShell({ db: numericFlags.db, identity: { sub: `auth0|${owner}` } });
    assert.equal(numericFlags.getDocument()?.isPos_registration, true);
    assert.equal(numericFlags.getDocument()?.pagamento?.situacao_animacao, false);
});

test('rejeita subject Auth0 que não corresponde ao ObjectId canônico', () => {
    assert.throws(() => auth0SubjectToObjectId('google-oauth2|abc'), /identificador compatível/);
});
