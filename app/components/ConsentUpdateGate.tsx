'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, StatusBanner, buttonClassName } from '@/app/components/cieps';
import ConsentTerms from '@/app/components/ConsentTerms';
import { ApiResponseError, fetchWithTimeout, readJsonResponse } from '@/lib/client/fetchWithTimeout';

type ConsentStatus = { required?: boolean; version?: string };

// Pede o (re)aceite da Política de Privacidade e dos Termos de Uso a quem tem
// cadastro completo mas não aceitou a versão atual. Bloqueia o painel até o
// aceite; a única outra saída é encerrar a sessão.
export default function ConsentUpdateGate() {
    const [version, setVersion] = useState<string | null>(null);
    const [lgpdAccepted, setLgpdAccepted] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/get/consentimento', { signal: controller.signal, cache: 'no-store' })
            .then((response) => (response.ok ? response.json() : null))
            .then((status: ConsentStatus | null) => {
                if (status?.required && status.version) setVersion(status.version);
            })
            .catch(() => undefined);
        return () => controller.abort();
    }, []);

    if (!version) return null;

    const accept = async () => {
        setSaving(true);
        setError('');
        try {
            const response = await fetchWithTimeout('/api/post/aceitarConsentimento', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lgpdAccepted, termsAccepted, version }),
            });
            // Lança ApiResponseError com a mensagem do servidor quando a resposta não é ok
            await readJsonResponse(response);
            setVersion(null);
        } catch (err) {
            setError(err instanceof ApiResponseError
                ? err.message
                : 'Não foi possível registrar seu aceite. Verifique sua conexão e tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open
            dismissible={false}
            title="Atualizamos nossa Política de Privacidade e Termos de Uso"
            description="Para continuar usando a plataforma, leia a versão atual e confirme seu aceite."
            className="max-w-2xl"
            footer={(
                <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    {/* <a> em vez de Link: /auth/logout é tratado pelo middleware do Auth0 */}
                    <a href="/auth/logout" className={buttonClassName({ variant: 'ghost', className: 'w-full sm:w-auto' })}>
                        Sair
                    </a>
                    <Button
                        onClick={accept}
                        disabled={!lgpdAccepted || !termsAccepted || saving}
                        loading={saving}
                        className="w-full sm:w-auto"
                    >
                        Aceitar e continuar
                    </Button>
                </div>
            )}
        >
            <div className="space-y-4">
                {error && <StatusBanner tone="error" title="Aceite não registrado">{error}</StatusBanner>}
                <ConsentTerms
                    lgpdAccepted={lgpdAccepted}
                    termsAccepted={termsAccepted}
                    onLgpdChange={setLgpdAccepted}
                    onTermsChange={setTermsAccepted}
                />
            </div>
        </Modal>
    );
}
