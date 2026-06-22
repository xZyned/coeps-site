'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  BookOpen,
  Clock,
  CreditCard,
  FileText,
  QrCode,
  Sparkles,
  Upload,
  UserRound,
} from 'lucide-react';
import './style.css';

const quickActions = [
  { href: '/pagamentos', label: 'Meus pagamentos', icon: <CreditCard size={24} /> },
  { href: '/painel/trabalhos/enviarTrabalho', label: 'Enviar trabalhos', icon: <Upload size={24} /> },
  { href: '/painel/trabalhos', label: 'Consultar submissões', icon: <BookOpen size={24} /> },
  { href: '/painel/minhaProgramacao', label: 'Minha programação', icon: <Clock size={24} /> },
  { href: '/painel/minhasInformacoes', label: 'Minhas informações', icon: <UserRound size={24} /> },
  { href: '/painel/comprovanteDeInscricao', label: 'Comprovante', icon: <Sparkles size={24} /> },
  { href: '/painel/atividades', label: 'Atividades', icon: <Activity size={24} /> },
];

export default function Page() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/get/usuariosInformacoes');
        const data = await response.json();
        setUserId(data?.data?._id || null);
      } catch {
        setUserId(null);
      }
    };

    fetchUserId();
  }, []);

  return (
    <main className="cieps-dashboard">
      <section className="cieps-dashboard-hero">
        <div>
          <span className="cieps-kicker">Área do congressista</span>
          <h1 className="cieps-display">Bem-vindo ao I CIEPS.</h1>
          <p>
            A 1ª Edição Internacional organiza toda a sua jornada em um painel
            mais direto: inscrição, submissão, agenda e acesso ao evento.
          </p>
        </div>
        <Image
          src="/cieps/cieps-mark.png"
          width={240}
          height={160}
          alt=""
          aria-hidden="true"
        />
      </section>

      <section className="cieps-dashboard-grid">
        <article className="cieps-dashboard-panel cieps-dashboard-panel-wide">
          <div className="cieps-panel-heading">
            <span className="cieps-kicker">Ações principais</span>
            <h2 className="cieps-display">O essencial da sua participação.</h2>
          </div>
          <div className="cieps-dashboard-actions">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} prefetch={false} className="cieps-dashboard-action">
                <span>{action.icon}</span>
                <strong>{action.label}</strong>
              </Link>
            ))}
          </div>
        </article>

        <article className="cieps-dashboard-panel">
          <div className="cieps-panel-heading">
            <span className="cieps-kicker">Acesso ao evento</span>
            <h2 className="cieps-display">Seu QR Code em um toque.</h2>
          </div>
          <p>
            Use o código individual para facilitar seu check-in e consultar sua
            credencial quando precisar.
          </p>
          <Link
            href={`/qrCode/${userId ?? 'null'}`}
            prefetch={false}
            className={`cieps-button ${userId ? '' : 'is-disabled'}`}
          >
            <QrCode size={18} />
            Ver QR Code
          </Link>
        </article>

        <article className="cieps-dashboard-panel">
          <div className="cieps-panel-heading">
            <span className="cieps-kicker">Acompanhamento</span>
            <h2 className="cieps-display">Submissões e comprovante.</h2>
          </div>
          <p>
            Acompanhe o status dos trabalhos enviados e consulte o comprovante
            de inscrição sempre que precisar.
          </p>
          <div className="cieps-dashboard-inline-links">
            <Link href="/painel/trabalhos" prefetch={false}>
              <FileText size={16} />
              Submissões
            </Link>
            <Link href="/painel/comprovanteDeInscricao" prefetch={false}>
              <FileText size={16} />
              Comprovante
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
