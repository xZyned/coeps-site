'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IConferenceProceedings } from '@/lib/types/conferenceProceedings/conferenceProceedings.t';
import {
  BookOpen,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react';
import './style.css';

const publicationMedia = [
  '/cieps/anais-blue-book.png',
  '/cieps/anais-open-spread.png',
  '/cieps/anais-paper-stack.png',
];

export default function Anais() {
  const [anais, setAnais] = useState<IConferenceProceedings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnais = async () => {
      try {
        const response = await fetch('/api/inauthenticated/get/anais');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: { data: IConferenceProceedings[] } = await response.json();
        const sorted = [...(data.data ?? [])].sort(
          (a, b) => new Date(b.date_update).getTime() - new Date(a.date_update).getTime(),
        );
        setAnais(sorted);
      } catch (error) {
        console.error('Erro ao buscar anais:', error);
        setAnais([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnais();
  }, []);

  return (
    <main className="anais-page">
      <section className="anais-hero">
        <div>
          <span className="cieps-kicker">Memoria cientifica</span>
          <h1 className="cieps-display">Anais do CIEPS, organizados para consulta clara.</h1>
          <p>
            Esta área reúne as publicações do congresso em um formato mais direto,
            preservando a produção científica das edições anteriores e preparando
            o caminho para o VIII CIEPS.
          </p>
        </div>
        <Image
          src="/cieps/anais-blue-book.png"
          width={560}
          height={420}
          alt="Livro de anais do CIEPS"
        />
      </section>

      <section className="anais-status cieps-surface">
        {loading ? (
          <>
            <Loader2 className="spin" size={20} />
            <strong>Carregando publicacoes</strong>
            <span>Preparando os volumes disponiveis.</span>
          </>
        ) : anais.length > 0 ? (
          <>
            <BookOpen size={20} />
            <strong>{anais.length} publicacao{anais.length === 1 ? '' : 'es'} disponivel{anais.length === 1 ? '' : 'is'}</strong>
            <span>Abra um volume para acessar o arquivo oficial.</span>
          </>
        ) : (
          <>
            <FileText size={20} />
            <strong>Novos anais ainda nao publicados</strong>
            <span>Assim que houver liberacao, os arquivos aparecerao aqui.</span>
          </>
        )}
      </section>

      <section className="anais-grid">
        {anais.length > 0 ? (
          anais.map((item, index) => (
            <Link key={item.link} href={item.link} target="_blank" className="anais-card cieps-surface">
              <div className="anais-card-cover">
                <Image
                  src={publicationMedia[index % publicationMedia.length]}
                  width={320}
                  height={220}
                  alt={`Imagem editorial relacionada a ${item.name}`}
                />
              </div>
              <div className="anais-card-copy">
                <strong>{item.name}</strong>
                <span>{new Date(item.date_update).getFullYear()}</span>
                <small>
                  Abrir publicacao
                  <ExternalLink size={14} />
                </small>
              </div>
            </Link>
          ))
        ) : (
          <article className="anais-empty cieps-surface">
            <span className="cieps-kicker">Em breve</span>
            <h2 className="cieps-display">Os proximos volumes entram aqui quando forem liberados.</h2>
            <p>Enquanto isso, consulte os comunicados oficiais do congresso para acompanhar novidades.</p>
          </article>
        )}
      </section>

      <section className="anais-contact cieps-surface">
        <div>
          <span className="cieps-kicker">Contato</span>
          <h2 className="cieps-display">Precisa confirmar uma publicação?</h2>
        </div>
        <div className="anais-contact-list">
          <span>
            <Mail size={18} />
            dadg.imepac@gmail.com
          </span>
          <span>
            <Phone size={18} />
            +55 34 99120-9359
          </span>
        </div>
      </section>
    </main>
  );
}
