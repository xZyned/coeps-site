import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../lib/mongodb';
import { getSession, withApiAuthRequired } from '@/lib/auth0-compat';
import { buildConsentUpdate, LGPD_CONSENT_VERSION } from '@/lib/registration-consent';

export const POST = withApiAuthRequired(async function POST(request: Request) {
    try {
        const { user } = await getSession(request);
        const userId = String(user?.sub || '').replace(/^auth0\|/, '');
        if (!ObjectId.isValid(userId)) {
            return Response.json(
                { error: 'invalid_user_id', message: 'Identificador de usuário inválido.' },
                { status: 400 },
            );
        }

        const data = await request.json().catch(() => null);
        if (data?.lgpdAccepted !== true || data?.termsAccepted !== true) {
            return Response.json(
                { error: 'consent_required', message: 'Aceite a Política de Privacidade e os Termos de Uso para continuar.' },
                { status: 400 },
            );
        }
        if (data.version !== LGPD_CONSENT_VERSION) {
            return Response.json(
                { error: 'consent_version_outdated', message: 'Os termos foram atualizados. Recarregue a página e leia a versão atual.' },
                { status: 409 },
            );
        }

        const owner = new ObjectId(userId);
        const { db } = await connectToDatabase();
        const userDb = await db.collection('usuarios').findOne(
            { _id: owner },
            { projection: { consentimentos: 1 } },
        );
        if (!userDb) {
            return Response.json(
                { error: 'user_not_found', message: 'Não foi possível encontrar sua conta.' },
                { status: 404 },
            );
        }

        // O filtro de versão evita arquivar o histórico duas vezes se o
        // aceite for enviado em duplicidade.
        await db.collection('usuarios').updateOne(
            {
                _id: owner,
                $or: [
                    { 'consentimentos.lgpd.versao': { $ne: LGPD_CONSENT_VERSION } },
                    { 'consentimentos.lgpd.aceito': { $ne: true } },
                    { 'consentimentos.termosUso.versao': { $ne: LGPD_CONSENT_VERSION } },
                    { 'consentimentos.termosUso.aceito': { $ne: true } },
                ],
            },
            buildConsentUpdate(userDb.consentimentos, new Date()),
        );

        return Response.json({ success: true });
    } catch {
        return Response.json(
            { error: 'internal_server_error', message: 'Não foi possível registrar seu aceite. Tente novamente.' },
            { status: 500 },
        );
    }
});
