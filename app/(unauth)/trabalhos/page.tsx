'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IAcademicWorksProps } from '@/lib/types/academicWorks/academicWorks.t';
import {
  ArrowRight,
  CalendarDays,
  Compass,
  ExternalLink,
  FileText,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';
import './style.css';

function formatShortDate(value?: string) {
  if (!value) return '--/--';
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export default function Trabalhos() {
  const [config, setConfig] = useState<IAcademicWorksProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/inauthenticated/get/trabalhosConfig');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: IAcademicWorksProps = await response.json();
        setConfig(data);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Erro inesperado');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <main className="trabalhos-page">
      <section className="trabalhos-hero">
        <div>
          <span className="cieps-kicker">Trabalhos cientificos</span>
          <h1 className="cieps-display">Pesquisa com rosto, contexto e alcance internacional.</h1>
          <p>
            O VIII CIEPS recebe producoes academicas voltadas a saude, educacao e
            cuidado. A 1ª Edicao Internacional amplia a conversa sem perder o rigor
            e a clareza do processo.
          </p>
        </div>

        <aside className="trabalhos-hero-card cieps-surface">
          <Sparkles size={22} />
          <strong>{config?.isOpen ? 'Submissoes abertas' : 'Edital em acompanhamento'}</strong>
          <span>
            {loading
              ? 'Verificando o status atual.'
              : config?.isOpen
                ? 'Envie seu trabalho e acompanhe os prazos.'
                : 'A pagina permanece pronta para novas atualizacoes.'}
          </span>
        </aside>
      </section>

      <section className="trabalhos-status-grid">
        <article className="cieps-surface trabalhos-status-card">
          <span className="cieps-kicker">Status</span>
          {loading ? (
            <div className="trabalhos-inline-state">
              <Loader2 className="spin" size={18} />
              <strong>Carregando informacoes</strong>
            </div>
          ) : (
            <strong>{config?.isOpen ? 'Submissoes abertas' : 'Submissoes encerradas'}</strong>
          )}
          <p>
            {error
              ? 'Nao foi possivel carregar todos os detalhes agora.'
              : config?.isOpen
                ? 'Consulte edital, guia e painel do participante para enviar.'
                : 'Os resultados e proximas chamadas seguem publicados nesta pagina.'}
          </p>
        </article>

        <article className="cieps-surface trabalhos-date-card">
          <CalendarDays size={20} />
          <strong>{formatShortDate(config?.data_limite_submissao)}</strong>
          <span>Prazo de submissao</span>
        </article>

        <article className="cieps-surface trabalhos-date-card">
          <CalendarDays size={20} />
          <strong>{formatShortDate(config?.data_publicacao_resultados)}</strong>
          <span>Publicacao de resultados</span>
        </article>
      </section>

      <section className="trabalhos-content-grid">
        <article className="cieps-surface trabalhos-copy-card">
          <span className="cieps-kicker">Convite academico</span>
          <h2 className="cieps-display">Um congresso que transforma leitura em autoria.</h2>
          <p>
            O Diretório Acadêmico Diogo Guimarães, junto ao IMEPAC Araguari, estrutura
            o VIII Congresso Internacional de Estudantes e Profissionais da Saúde para
            receber estudos inéditos e relevantes. O foco é abrir espaço para trabalhos
            que contribuam com uma prática mais humana, crítica e conectada ao presente.
          </p>
          <p>
            O processo de submissão permanece centralizado no painel do congressista,
            com materiais de apoio publicados nesta página sempre que disponíveis.
          </p>

          {config?.isOpen && (
            <div className="trabalhos-action-row">
              {config.link_edital && (
                <Link href={config.link_edital} target="_blank" className="cieps-button-outline">
                  <FileText size={18} />
                  Ver edital
                </Link>
              )}
              {config.link_guia && (
                <Link href={config.link_guia} target="_blank" className="cieps-button-outline">
                  <Compass size={18} />
                  Ver guia
                </Link>
              )}
              <Link href="/painel/trabalhos" className="cieps-button">
                <Send size={18} />
                Enviar trabalho
              </Link>
            </div>
          )}
        </article>

        <article className="cieps-surface trabalhos-publicacoes">
          <div className="trabalhos-section-heading">
            <span className="cieps-kicker">Publicacoes</span>
            <h2 className="cieps-display">Resultados e documentos liberados.</h2>
          </div>

          {loading ? (
            <div className="trabalhos-inline-state">
              <Loader2 className="spin" size={18} />
              <strong>Carregando publicacoes</strong>
            </div>
          ) : config?.resultados?.length ? (
            <div className="trabalhos-publication-list">
              {config.resultados.map((publication) => (
                <Link key={publication.link} href={publication.link} target="_blank">
                  <FileText size={18} />
                  <span>{publication.titulo}</span>
                  <ExternalLink size={16} />
                </Link>
              ))}
            </div>
          ) : (
            <p>As publicacoes oficiais serao exibidas aqui assim que forem disponibilizadas.</p>
          )}

          <Link href="/anais" className="trabalhos-more-link">
            Consultar anais
            <ArrowRight size={16} />
          </Link>
        </article>
      </section>
    </main>
  );
}
