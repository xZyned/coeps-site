import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import * as correction from '../academic-work-correction.ts';
import * as files from '../academic-work-files.ts';
import { readJsonResponse } from '../client/fetchWithTimeout.ts';

const require = createRequire(import.meta.url);
const work = {
    _id: '507f1f77bcf86cd799439013', userId: '507f1f77bcf86cd799439011', titulo: 'Trabalho', status: 'Necessita de Alteração',
    topicos: null, autores: [], arquivos: [{ fileName: 'anterior.pdf', url: 'https://example.test/anterior.pdf' }],
    avaliadorComentarios: 'Parecer legado', configuracaoModalidade: { limite_maximo_de_postagem: 1024, chunk_tamanho: 512, chunk_limite: 512,
        requisitos_arquivos: [{ titulo: 'Resumo', formatos: ['.pdf'] }, { titulo: 'Trabalho', formatos: ['.docx'] }] },
};

async function mount(context: any, upload = async (_file: File, _options: any) => 'confirmed') {
    const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test' });
    const prior = { window: globalThis.window, document: globalThis.document, act: globalThis['IS_REACT_ACT_ENVIRONMENT'] };
    globalThis.window = dom.window as any;
    globalThis.document = dom.window.document;
    globalThis['IS_REACT_ACT_ENVIRONMENT'] = true;
    const removed: string[] = [];
    const sent: any[] = [];
    const element = React.createElement;
    const modules = {
        'react': React, 'react/jsx-runtime': require('react/jsx-runtime'), './style.css': {},
        'dompurify': { sanitize: (value: string) => value },
        'next/navigation': { useRouter: () => ({ push() {} }) },
        '@/components/cieps': {
            PageShell: ({ children }: any) => element('main', null, children),
            Button: ({ children, onClick, disabled }: any) => element('button', { onClick, disabled, type: 'button' }, children),
            Modal: ({ open, children }: any) => open ? element('div', { role: 'dialog' }, children) : null,
            StatusBanner: ({ title, children }: any) => element('section', null, title, children),
            AsyncStatePanel: () => null,
        },
        '@/lib/client/fetchWithTimeout': { readJsonResponse, fetchWithTimeout: async (_url: string, init: RequestInit) => {
            sent.push(JSON.parse(String(init.body))); return Response.json({ success: true });
        } },
        '@/lib/client/correction-upload': { uploadCorrectionFile: upload, removeCorrectionUpload: async ({ fileId }: any) => { removed.push(fileId); } },
        '@/lib/academic-work-correction': correction,
        '@/lib/academic-work-files': files,
    };
    const source = readFileSync(new URL('../../(auth)/painel/trabalhos/correcao/[trabalhoId]/page.tsx', import.meta.url), 'utf8');
    const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const exports: any = {};
    runInNewContext(`${output}\nexports.Form = CorrectionForm;`, { exports, crypto: globalThis.crypto,
        require: (name: string) => { assert.ok(name in modules, name); return modules[name]; } });
    const root = createRoot(dom.window.document.getElementById('root')!);
    await act(async () => { root.render(element(React.StrictMode, null, element(exports.Form, { work }))); });
    context.after(async () => {
        await act(async () => root.unmount()); dom.window.close();
        globalThis.window = prior.window; globalThis.document = prior.document; globalThis['IS_REACT_ACT_ENVIRONMENT'] = prior.act;
    });
    const select = async (index: number, file: File) => {
        const input = dom.window.document.querySelectorAll('input[type=file]')[index];
        Object.defineProperty(input, 'files', { configurable: true, value: [file] });
        await act(async () => { input.dispatchEvent(new dom.window.Event('change', { bubbles: true })); });
    };
    const click = async (text: string) => {
        const button = [...dom.window.document.querySelectorAll('button')].find(button => button.textContent === text);
        assert.ok(button, text);
        await act(async () => { button.click(); });
    };
    return { document: dom.window.document, select, click, sent, removed };
}

test('formulário aceita dados legados e mostra nomes completos e campos multilinha', async context => {
    const h = await mount(context);
    assert.ok(h.document.body.textContent.includes('Parecer legado'));
    assert.ok(h.document.body.textContent.includes('Data não disponível'));
    assert.ok(h.document.body.textContent.includes('Discussão e resultados'));
    assert.equal(h.document.querySelectorAll('textarea').length, 8);
    assert.equal(h.document.querySelector('textarea')!.maxLength, 1000);
    await h.click('Enviar correção');
    await h.click('Confirmar envio');
    assert.deepEqual(h.sent[0].newFiles, []);
    assert.ok(h.document.body.textContent.includes('Correção enviada com sucesso'));
});

test('arquivo inválido não desloca o upload válido de outro requisito, inclusive em StrictMode', async context => {
    const uploaded: string[] = [];
    const h = await mount(context, async file => { uploaded.push(file.name); return 'valid-id'; });
    await h.select(0, new File(['x'.repeat(2048)], 'grande.pdf'));
    assert.equal(uploaded.length, 0);
    assert.ok(h.document.body.textContent.includes('excede o limite'));
    await h.select(1, new File(['docx'], 'valido.docx'));
    assert.deepEqual(uploaded, ['valido.docx']);
    assert.ok(h.document.body.textContent.includes('Arquivo pronto para envio'));
    await h.click('Enviar correção');
    await h.click('Confirmar envio');
    assert.deepEqual(h.sent[0].newFiles, [{ fileId: 'valid-id', slotIndex: 1 }]);
});

test('arquivo removido enquanto envia não volta à seleção após resposta tardia', async context => {
    let complete: (id: string) => void;
    const pending = new Promise<string>(resolve => { complete = resolve; });
    const h = await mount(context, async () => pending);
    await h.select(0, new File(['pdf'], 'corrigido.pdf'));
    await h.click('Remover arquivo selecionado');
    await act(async () => { complete!('late-id'); await pending; });
    assert.deepEqual(h.removed, ['late-id']);
    assert.ok(!h.document.body.textContent.includes('Arquivo pronto para envio'));
    await h.click('Enviar correção'); await h.click('Confirmar envio');
    assert.deepEqual(h.sent[0].newFiles, []);
});
