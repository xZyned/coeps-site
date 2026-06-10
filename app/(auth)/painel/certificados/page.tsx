import Link from 'next/link';
import { ArrowLeft, ExternalLink, FileCheck2 } from 'lucide-react';
import './style.css';

export default function Certificados() {
  return (
    <main className="certificados-disabled-page">
      <section className="certificados-disabled-card cieps-surface">
        <span className="cieps-kicker">Certificados</span>
        <div className="certificados-disabled-icon">
          <FileCheck2 size={28} />
        </div>
        <h1 className="cieps-display">A emissao sera feita em ambiente externo.</h1>
        <p>
          O painel do VIII CIEPS agora fica dedicado a inscricao, trabalhos, agenda,
          pagamentos e acesso ao evento. As orientacoes sobre certificados serao
          divulgadas pelos canais oficiais do congresso.
        </p>
        <div className="certificados-disabled-actions">
          <Link href="/painel" className="cieps-button-outline">
            <ArrowLeft size={18} />
            Voltar ao painel
          </Link>
          <Link href="/anais" className="cieps-button">
            <ExternalLink size={18} />
            Ver informacoes publicas
          </Link>
        </div>
      </section>
    </main>
  );
}
