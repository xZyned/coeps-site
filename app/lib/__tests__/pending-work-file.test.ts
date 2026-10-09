import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { ObjectId } from 'mongodb';

test('limpeza permite submissão e correção pendentes, protegendo dono e arquivos vinculados', async () => {
    for (const [purpose, owner, linked, expected] of [
        ['correction', 'owner', false, true], ['submission', 'owner', false, true],
        ['correction', 'other', false, false], ['correction', 'owner', true, false],
        ['other', 'owner', false, false],
    ] as const) {
        const fileId = new ObjectId();
        const deleted: string[] = [];
        let present = true;
        const db = { collection: (name: string) => {
            assert.equal(name, 'trabalhos_blob');
            return { findOneAndDelete: async (filter: any) => {
                assert.equal(filter.submissionId.$exists, false);
                assert.equal(String(filter._id), String(fileId));
                if (!filter.purpose.$in.includes(purpose) || filter.userId !== owner || linked) return null;
                present = false;
                return { url: 'https://blob.test/pending' };
            } };
        } };
        const modules = {
            mongodb: { ObjectId }, 'next/server': { NextResponse: { json: Response.json } },
            '@vercel/blob': { del: async (url: string) => { deleted.push(url); } },
            '@/lib/mongodb': { connectToDatabase: async () => ({ db }) },
            '@/lib/auth0-compat': { withApiAuthRequired: (fn: any) => fn, getSession: async () => ({ user: { sub: 'auth0|owner' } }) },
        };
        const source = readFileSync(new URL('../../api/delete/pendingWorkFile/route.ts', import.meta.url), 'utf8');
        const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
        const exports: any = {};
        runInNewContext(output, { exports, require: (name: string) => { assert.ok(name in modules, name); return modules[name]; } });
        const result = await exports.DELETE(new Request('https://example.test', { method: 'DELETE', body: JSON.stringify({ fileId: String(fileId) }) }));
        assert.equal(result.status, 200);
        assert.equal(deleted.length, expected ? 1 : 0);
        assert.equal(present, !expected);
    }
});
