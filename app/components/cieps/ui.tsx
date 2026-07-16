import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type ClassValue = string | false | null | undefined;

export const cx = (...classes: ClassValue[]) => classes.filter(Boolean).join(' ');

export function Logo({
  size = 42,
  withText = true,
  className,
}: {
  size?: number;
  withText?: boolean;
  className?: string;
}) {
  return (
    <div className={cx('flex items-center gap-3', className)}>
      <span
        className="relative block shrink-0 overflow-hidden rounded-full bg-papel"
        style={{ width: size, height: size }}
      >
        <Image src="/cieps/cieps-mark.png" alt="" fill sizes={`${size}px`} className="object-contain" />
      </span>
      {withText && (
        <span className="font-title text-lg font-bold leading-none text-tinta">
          CIEPS
        </span>
      )}
    </div>
  );
}

export function Stripe({ className }: { className?: string }) {
  return (
    <div className={cx('flex items-center gap-[3px]', className)} aria-hidden="true">
      <span className="h-1 w-[22px] rounded-[2px] bg-goles" />
      <span className="h-1 w-[14px] rounded-[2px] bg-ipe" />
      <span className="h-1 w-[10px] rounded-[2px] bg-araguari" />
      <span className="h-1 w-[6px] rounded-[2px] bg-ipe" />
    </div>
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-sans text-[11px] font-semibold uppercase text-goles">
        {children}
      </span>
      <Stripe />
    </div>
  );
}

export function buttonClassName({
  variant = 'solid',
  full,
  className,
}: {
  variant?: 'solid' | 'outline';
  full?: boolean;
  className?: string;
}) {
  return cx(
    'inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3.5 font-sans text-sm font-semibold uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-goles',
    variant === 'solid'
      ? 'bg-goles text-white hover:bg-[#8f2323]'
      : 'border-[1.5px] border-goles bg-white text-goles hover:bg-goles/5',
    full && 'w-full',
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline';
  full?: boolean;
};

export function Button({ variant = 'solid', full, className, children, ...rest }: ButtonProps) {
  return (
    <button {...rest} className={buttonClassName({ variant, full, className })}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'solid',
  full,
  className,
  children,
}: {
  href: string;
  variant?: 'solid' | 'outline';
  full?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} prefetch={false} className={buttonClassName({ variant, full, className })}>
      {children}
    </Link>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-ipe px-3 py-1.5 font-sans text-[11px] font-semibold text-tinta">
      {children}
    </span>
  );
}

export function Card({
  kicker,
  title,
  children,
  action,
  className,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={cx('flex flex-col gap-3 rounded-lg border border-linha bg-white p-7', className)}>
      <span className="font-sans text-[11px] font-semibold uppercase text-goles">
        {kicker}
      </span>
      <h3 className="font-title text-2xl font-semibold leading-snug text-tinta">{title}</h3>
      <div className="font-sans text-[13px] leading-relaxed text-muted">{children}</div>
      {action}
    </article>
  );
}

export function ImageBox({
  src,
  alt = '',
  className,
  label,
  priority,
}: {
  src?: string;
  alt?: string;
  className?: string;
  label?: string;
  priority?: boolean;
}) {
  return (
    <div className={cx('relative flex items-center justify-center overflow-hidden bg-linha/60', className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 520px" priority={priority} className="object-cover" />
      ) : (
        label && <span className="font-sans text-xs font-medium text-muted">{label}</span>
      )}
    </div>
  );
}
