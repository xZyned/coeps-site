'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Globe2, Presentation, Star, UsersRound } from 'lucide-react';
import './style.home.css';

const metrics = [
  {
    icon: UsersRound,
    value: '700+',
    label: 'participantes presenciais',
  },
  {
    icon: Presentation,
    value: '40+',
    label: 'minicursos praticos',
  },
  {
    icon: Globe2,
    value: '01',
    label: 'edicao internacional',
  },
  {
    icon: BookOpen,
    value: '08',
    label: 'edicoes de historia',
  },
];

const programacao = [
  ['12 nov', 'Abertura oficial', 'Palavra magna e simposios'],
  ['13 nov', 'Mesas redondas', 'Comunicacoes orais e workshops'],
  ['14 nov', 'Minicursos', 'Vivencias e sessoes tematicas'],
  ['15 nov', 'Encerramento', 'Apresentacoes finais e celebracao'],
];

export default function Home() {
  return (
    <main className="cieps-home">
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="cieps-kicker">A virada de 2026</span>
          <h1 className="cieps-display">VIII CIEPS</h1>
          <p className="landing-hero-edition">1ª Edicao Internacional</p>
          <div className="cieps-lines" aria-hidden="true" />
          <p className="landing-hero-description">
            O maior congresso estudantil de saude da regiao entra em uma nova fase.
            Tradicao que inspira, ciencia que conecta e experiencias que transformam.
          </p>
          <div className="landing-hero-actions">
            <Link href="/inscricoes" prefetch={false} className="cieps-button">
              Faca sua inscricao
            </Link>
            <Link href="/programacao" prefetch={false} className="cieps-button-outline">
              Ver programacao
            </Link>
          </div>
        </div>

        <div className="landing-hero-media">
          <div className="landing-hero-photo">
            <Image
              src="/cieps/cieps-landing-banner.png"
              alt="Arte panoramica do VIII CIEPS com a ponte ferroviaria de Araguari"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 54vw"
            />
          </div>
        </div>
      </section>

      <section className="landing-origin" id="sobre">
        <div className="landing-origin-art">
          <Image
            src="/cieps/cieps-araguari-sketch.png"
            width={720}
            height={300}
            alt="Ilustracao arquitetonica inspirada no patrimonio ferroviario de Araguari"
          />
        </div>
        <div className="landing-origin-copy">
          <span className="cieps-kicker">Sobre o CIEPS</span>
          <h2 className="cieps-display">
            Um congresso que cresce sem perder o lugar de onde nasceu.
          </h2>
          <p>
            O VIII CIEPS preserva a historia construida em Araguari e estreia sua
            1ª Edicao Internacional com uma identidade mais forte, institucional e
            aberta ao futuro da saude.
          </p>
        </div>
        <blockquote>
          “O internacional muda tudo.”
          <small>Minuta de direcao</small>
        </blockquote>
      </section>

      <section className="landing-metrics" aria-label="Indicadores do congresso">
        {metrics.map(({ icon: Icon, value, label }) => (
          <article key={label}>
            <Icon className="landing-metric-icon" size={34} strokeWidth={1.75} />
            <div className="landing-metric-copy">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </article>
        ))}
        <article className="landing-metric-note">
          <Star className="landing-metric-icon" size={34} strokeWidth={1.75} />
          <div className="landing-metric-copy">
            <strong>Tradicao</strong>
            <span>que inspira. Ciencia que transforma.</span>
          </div>
        </article>
      </section>

      <section className="landing-programacao">
        <div className="landing-programacao-heading">
          <span className="cieps-kicker">Programacao</span>
          <h2 className="cieps-display">
            Quatro dias para expandir conhecimento e conexoes.
          </h2>
          <Link href="/programacao" prefetch={false}>
            Ver programacao completa
          </Link>
        </div>

        <div className="landing-programacao-grid">
          {programacao.map(([date, title, detail]) => (
            <article key={date}>
              <strong>{date}</strong>
              <h3>{title}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-feature-grid" id="araguari">
        <article className="landing-feature-copy">
          <span className="cieps-kicker">Araguari</span>
          <h2 className="cieps-display">
            Uma cidade que sustenta a escala do congresso.
          </h2>
          <p>
            Ferrovia, formacao e encontro entre territorio e futuro orientam a
            linguagem do CIEPS. A marca nao inventa grandeza. Ela organiza a
            grandeza que ja existe.
          </p>
        </article>

        <div className="landing-feature-media">
          <Image
            src="/cieps/cieps-notebook.png"
            width={1280}
            height={720}
            alt="Aplicacao da identidade visual do CIEPS em caderno"
          />
        </div>
      </section>

      <section className="landing-science">
        <div className="landing-science-media">
          <Image
            src="/cieps/cieps-book.png"
            width={1280}
            height={720}
            alt="Livro com identidade visual do CIEPS"
          />
        </div>
        <article className="landing-science-copy">
          <span className="cieps-kicker">Trabalhos cientificos</span>
          <h2 className="cieps-display">
            Compartilhe ciencia. Transforme realidades.
          </h2>
          <p>
            Submeta seu trabalho e participe da producao cientifica que move o
            futuro da saude.
          </p>
          <Link href="/trabalhos" prefetch={false} className="cieps-button-outline">
            Conhecer submissao
          </Link>
        </article>
      </section>

      <section className="landing-institutions">
        <article>
          <span>Realizacao</span>
          <strong>DADG</strong>
        </article>
        <article>
          <span>Apoio</span>
          <strong>IMEPAC Araguari</strong>
        </article>
      </section>
    </main>
  );
}
