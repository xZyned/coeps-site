import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { ObjectId } from 'mongodb';
import ts from 'typescript';
import * as correction from '../academic-work-correction.ts';
import { runPaymentTransaction } from '../payments/transactions.ts';

const owner = '507f1f77bcf86cd799439011';
const other = '507f1f77bcf86cd799439012';
const workId = '507f1f77bcf86cd799439013';
const fileId = '507f1f77bcf86cd799439014';
const requirements = [{ titulo: 'Resumo', formatos: ['.pdf', '.docx'] }, { titulo: 'Trabalho', formatos: ['.pdf'] }];
function upload(overrides = {}) {
    return { _id: new ObjectId(fileId), userId: owner, purpose: 'correction', originalName: 'corrigido.pdf',
        size: 100, contentType: 'application/pdf', uploadDate: new Date('2026-10-08T15:00:00Z'), url: 'https://blob.test/corrigido', ...overrides };
}

// Real route with an in-process transaction model. No MongoClient or network.
function harness(options: { files?: any[]; status?: string; owner?: string; lostWrite?: boolean; failedLink?: boolean; failedCommit?: boolean; subject?: string; missing?: boolean } = {}) {
    let work: any = { _id: new ObjectId(workId), userId: new ObjectId(options.owner ?? owner), status: options.status ?? 'Necessita de Alteração',
        arquivos: [{ fileId: new ObjectId(), size: 50 }], titulo: 'Original', autores: [{ nome: 'Autor' }],
        avaliadorComentarios: [{ comentario: 'Corrigir' }], configuracaoModalidade: { requisitos_arquivos: requirements, limite_maximo_de_postagem: 1024 } };
    let files = options.files ?? [upload()];
    const collections: string[] = [];
    let connections = 0;
    let transaction = false;
    const session = {};
    const check = (opts: any) => { assert.equal(opts.session, session); assert.equal(transaction, true); };
    const matches = (file: any, query: any) => query._id.$in.some((id: ObjectId) => id.equals(file._id))
        && file.userId === query.userId && file.purpose === query.purpose && !Object.hasOwn(file, 'submissionId');
    const db = { collection(name: string) {
        collections.push(name);
        if (name === 'Dados_do_trabalho') return {
            findOne: async (query: any, opts: any) => { check(opts); return !options.missing && work._id.equals(query._id) && work.userId.equals(query.userId) ? work : null; },
            updateOne: async (query: any, update: any, opts: any) => {
                check(opts);
                assert.equal(query.status, 'Necessita de Alteração');
                if (options.lostWrite || work.status !== query.status) return { matchedCount: 0 };
                work = { ...work, ...update.$set, arquivos: [...work.arquivos, ...update.$push.arquivos.$each] };
                return { matchedCount: 1 };
            },
        };
        if (name === 'trabalhos_blob') return {
            find: (query: any, opts: any) => { check(opts); return { toArray: async () => files.filter(file => matches(file, query)) }; },
            updateMany: async (query: any, update: any, opts: any) => {
                check(opts);
                if (options.failedLink) return { modifiedCount: 0 };
                let modifiedCount = 0;
                files = files.map(file => { if (!matches(file, query)) return file; modifiedCount++; return { ...file, ...update.$set }; });
                return { modifiedCount };
            },
        };
        throw new Error(`Unexpected collection ${name}`);
    } };
    const client = { startSession: () => Object.assign(session, {
        async withTransaction(callback: () => Promise<void>) {
            const beforeWork = work; const beforeFiles = files;
            transaction = true;
            try { await callback(); if (options.failedCommit) throw new Error('Commit failed'); }
            catch (error) { work = beforeWork; files = beforeFiles; throw error; }
            finally { transaction = false; }
        }, async endSession() {},
    }) };
    const modules = {
        mongodb: { ObjectId },
        '@/lib/auth0-compat': { withApiAuthRequired: (fn: any) => fn, getSession: async () => ({ user: { sub: options.subject ?? `auth0|${owner}` } }) },
        '@/lib/mongodb': { connectToDatabase: async () => { connections++; return { db, client }; } },
        '@/lib/academic-work-correction': correction,
        '@/lib/payments/transactions': { runPaymentTransaction },
    };
    const source = readFileSync(new URL('../../api/put/academicWork/route.ts', import.meta.url), 'utf8');
    const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const exports: any = {};
    runInNewContext(output, { exports, Response, require: (name: string) => { assert.ok(name in modules, name); return modules[name]; } });
    const request = (body: any = { academicWork: { _id: workId, userId: owner, topicos: { resu: 'Corrigido' } }, newFiles: [{ fileId, slotIndex: 0 }] }) =>
        exports.PUT(new Request('https://example.test', { method: 'PUT', body: JSON.stringify(body) }));
    return { request, work: () => work, files: () => files, collections, connections: () => connections };
}

test('correção usa metadados reais, preserva histórico e vincula anexos atomicamente', async () => {
    const h = harness();
    const response = await h.request({ academicWork: { _id: workId, topicos: { resu: 'Corrigido' }, titulo: 'Forjado', autores: [] },
        newFiles: [{ fileId, slotIndex: 0, url: 'https://forjado.test', size: -1, uploadDate: 'invalid' }] });
    assert.equal(response.status, 200);
    assert.equal(h.work().status, 'Em Avaliação');
    assert.equal(h.work().titulo, 'Original');
    assert.equal(h.work().autores.length, 1);
    assert.equal(h.work().avaliadorComentarios.length, 1);
    assert.equal(h.work().arquivos[1].uploadDate.toISOString(), '2026-10-08T15:00:00.000Z');
    assert.equal(h.work().arquivos[1].url, 'https://blob.test/corrigido');
    assert.equal(h.work().totalArquivos, 2);
    assert.equal(h.work().tamanhoTotalBytes, 150);
    assert.equal(String(h.files()[0].submissionId), workId);
    assert.ok(!h.collections.includes('trabalhos_config'), 'correction must not consult the submission deadline');
});

test('texto apenas ou sem mudanças é aceito mesmo após o fechamento', async () => {
    const h = harness();
    assert.equal((await h.request({ academicWork: { _id: workId, topicos: null }, newFiles: [] })).status, 200);
    assert.equal(h.work().arquivos.length, 1);
    assert.equal(h.work().status, 'Em Avaliação');
    assert.deepEqual(Object.keys(h.work().topicos), correction.WORK_TOPICS.map(topic => topic.key));
});

test('dono, estado, identificadores e limites de tópicos são conferidos', async () => {
    assert.equal((await harness({ owner: other }).request()).status, 404);
    assert.equal((await harness({ status: 'Aceito' }).request()).status, 409);
    assert.equal((await harness({ missing: true }).request()).status, 404);
    for (const body of [null, {}, { academicWork: { _id: workId }, newFiles: [{ fileId: 'inválido' }] },
        { academicWork: { _id: workId }, newFiles: [{ fileId }, { fileId }] }]) {
        const h = harness(); assert.equal((await h.request(body)).status, 400); assert.equal(h.connections(), 0);
    }
    const h = harness();
    assert.equal((await h.request({ academicWork: { _id: workId, topicos: { resu: 'x'.repeat(1001) } }, newFiles: [] })).status, 422);
    assert.equal(h.connections(), 0);
});

test('rejeita arquivos não confirmados, alheios, vinculados ou incompatíveis', async () => {
    for (const files of [[], [upload({ userId: other })], [upload({ purpose: 'submission' })],
        [upload({ submissionId: new ObjectId(workId) })], [upload({ uploadDate: undefined })],
        [upload({ contentType: 'text/plain' })], [upload({ size: 2000 })], [upload({ originalName: 'arquivo.exe' })]]) {
        const h = harness({ files });
        assert.equal((await h.request()).status, 422);
        assert.equal(h.work().status, 'Necessita de Alteração');
        assert.equal(h.work().arquivos.length, 1);
    }
});

test('falha de vínculo, disputa de status/exclusão ou commit não deixa gravação parcial', async () => {
    for (const options of [{ failedLink: true }, { lostWrite: true }, { failedCommit: true }]) {
        const h = harness(options);
        assert.equal((await h.request()).status, options.failedCommit ? 500 : 409);
        assert.equal(h.work().status, 'Necessita de Alteração');
        assert.equal(h.work().arquivos.length, 1);
        assert.equal(h.files()[0].submissionId, undefined);
    }
});

test('reenvio repetido não duplica anexos', async () => {
    const h = harness();
    assert.equal((await h.request()).status, 200);
    assert.equal((await h.request()).status, 409);
    assert.equal(h.work().arquivos.length, 2);
});

test('cliente antigo sem slotIndex recebe atribuição consistente por formato', () => {
    const docId = new ObjectId();
    const files = [upload(), upload({ _id: docId, originalName: 'resumo.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })];
    const attachments = correction.correctionAttachments([{ fileId }, { fileId: String(docId) }], files, requirements, 1024);
    assert.deepEqual(attachments.map(file => file.slotIndex), [1, 0]);
    assert.throws(() => correction.correctionAttachments([{ fileId, slotIndex: 0 }, { fileId: String(docId), slotIndex: 0 }], files, requirements, 1024));
});

test('dados legados incompletos podem ser apresentados sem quebrar a página', () => {
    assert.deepEqual(correction.workComments('Parecer antigo'), [{ comentario: 'Parecer antigo' }]);
    assert.deepEqual(correction.workComments([null, {}, { comentario: 'Parecer' }]), [{ comentario: 'Parecer' }]);
    assert.equal(correction.workDate(undefined), 'Data não disponível');
    assert.equal(correction.workDate('inválida'), 'Data não disponível');
    assert.deepEqual(correction.correctionRequirements(undefined), []);
});
