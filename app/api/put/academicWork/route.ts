import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { getSession, withApiAuthRequired } from '@/lib/auth0-compat';
import { runPaymentTransaction } from '@/lib/payments/transactions';
import { correctionAttachments, correctionRequirements, correctionTopics } from '@/lib/academic-work-correction';

class CorrectionError extends Error {
    constructor(public code: string, message: string, public status: number) { super(message); }
}

export const PUT: any = withApiAuthRequired(async function PUT(request) {
    try {
        const session = await getSession(request);
        const subject = typeof session?.user?.sub === 'string' ? /^auth0\|([a-f\d]{24})$/i.exec(session.user.sub) : null;
        if (!subject) throw new CorrectionError('invalid_session', 'Sessão de usuário inválida.', 401);
        const body = await request.json().catch(() => null);
        const work = body?.academicWork;
        const newFiles = body?.newFiles;
        if (typeof work?._id !== 'string' || !ObjectId.isValid(work._id) || !Array.isArray(newFiles)
            || newFiles.length > 100 || newFiles.some(file => typeof file?.fileId !== 'string' || !ObjectId.isValid(file.fileId))
            || new Set(newFiles.map(file => file.fileId.toLowerCase())).size !== newFiles.length) {
            throw new CorrectionError('invalid_correction', 'Dados da correção inválidos.', 400);
        }
        const userId = subject[1];
        if (work.userId !== undefined && String(work.userId) !== userId) throw new CorrectionError('invalid_owner', 'Você não pode corrigir este trabalho.', 403);
        let topicos: Record<string, string>;
        try { topicos = correctionTopics(work.topicos); }
        catch (error) { throw new CorrectionError('invalid_topics', error.message, 422); }
        const requested = newFiles.map(file => ({ fileId: file.fileId.toLowerCase(), slotIndex: file.slotIndex }));
        const fileIds = requested.map(file => new ObjectId(file.fileId));
        const workId = new ObjectId(work._id);
        const ownerQuery = { _id: workId, userId: new ObjectId(userId) };
        const { db, client } = await connectToDatabase();
        await runPaymentTransaction(client, async mongoSession => {
            const options = { session: mongoSession };
            const current = await db.collection('Dados_do_trabalho').findOne(ownerQuery, options);
            if (!current) throw new CorrectionError('work_not_found', 'Trabalho não encontrado.', 404);
            if (current.status !== 'Necessita de Alteração') throw new CorrectionError('work_changed', 'Este trabalho não está mais disponível para correção. Atualize a lista.', 409);
            const previous = Array.isArray(current.arquivos) ? current.arquivos : [];
            if (previous.some(file => requested.some(item => item.fileId === String(file?.fileId)))) throw new CorrectionError('duplicate_file', 'Um arquivo já está anexado a este trabalho.', 422);
            const fileQuery = { _id: { $in: fileIds }, userId, purpose: 'correction', submissionId: { $exists: false } };
            const uploads = fileIds.length ? await db.collection('trabalhos_blob').find(fileQuery, options).toArray() : [];
            let attachments: ReturnType<typeof correctionAttachments>;
            try {
                attachments = correctionAttachments(requested, uploads, correctionRequirements(current.configuracaoModalidade), current.configuracaoModalidade?.limite_maximo_de_postagem);
            } catch (error) { throw new CorrectionError('invalid_attachments', error.message, 422); }
            const now = new Date();
            if (fileIds.length) {
                const linked = await db.collection('trabalhos_blob').updateMany(fileQuery, {
                    $set: { submissionId: workId, submissionDate: now, status: 'submitted' },
                }, options);
                if (linked.modifiedCount !== fileIds.length) throw new CorrectionError('file_changed', 'Um arquivo mudou durante o envio. Atualize a página.', 409);
            }
            // Requested corrections remain available after the submission deadline.
            const result = await db.collection('Dados_do_trabalho').updateOne({ ...ownerQuery, status: 'Necessita de Alteração' }, {
                $set: { status: 'Em Avaliação', topicos,
                    totalArquivos: previous.length + attachments.length,
                    tamanhoTotalBytes: [...previous, ...attachments].reduce((sum, file) => sum + (Number.isFinite(file?.size) && file.size > 0 ? file.size : 0), 0),
                },
                $push: { arquivos: { $each: attachments } },
            }, options);
            if (result.matchedCount !== 1) throw new CorrectionError('work_changed', 'O trabalho foi excluído ou alterado durante a correção. Atualize a lista.', 409);
        });
        return Response.json({ success: true, status: 'Em Avaliação', message: 'Correção enviada para avaliação.' });
    } catch (error) {
        if (error instanceof CorrectionError) return Response.json({ error: error.code, message: error.message }, { status: error.status });
        return Response.json({ error: 'internal_server_error', message: 'Não foi possível confirmar a correção. Consulte a lista antes de tentar novamente.' }, { status: 500 });
    }
});
