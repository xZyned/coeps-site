"use client"

import Image from "next/image";
import Link from "next/link";
import "./style.css";

export default function Inscricoes() {
  return (
    <main className="inscricoes-main">
      <section className="inscricoes-hero">
        <div className="inscricoes-hero-copy">
          <span className="cieps-kicker">Inscricoes</span>
          <h1 className="cieps-display">Garanta sua vaga no VIII CIEPS.</h1>
          <p>
            A 1ª Edicao Internacional do congresso recebe estudantes,
            profissionais e pesquisadores para quatro dias de programacao,
            encontros e producao cientifica em Araguari.
          </p>
          <div className="cieps-lines" aria-hidden="true" />
          <Link href="/painel" prefetch={false} className="cieps-button">
            Cadastrar agora
          </Link>
        </div>
        <div className="inscricoes-hero-media">
          <Image
            src="/cieps/cieps-badge.png"
            width={1280}
            height={720}
            alt="Crachá do CIEPS aplicado à nova identidade visual"
            priority
          />
        </div>
      </section>

      <section className="inscricoes-grid">
        <article className="inscricoes-block">
          <span className="cieps-kicker">Normas</span>
          <h2 className="cieps-display">O que sua inscricao garante</h2>
          <p>
            O pagamento da taxa de inscricao assegura o acesso às atividades
            previstas na programacao cientifica do evento. Pagamentos fora do
            vencimento podem acompanhar o lote vigente.
          </p>
        </article>

        <article className="inscricoes-block">
          <span className="cieps-kicker">Pagamento</span>
          <h2 className="cieps-display">Formas disponiveis</h2>
          <p>
            Trabalhamos com <strong>PIX</strong>, <strong>boleto bancario</strong>
            {" "}e <strong>cartao de credito</strong>, para que cada congressista
            consiga concluir a inscricao com praticidade.
          </p>
        </article>

        <article className="inscricoes-block">
          <span className="cieps-kicker">Fluxo</span>
          <h2 className="cieps-display">Como realizar sua inscricao</h2>
          <p>
            Crie sua conta, conclua o cadastro e siga para a tela de pagamento.
            Com a confirmacao automatica, sua vaga fica reservada e o painel do
            congressista e liberado.
          </p>
          <Link href="/painel" prefetch={false} className="cieps-button-outline">
            Ir para cadastro
          </Link>
        </article>

        <article className="inscricoes-block">
          <span className="cieps-kicker">Politicas</span>
          <h2 className="cieps-display">Acesso pessoal e protegido</h2>
          <p>
            Login e senha sao pessoais e intransferiveis. Ao se cadastrar, voce
            concorda em preservar suas credenciais e em utilizar o ambiente do
            congresso de forma segura.
          </p>
        </article>

        <article className="inscricoes-block inscricoes-block-wide">
          <span className="cieps-kicker">Cancelamento</span>
          <h2 className="cieps-display">Reembolso e contato</h2>
          <p>
            O Art. 49 do Codigo de Defesa do Consumidor garante o prazo legal
            de 7 dias apos a compra para devolucao integral. Para iniciar esse
            processo, fale com a organizacao por e-mail ou WhatsApp.
          </p>
          <div className="inscricoes-links">
            <a href="mailto:dadg.imepac@gmail.com">dadg.imepac@gmail.com</a>
            <a
              href="https://api.whatsapp.com/send?phone=5562983306426"
              target="_blank"
              rel="noopener noreferrer"
            >
              +55 34 99120-9359
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
