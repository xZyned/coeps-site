import Header from '@/app/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import './style.home.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="cieps-footer" id="contato">
      <div className="cieps-footer-grid">
        <div className="cieps-footer-brand">
          <Image
            src="/cieps/cieps-lockup-horizontal.png"
            width={420}
            height={136}
            alt="Marca do VIII CIEPS"
          />
          <p>
            VIII CIEPS. A 1ª Edicao Internacional do Congresso Internacional de
            Estudantes e Profissionais da Saude.
          </p>
        </div>

        <div className="cieps-footer-column">
          <h2>Contato</h2>
          <a href="mailto:dadg.imepac@gmail.com">dadg.imepac@gmail.com</a>
          <a
            href="https://api.whatsapp.com/send?phone=5562983306426"
            target="_blank"
            rel="noopener noreferrer"
          >
            +55 34 99120-9359
          </a>
          <a
            href="https://www.instagram.com/coeps.araguari/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram oficial
          </a>
        </div>

        <div className="cieps-footer-column">
          <h2>Acessos rapidos</h2>
          <Link href="/programacao" prefetch={false}>Programacao</Link>
          <Link href="/trabalhos" prefetch={false}>Trabalhos cientificos</Link>
          <Link href="/anais" prefetch={false}>Anais</Link>
          <Link href="/painel" prefetch={false}>Area do congressista</Link>
        </div>

        <div className="cieps-footer-column cieps-footer-meta">
          <h2>Institucional</h2>
          <p>Realizacao: DADG</p>
          <p>Apoio: IMEPAC Araguari</p>
          <p>Araguari, Minas Gerais, Brasil</p>
        </div>
      </div>
      <div className="cieps-footer-bottom">
        <span>© 2026 VIII CIEPS.</span>
        <span>1ª Edicao Internacional.</span>
      </div>
    </footer>
  );
}
