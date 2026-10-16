import { LGPD_CONSENT_VERSION } from '@/lib/registration-consent';
import { fetchWithTimeout, readJsonResponse } from './fetchWithTimeout';

export type ConsentStatus = {
    // O usuário já aceitou a versão atual da Política de Privacidade e dos Termos de Uso
    accepted: boolean;
    // O usuário tem cadastro completo e precisa reaceitar (pedido de reaceite no painel)
    required: boolean;
    version: string;
};

export async function fetchConsentStatus(): Promise<ConsentStatus | null> {
    try {
        const response = await fetchWithTimeout('/api/get/consentimento', { cache: 'no-store' });
        return (await readJsonResponse<ConsentStatus>(response)) ?? null;
    } catch {
        return null;
    }
}

// Envia a versão do texto que esta página exibiu: se a página estiver
// desatualizada, o servidor recusa e pede para recarregar. Lança
// ApiResponseError com a mensagem do servidor quando o aceite não é registrado.
export async function acceptCurrentConsent(): Promise<void> {
    const response = await fetchWithTimeout('/api/post/aceitarConsentimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lgpdAccepted: true, termsAccepted: true, version: LGPD_CONSENT_VERSION }),
    });
    await readJsonResponse(response);
}
