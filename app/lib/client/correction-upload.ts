import { fetchWithTimeout, readJsonResponse } from './fetchWithTimeout.ts';

type UploadResponse = { data?: { _id?: string }; chunkId?: string };

export async function removeCorrectionUpload(body: { fileId: string } | { chunkIds: string[] }) {
    if ('chunkIds' in body && !body.chunkIds.length) return;
    const response = await fetchWithTimeout('/api/delete/pendingWorkFile', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }, 60_000);
    const result = await readJsonResponse<{ warning?: string }>(response);
    if (result?.warning) throw new Error(result.warning);
}

export async function uploadCorrectionFile(file: File, options: {
    chunkSize: number; chunkLimit: number; isActive: () => boolean; onProgress: (progress: number) => void;
}): Promise<string | null> {
    const chunkIds: string[] = [];
    let completedId: string | undefined;
    const ensureActive = () => { if (!options.isActive()) throw new Error('Upload cancelado.'); };
    try {
        ensureActive();
        let result: UploadResponse;
        // Stay below the serverless request limit even with an old modality config.
        const threshold = Number.isFinite(options.chunkLimit) && options.chunkLimit > 0
            ? Math.min(options.chunkLimit, 4 * 1024 * 1024) : 4 * 1024 * 1024;
        if (file.size <= threshold) {
            const body = new FormData();
            body.append('file', file);
            body.append('originalFileName', file.name);
            body.append('purpose', 'correction');
            options.onProgress(20);
            result = await readJsonResponse<UploadResponse>(await fetchWithTimeout('/api/post/uploadBlobSingle', { method: 'POST', body }, 120_000));
        } else {
            const chunkSize = Number.isInteger(options.chunkSize) && options.chunkSize > 0
                ? Math.min(options.chunkSize, 4 * 1024 * 1024) : 4 * 1024 * 1024;
            const totalChunks = Math.ceil(file.size / chunkSize);
            if (totalChunks > 100) throw new Error('O arquivo exige muitas partes. Entre em contato com a organização.');
            const name = crypto.randomUUID();
            for (let index = 0; index < totalChunks; index++) {
                ensureActive();
                const body = new FormData();
                body.append('chunk', file.slice(index * chunkSize, Math.min((index + 1) * chunkSize, file.size)));
                body.append('chunkIndex', String(index));
                body.append('totalChunks', String(totalChunks));
                body.append('fileName', name);
                const part = await readJsonResponse<UploadResponse>(await fetchWithTimeout('/api/post/uploadBlobChunk', { method: 'POST', body }, 120_000));
                if (!part?.chunkId) throw new Error('O servidor não confirmou uma parte do arquivo.');
                chunkIds.push(part.chunkId);
                options.onProgress(Math.round((index + 1) / totalChunks * 90));
            }
            ensureActive();
            result = await readJsonResponse<UploadResponse>(await fetchWithTimeout('/api/post/reconstructBlobFile', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chunkFileName: name, finalFileName: name, originalName: file.name,
                    purpose: 'correction', chunkIds, totalSize: file.size }),
            }, 300_000));
        }
        completedId = result?.data?._id;
        if (!completedId) throw new Error('O servidor não confirmou o arquivo.');
        if (!options.isActive()) {
            await removeCorrectionUpload({ fileId: completedId });
            return null;
        }
        options.onProgress(100);
        return completedId;
    } catch (error) {
        if (!completedId && chunkIds.length) {
            try { await removeCorrectionUpload({ chunkIds }); }
            catch { throw new Error('O upload falhou e a limpeza das partes ficou pendente. Tente novamente.'); }
        }
        throw error;
    }
}
