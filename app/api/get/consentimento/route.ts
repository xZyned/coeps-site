import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../lib/mongodb';
import { getSession, withApiAuthRequired } from '@/lib/auth0-compat';
import { hasCurrentConsent, LGPD_CONSENT_VERSION } from '@/lib/registration-consent';
import { isRegistrationProfileComplete } from '@/lib/registration-gate';

export const dynamic = 'force-dynamic';

// Informa se o usuário precisa (re)aceitar a Política de Privacidade e os
// Termos de Uso. Só é exigido de quem já tem cadastro completo: quem ainda
// não concluiu o cadastro aceita no próprio formulário de dados iniciais.
export const GET = withApiAuthRequired(async function GET(request: Request) {
    try {
        const { user } = await getSession(request);
        const userId = String(user?.sub || '').replace(/^auth0\|/, '');
        if (!ObjectId.isValid(userId)) {
            return Response.json({ required: false, version: LGPD_CONSENT_VERSION });
        }

        const { db } = await connectToDatabase();
        const userDb = await db.collection('usuarios').findOne(
            { _id: new ObjectId(userId) },
            { projection: { isPos_registration: 1, informacoes_usuario: 1, consentimentos: 1 } },
        );

        const required = isRegistrationProfileComplete(userDb) && !hasCurrentConsent(userDb?.consentimentos);
        return Response.json({ required, version: LGPD_CONSENT_VERSION });
    } catch {
        return Response.json(
            { error: 'internal_server_error', message: 'Não foi possível verificar seus consentimentos.' },
            { status: 500 },
        );
    }
});
