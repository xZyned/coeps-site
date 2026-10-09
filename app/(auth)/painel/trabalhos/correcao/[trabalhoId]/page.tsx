'use client';

import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { useRouter } from 'next/navigation';
import { AsyncStatePanel, Button, Modal, PageShell, StatusBanner } from '@/components/cieps';
import { fetchWithTimeout, readJsonResponse } from '@/lib/client/fetchWithTimeout';
import { removeCorrectionUpload, uploadCorrectionFile } from '@/lib/client/correction-upload';
import { correctionRequirements, WORK_TOPICS, workComments, workDate } from '@/lib/academic-work-correction';
import { normalizedWorkFileFormats, validateWorkFile } from '@/lib/academic-work-files';
import type { IAcademicWorks } from '@/lib/types/academicWorks/academicWorks.t';
import './style.css';

type Slot = { token: string; name: string; progress: number; status: 'uploading' | 'completed' | 'error'; fileId?: string; error?: string };

export default function Page({ params }: { params: Promise<{ trabalhoId: string }> }) {
    const [work, setWork] = useState<IAcademicWorks | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(0);
    useEffect(() => {
        let active = true;
        void (async () => {
            try {
                const { trabalhoId } = await params;
                const response = await fetchWithTimeout(`/api/get/usuariosTrabalhos/${trabalhoId}`, { cache: 'no-store' });
                const result = await readJsonResponse<{ data: IAcademicWorks }>(response);
                if (!result?.data) throw new Error('O trabalho solicitado não está disponível.');
                if (active) setWork(result.data);
            } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Não foi possível carregar o trabalho.'); }
            finally { if (active) setLoading(false); }
        })();
        return () => { active = false; };
    }, [params, version]);
    if (loading || error || !work) return <PageShell>
        <AsyncStatePanel status={loading ? 'loading' : 'error'} loadingTitle="Carregando trabalho para correção"
            errorTitle="Trabalho indisponível" message={error ?? 'O trabalho não foi encontrado.'}
            onRetry={() => { setError(null); setLoading(true); setVersion(value => value + 1); }} />
    </PageShell>;
    return <CorrectionForm key={String(work._id)} work={work} />;
}

function CorrectionForm({ work }: { work: IAcademicWorks }) {
    const router = useRouter();
    const requirements = correctionRequirements(work.configuracaoModalidade);
    const [topics, setTopics] = useState<Record<string, string>>(() => Object.fromEntries(WORK_TOPICS.map(({ key }) =>
        [key, typeof work.topicos?.[key] === 'string' ? work.topicos[key] : ''])));
    const slotsRef = useRef<Array<Slot | null>>(requirements.map(() => null));
    const [slots, setSlotState] = useState<Array<Slot | null>>(() => requirements.map(() => null));
    const mounted = useRef(true);
    const submittingRef = useRef(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cleanupWarning, setCleanupWarning] = useState<string | null>(null);
    const comments = workComments(work.avaliadorComentarios);
    const previousFiles = Array.isArray(work.arquivos) ? work.arquivos.filter(Boolean) : [];
    const maxBytes = Math.min(work.configuracaoModalidade?.limite_maximo_de_postagem || 0, 100 * 1024 * 1024);
    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    const setSlots = (value: Array<Slot | null>) => {
        slotsRef.current = value;
        if (mounted.current) setSlotState(value);
    };
    const cleanup = async (fileId: string) => {
        try { await removeCorrectionUpload({ fileId }); }
        catch { if (mounted.current) setCleanupWarning('O arquivo saiu da seleção, mas a limpeza no armazenamento ficou pendente.'); }
    };
    const remove = (index: number) => {
        if (submittingRef.current) return;
        const old = slotsRef.current[index];
        setSlots(slotsRef.current.map((slot, i) => i === index ? null : slot));
        if (old?.fileId) void cleanup(old.fileId);
    };
    const selectFile = async (index: number, file: File) => {
        if (submittingRef.current) return;
        const validation = validateWorkFile(file, requirements[index], maxBytes);
        if (validation) { setError(validation); return; }
        remove(index);
        setError(null);
        const token = crypto.randomUUID();
        const current = () => mounted.current && slotsRef.current[index]?.token === token;
        const update = (patch: Partial<Slot>) => {
            if (current()) setSlots(slotsRef.current.map((slot, i) => i === index ? { ...slot!, ...patch } : slot));
        };
        setSlots(slotsRef.current.map((slot, i) => i === index ? { token, name: file.name, status: 'uploading', progress: 0 } : slot));
        try {
            const fileId = await uploadCorrectionFile(file, {
                chunkSize: work.configuracaoModalidade?.chunk_tamanho,
                chunkLimit: work.configuracaoModalidade?.chunk_limite,
                isActive: current, onProgress: progress => update({ progress }),
            });
            if (fileId) {
                if (current()) update({ fileId, status: 'completed', progress: 100 });
                else await cleanup(fileId);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Não foi possível enviar o arquivo.';
            if (current()) update({ status: 'error', error: message });
            else if (mounted.current && message !== 'Upload cancelado.') setCleanupWarning(message);
        }
    };
    const send = async () => {
        if (submittingRef.current) return;
        if (slotsRef.current.some(slot => slot && (slot.status !== 'completed' || !slot.fileId))) {
            setError('Aguarde os uploads ou remova os arquivos com erro.'); return;
        }
        const invalidTopic = WORK_TOPICS.find(({ key, limit }) => topics[key].length > limit);
        if (invalidTopic) { setError(`Revise o limite de caracteres de ${invalidTopic.label}.`); return; }
        submittingRef.current = true;
        setSubmitting(true); setError(null);
        try {
            const response = await fetchWithTimeout('/api/put/academicWork', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ academicWork: { _id: work._id, userId: work.userId, topicos: topics },
                    newFiles: slotsRef.current.flatMap((slot, slotIndex) => slot ? [{ fileId: slot.fileId, slotIndex }] : []) }),
            }, 120_000);
            await readJsonResponse(response);
            setSuccess(true);
        } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível confirmar o envio. Consulte a lista antes de tentar novamente.'); }
        finally { submittingRef.current = false; setSubmitting(false); }
    };
    if (success) return <PageShell>
        <StatusBanner tone="success" title="Correção enviada com sucesso">
            Seu trabalho voltou para Em Avaliação. Acompanhe o próximo parecer na lista de trabalhos.
        </StatusBanner>
        <Button className="mt-6" onClick={() => router.push('/painel/trabalhos')}>Voltar aos trabalhos</Button>
    </PageShell>;

    return <PageShell>
        <div className="mx-auto max-w-5xl space-y-6 text-tinta">
            <header className="space-y-3">
                <Button variant="ghost" onClick={() => router.push('/painel/trabalhos')} disabled={submitting}>Voltar aos trabalhos</Button>
                <h1 className="text-3xl font-bold">Corrigir trabalho</h1>
                <h2 className="text-xl">{work.titulo}</h2>
                <StatusBanner tone="warning" title="Necessita de Alteração">
                    Leia o parecer, revise os textos e anexe novas versões dos arquivos quando necessário.
                    A correção solicitada permanece disponível após o fechamento das submissões.
                </StatusBanner>
            </header>
            <section className="rounded-xl border border-linha bg-white p-6 space-y-4">
                <h2 className="text-xl font-semibold">Comentários dos avaliadores</h2>
                {!comments.length && <p>Nenhum comentário disponível.</p>}
                {[...comments].reverse().map((comment, index) => <article key={index} className="border-l-4 border-goles pl-4">
                    {index === 0 && <strong className="text-goles">Última avaliação</strong>}
                    <p className="text-sm text-muted">{workDate(comment.date)}</p>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.comentario) }} />
                </article>)}
            </section>
            <section className="rounded-xl border border-linha bg-white p-6 space-y-3">
                <h2 className="text-xl font-semibold">Autores</h2>
                <p>Para alterações no título ou nos autores, entre em contato com a organização.</p>
                {(Array.isArray(work.autores) ? work.autores : []).filter(Boolean).map((author, index) => <p key={index}>
                    {author.nome}{author.isOrientador ? ' — Orientador' : ''}
                </p>)}
            </section>
            <fieldset disabled={submitting} className="space-y-6">
                <section className="rounded-xl border border-linha bg-white p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Tópicos do trabalho</h2>
                    {WORK_TOPICS.map(({ key, label, limit }) => <div key={key}>
                        <label className="block font-medium" htmlFor={`topic-${key}`}>{label}</label>
                        <textarea id={`topic-${key}`} rows={key === 'pchave' ? 2 : 4} maxLength={limit}
                            value={topics[key]} onChange={event => setTopics(previous => ({ ...previous, [key]: event.target.value }))}
                            aria-describedby={`count-${key}`} className="mt-1 w-full rounded-md border border-linha p-3" />
                        <p id={`count-${key}`} className="text-sm text-muted">{topics[key].length}/{limit} caracteres</p>
                    </div>)}
                </section>
                <section className="rounded-xl border border-linha bg-white p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Arquivos anteriores</h2>
                    <p>Os arquivos anteriores serão preservados. As novas versões serão acrescentadas para avaliação.</p>
                    {previousFiles.map((file, index) => <div key={index} className="rounded-md border border-linha p-3">
                        {file.url ? <a className="text-goles underline" href={file.url} target="_blank" rel="noopener noreferrer">{file.originalName || file.fileName || 'Visualizar arquivo'}</a> : <span>Arquivo indisponível</span>}
                        <p className="text-sm text-muted">{workDate(file.uploadDate)}</p>
                    </div>)}
                </section>
                <section className="rounded-xl border border-linha bg-white p-6 space-y-5">
                    <h2 className="text-xl font-semibold">Novas versões dos arquivos</h2>
                    <p>Envie somente os arquivos que precisam de correção. É permitido um novo arquivo por requisito neste reenvio.</p>
                    {!requirements.length && <p>Requisitos de arquivos indisponíveis. Você pode corrigir os textos; para novos anexos, entre em contato com a organização.</p>}
                    {requirements.map((requirement, index) => <div key={index} className="rounded-md border border-linha p-4 space-y-2">
                        <label htmlFor={`file-${index}`} className="block font-semibold">{requirement.titulo}</label>
                        <p className="text-sm text-muted">{normalizedWorkFileFormats(requirement.formatos).join(', ')} · Até {(maxBytes / 1024 / 1024).toLocaleString('pt-BR')} MiB</p>
                        <input id={`file-${index}`} type="file" accept={normalizedWorkFileFormats(requirement.formatos).join(',')}
                            onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void selectFile(index, file); }} />
                        {slots[index] && <div aria-live="polite" className="space-y-2">
                            <p>{slots[index]!.name}</p>
                            {slots[index]!.status === 'uploading' && <p>Enviando: {slots[index]!.progress}%</p>}
                            {slots[index]!.status === 'completed' && <p className="text-green-700">Arquivo pronto para envio</p>}
                            {slots[index]!.error && <p role="alert" className="text-red-700">{slots[index]!.error}</p>}
                            <Button variant="ghost" onClick={() => remove(index)}>Remover arquivo selecionado</Button>
                        </div>}
                    </div>)}
                </section>
            </fieldset>
            {cleanupWarning && <StatusBanner tone="warning" title="Limpeza de arquivos">{cleanupWarning}</StatusBanner>}
            {error && <StatusBanner tone="error" title="Revise a correção">{error}</StatusBanner>}
            <Button loading={submitting} disabled={submitting || slots.some(slot => slot && slot.status !== 'completed')}
                onClick={() => setConfirm(true)}>Enviar correção</Button>
            <Modal open={confirm} onClose={() => !submitting && setConfirm(false)} title="Enviar correção"
                description="O trabalho voltará para avaliação. Novas alterações dependerão de outra solicitação da banca.">
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="ghost" disabled={submitting} onClick={() => setConfirm(false)}>Voltar e revisar</Button>
                    <Button loading={submitting} onClick={() => { setConfirm(false); void send(); }}>Confirmar envio</Button>
                </div>
            </Modal>
        </div>
    </PageShell>;
}
