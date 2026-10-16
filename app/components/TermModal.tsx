'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Modal, StatusBanner } from '@/components/cieps';
import ConsentTerms from '@/app/components/ConsentTerms';
import { ApiResponseError } from '@/lib/client/fetchWithTimeout';
import { acceptCurrentConsent, fetchConsentStatus } from '@/lib/client/consent';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Exibido antes de concluir qualquer pagamento. Registra o aceite da Política de
// Privacidade e dos Termos de Uso e só então chama onConfirm. Quem já aceitou a
// versão atual segue direto, sem ver a janela de novo.
function TermModalContent({ onClose, onConfirm }: Omit<ModalProps, 'isOpen'>) {
  const [visible, setVisible] = useState(false);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const onConfirmRef = useRef(onConfirm);

  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  useEffect(() => {
    let active = true;
    void fetchConsentStatus().then((status) => {
      if (!active) return;
      if (status?.accepted) {
        onConfirmRef.current();
        return;
      }
      setVisible(true);
    });
    return () => { active = false; };
  }, []);

  if (!visible) return null;

  const confirm = async () => {
    setSaving(true);
    setError('');
    try {
      await acceptCurrentConsent();
      onConfirm();
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
      onClose={onClose}
      title="Política de Privacidade e Termos de Uso"
      description="Leia e aceite antes de concluir o pagamento da sua inscrição no I CIEPS."
      className="max-w-3xl"
      footer={(
        <Button onClick={confirm} disabled={!lgpdAccepted || !termsAccepted || saving} loading={saving}>
          Confirmar e prosseguir
        </Button>
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

export default function TermModal({ isOpen, onClose, onConfirm }: ModalProps) {
  return isOpen ? <TermModalContent onClose={onClose} onConfirm={onConfirm} /> : null;
}
