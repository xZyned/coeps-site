import { getSession } from '@/lib/auth0-compat';
//
//
export async function getUserId(request: Request): Promise<string | null> {
    const s = await getSession(request);
    if (!s || !s.user || !s.user.sub) {
        return null; // Usuário não autenticado ou sem ID
    }
    return s.user.sub.replace("auth0|", ""); // Retirando o auth0|

}