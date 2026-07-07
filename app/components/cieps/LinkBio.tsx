import { ButtonLink, Logo, Stripe } from './ui';

const links = [
  { label: 'Inscrição', href: '/painel', variant: 'solid' as const },
  { label: 'Conheça nosso site', href: '/', variant: 'outline' as const },
  { label: 'Programação', href: '/programacao', variant: 'outline' as const },
  { label: 'Submeter trabalho', href: '/painel/trabalhos/enviarTrabalho', variant: 'outline' as const },
  { label: 'WhatsApp / contato', href: 'https://api.whatsapp.com/send?phone=5562983306426', variant: 'outline' as const },
];

export default function LinkBio() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center gap-4 bg-papel px-6 py-10 text-center">
      <Logo size={56} withText={false} />

      <div className="flex flex-col items-center gap-1">
        <h1 className="font-title text-2xl font-bold text-tinta">I CIEPS</h1>
        <p className="font-sans text-sm font-medium text-goles">1ª Edição Internacional</p>
        <p className="font-sans text-xs text-muted">Araguari/MG · 12 a 15 nov 2026</p>
      </div>

      <Stripe className="my-1" />

      <div className="flex w-full flex-col gap-3">
        {links.map((link) => (
          <ButtonLink key={link.label} href={link.href} full variant={link.variant}>
            {link.label}
          </ButtonLink>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-3" aria-label="Redes sociais">
        <span className="h-6 w-6 rounded-full bg-linha" />
        <span className="h-6 w-6 rounded-full bg-linha" />
        <span className="h-6 w-6 rounded-full bg-linha" />
      </div>
    </main>
  );
}
