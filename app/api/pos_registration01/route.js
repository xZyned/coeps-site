import { timingSafeEqual } from 'node:crypto';
import { connectToDatabase } from '../../lib/mongodb';
import {
    UserProvisioningError,
    ensureUserShell,
} from '@/lib/users/user-shell';

function bearerToken(request) {
    return request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
}

function secretsMatch(received, configured) {
    if (!received || !configured) return false;
    const receivedBuffer = Buffer.from(received);
    const configuredBuffer = Buffer.from(configured);
    return receivedBuffer.length === configuredBuffer.length &&
        timingSafeEqual(receivedBuffer, configuredBuffer);
}

/**
 * Compatibilidade temporária com o Action pós-registro do Auth0.
 * O callback síncrono do site também chama o mesmo helper antes de salvar a sessão.
 */
export async function POST(request) {
    const configuredSecret = process.env.AUTH0_POST_REGISTRATION_SECRET;
    if (!configuredSecret) {
        return Response.json(
            { error: 'auth0_post_registration_not_configured' },
            { status: 503 },
        );
    }
    if (!secretsMatch(bearerToken(request), configuredSecret)) {
        return Response.json({ error: 'unauthorized' }, { status: 401 });
    }

    let requestData;
    try {
        requestData = await request.json();
    } catch {
        return Response.json({ error: 'invalid_json' }, { status: 400 });
    }

    try {
        const { db } = await connectToDatabase();
        await ensureUserShell({
            db,
            identity: {
                sub: requestData?.usuario_id,
                email: requestData?.usuario_email,
                name: requestData?.usuario_nome,
            },
        });
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        const code = error instanceof UserProvisioningError
            ? error.code
            : 'USER_SHELL_PROVISIONING_FAILED';
        console.error('AUTH0_USER_SHELL_PROVISIONING_FAILED', { code });
        return Response.json(
            { error: code.toLowerCase() },
            { status: code === 'INVALID_AUTH0_SUBJECT' ? 400 : 500 },
        );
    }
}
