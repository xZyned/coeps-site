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
        <h1 className="cieps-display">A emissão será realizada em ambiente externo.</h1>
        <p>
          O painel do I CIEPS agora fica dedicado à inscrição, aos trabalhos, à agenda,
          aos pagamentos e ao acesso ao evento. As orientações sobre certificados serão
          divulgadas pelos canais oficiais do congresso.
        </p>
        <div className="certificados-disabled-actions">
          <Link href="/painel" className="cieps-button-outline">
            <ArrowLeft size={18} />
            Voltar ao painel
          </Link>
          <Link href="/anais" className="cieps-button">
            <ExternalLink size={18} />
            Ver informações públicas
          </Link>
        </div>
      </section>
    </main>
  );
}
