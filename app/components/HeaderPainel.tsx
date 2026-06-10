'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, CreditCard, FileText, Home, LogOut, Menu, User, X } from 'lucide-react';

const menuItems = [
  { name: 'Inicio', href: '/', icon: <Home size={16} /> },
  { name: 'Minha pagina', href: '/painel', icon: <User size={16} /> },
  { name: 'Trabalhos', href: '/painel/trabalhos', icon: <FileText size={16} /> },
  { name: 'Programacao', href: '/painel/minhaProgramacao', icon: <Calendar size={16} /> },
  { name: 'Pagamentos', href: '/pagamentos', icon: <CreditCard size={16} /> },
];

export default function HeaderPainel({ isPayed = true }: { isPayed: boolean }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`cieps-panel-header ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="cieps-panel-header-inner">
        <Link href="/" prefetch={false} className="cieps-panel-brand">
          <Image
            src="/cieps/cieps-lockup-horizontal.png"
            width={420}
            height={136}
            alt="VIII CIEPS"
          />
        </Link>

        <nav className="cieps-panel-nav" aria-label="Navegacao do congressista">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href} prefetch={false}>
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="cieps-panel-actions">
          {!isPayed && <span className="cieps-panel-alert">Pagamento pendente</span>}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/auth/logout" className="cieps-panel-logout">
            <LogOut size={16} />
            <span>Sair</span>
          </a>
        </div>

        <button
          type="button"
          className="cieps-panel-menu"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto((value) => !value)}
        >
          {menuAberto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuAberto && (
        <div className="cieps-panel-mobile">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              prefetch={false}
              onClick={() => setMenuAberto(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/auth/logout" onClick={() => setMenuAberto(false)}>
            <LogOut size={16} />
            <span>Sair</span>
          </a>
        </div>
      )}
    </header>
  );
}
