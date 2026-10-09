import assert from 'node:assert/strict';
import test from 'node:test';
import { uploadCorrectionFile } from '../client/correction-upload.ts';

const json = (body: unknown, status = 200) => Response.json(body, { status });
const options = () => ({ chunkSize: 4, chunkLimit: 8, isActive: () => true, onProgress: (_value: number) => {} });

test('upload simples conserva nome e conteúdo do arquivo selecionado', async context => {
    const file = new File(['%PDF-test'], 'corrigido.pdf', { type: 'application/pdf' });
    context.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
        assert.equal(url, '/api/post/uploadBlobSingle');
        const body = init.body as FormData;
        assert.equal(body.get('originalFileName'), file.name);
        assert.equal(body.get('purpose'), 'correction');
        assert.equal(await (body.get('file') as File).text(), '%PDF-test');
        return json({ data: { _id: 'confirmed' } });
    });
    assert.equal(await uploadCorrectionFile(file, { ...options(), chunkLimit: 100 }), 'confirmed');
});

test('remoção durante upload simples limpa resposta tardia e não restaura seleção', async context => {
    let active = true;
    const removed: string[] = [];
    context.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
        if (url === '/api/post/uploadBlobSingle') { active = false; return json({ data: { _id: 'late' } }); }
        assert.equal(url, '/api/delete/pendingWorkFile');
        removed.push(JSON.parse(String(init.body)).fileId);
        return json({ success: true });
    });
    assert.equal(await uploadCorrectionFile(new File(['pdf'], 'a.pdf'), { ...options(), isActive: () => active }), null);
    assert.deepEqual(removed, ['late']);
});

test('upload em partes reconstrói o arquivo correto e mantém o nome original', async context => {
    const chunks: string[] = [];
    context.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
        if (url === '/api/post/uploadBlobChunk') {
            const body = init.body as FormData;
            chunks.push(await (body.get('chunk') as Blob).text());
            assert.equal(Number(body.get('chunkIndex')), chunks.length - 1);
            return json({ chunkId: `chunk-${chunks.length}` });
        }
        assert.equal(url, '/api/post/reconstructBlobFile');
        const body = JSON.parse(String(init.body));
        assert.equal(body.originalName, 'texto.docx');
        assert.equal(body.purpose, 'correction');
        assert.equal(body.totalSize, 10);
        assert.deepEqual(body.chunkIds, ['chunk-1', 'chunk-2', 'chunk-3']);
        return json({ data: { _id: 'final' } });
    });
    assert.equal(await uploadCorrectionFile(new File(['0123456789'], 'texto.docx'), options()), 'final');
    assert.equal(chunks.join(''), '0123456789');
});

test('cancelamento durante uma parte limpa as partes confirmadas sem reconstruir', async context => {
    let active = true;
    const calls: string[] = [];
    context.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
        calls.push(url);
        if (url === '/api/post/uploadBlobChunk') { active = false; return json({ chunkId: 'part' }); }
        assert.deepEqual(JSON.parse(String(init.body)), { chunkIds: ['part'] });
        return json({ success: true });
    });
    await assert.rejects(uploadCorrectionFile(new File(['0123456789'], 'a.pdf'), { ...options(), isActive: () => active }), /cancelado/);
    assert.deepEqual(calls, ['/api/post/uploadBlobChunk', '/api/delete/pendingWorkFile']);
});

test('remoção durante reconstrução limpa o arquivo final', async context => {
    let active = true;
    const removed: string[] = [];
    context.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
        if (url === '/api/post/uploadBlobChunk') return json({ chunkId: `chunk-${(init.body as FormData).get('chunkIndex')}` });
        if (url === '/api/post/reconstructBlobFile') { active = false; return json({ data: { _id: 'late-final' } }); }
        removed.push(JSON.parse(String(init.body)).fileId);
        return json({ success: true });
    });
    assert.equal(await uploadCorrectionFile(new File(['0123456789'], 'a.pdf'), { ...options(), isActive: () => active }), null);
    assert.deepEqual(removed, ['late-final']);
});

test('falha de reconstrução limpa partes e não devolve ID como sucesso', async context => {
    let removed = false;
    context.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
        if (url === '/api/post/uploadBlobChunk') return json({ chunkId: `chunk-${(init.body as FormData).get('chunkIndex')}` });
        if (url === '/api/post/reconstructBlobFile') return json({ message: 'Tipo inválido' }, 415);
        removed = true;
        return json({ success: true });
    });
    await assert.rejects(uploadCorrectionFile(new File(['0123456789'], 'a.pdf'), options()), /Tipo inválido/);
    assert.equal(removed, true);
});
