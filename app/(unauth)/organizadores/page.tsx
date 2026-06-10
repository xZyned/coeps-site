import Image from 'next/image';
import { BriefcaseBusiness, Compass, UsersRound } from 'lucide-react';
import './style.css';

const organizerCards = [
  {
    icon: <BriefcaseBusiness size={20} />,
    title: 'Direcao',
    description: 'Responsavel pela conducao institucional e pelos marcos do congresso.',
  },
  {
    icon: <Compass size={20} />,
    title: 'Coordenacoes',
    description: 'Frentes que articulam experiencia, programacao e relacionamento.',
  },
  {
    icon: <UsersRound size={20} />,
    title: 'Equipe de apoio',
    description: 'Pessoas que sustentam a operacao e acolhem o publico durante o evento.',
  },
];

export default function Organizadores() {
  return (
    <main className="organizadores-page">
      <section className="organizadores-hero">
        <div>
          <span className="cieps-kicker">Organizacao</span>
          <h1 className="cieps-display">A equipe do VIII CIEPS ganha uma apresentacao a altura.</h1>
          <p>
            Estamos preparando esta seção para publicar a composição oficial do congresso
            com a mesma clareza da nova identidade. O encontro já tem assinatura definida:
            VIII CIEPS, 1ª Edição Internacional.
          </p>
        </div>
        <Image
          src="/cieps/cieps-shirt-chair.png"
          width={520}
          height={420}
          alt="Aplicacao da identidade visual do CIEPS em camiseta e mobiliario"
        />
      </section>

      <section className="organizadores-grid">
        {organizerCards.map((card) => (
          <article key={card.title} className="cieps-surface organizadores-card">
            <span>{card.icon}</span>
            <h2 className="cieps-display">{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <section className="organizadores-note cieps-surface">
        <span className="cieps-kicker">Em breve</span>
        <h2 className="cieps-display">Nomes, frentes e responsabilidades serao publicados aqui.</h2>
        <p>
          A pagina fica pronta desde ja para receber a equipe definitiva sem precisar
          de outra virada visual.
        </p>
      </section>
    </main>
  );
}
