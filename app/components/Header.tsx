'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const menuItems = [
  { name: 'Sobre', href: '/#sobre' },
  { name: 'Programação', href: '/programacao' },
  { name: 'Trabalhos', href: '/trabalhos' },
  { name: 'Informações', href: '/anais' },
  { name: 'Araguari', href: '/#araguari' },
  { name: 'Contato', href: '/#contato' },
];

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`cieps-header ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="cieps-header-inner">
        <Link href="/" prefetch={false} className="cieps-brand">
          <Image
            src="/cieps/cieps-lockup-horizontal.png"
            alt="I CIEPS"
            width={420}
            height={136}
            priority
          />
        </Link>

        <nav className="cieps-nav" aria-label="Navegação principal">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href} prefetch={false}>
              {item.name}
            </Link>
          ))}
        </nav>

        <Link href="/inscricoes" prefetch={false} className="cieps-header-cta">
          Inscrições
        </Link>

        <button
          type="button"
          className="cieps-menu-button"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto((value) => !value)}
        >
          {menuAberto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuAberto && (
        <div className="cieps-mobile-menu">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              prefetch={false}
              onClick={() => setMenuAberto(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/inscricoes"
            prefetch={false}
            className="cieps-mobile-cta"
            onClick={() => setMenuAberto(false)}
          >
            Fazer inscrição
          </Link>
        </div>
      )}
    </header>
  );
}
