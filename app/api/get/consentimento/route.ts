import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../lib/mongodb';
import { getSession, withApiAuthRequired } from '@/lib/auth0-compat';
import { hasCurrentConsent, LGPD_CONSENT_VERSION } from '@/lib/registration-consent';
import { isRegistrationProfileComplete } from '@/lib/registration-gate';

export const dynamic = 'force-dynamic';

// Informa se o usuário já aceitou a versão atual da Política de Privacidade e
// dos Termos de Uso (accepted) e se o painel deve pedir o reaceite (required).
// O reaceite só é exigido de quem já tem cadastro completo: os demais aceitam
// antes de pagar ou no formulário de dados iniciais.
export const GET = withApiAuthRequired(async function GET(request: Request) {
    try {
        const { user } = await getSession(request);
        const userId = String(user?.sub || '').replace(/^auth0\|/, '');
        if (!ObjectId.isValid(userId)) {
            return Response.json({ accepted: false, required: false, version: LGPD_CONSENT_VERSION });
        }

        const { db } = await connectToDatabase();
        const userDb = await db.collection('usuarios').findOne(
            { _id: new ObjectId(userId) },
            { projection: { isPos_registration: 1, informacoes_usuario: 1, consentimentos: 1 } },
        );

        const accepted = hasCurrentConsent(userDb?.consentimentos);
        const required = isRegistrationProfileComplete(userDb) && !accepted;
        return Response.json({ accepted, required, version: LGPD_CONSENT_VERSION });
    } catch {
        return Response.json(
            { error: 'internal_server_error', message: 'Não foi possível verificar seus consentimentos.' },
            { status: 500 },
        );
    }
});
