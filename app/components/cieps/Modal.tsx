'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button, cx } from './ui';

export default function Modal({
  open,
  title,
  description,
  children,
  onClose,
  footer,
  className,
  closeLabel = 'Fechar janela',
}: {
  open: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  className?: string;
  closeLabel?: string;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [onClose, open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="cieps-modal-layer">
      <button className="cieps-modal-backdrop" type="button" onClick={onClose} aria-label={closeLabel} />
      <div
        ref={dialogRef}
        className={cx('cieps-modal-card', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <Button variant="ghost" className="cieps-modal-close" onClick={onClose} aria-label={closeLabel}>
          <X size={20} aria-hidden="true" />
        </Button>
        <header>
          <h2 id={titleId} className="cieps-display text-3xl font-semibold leading-tight text-tinta">{title}</h2>
          {description && <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted">{description}</p>}
        </header>
        {children && <div className="cieps-modal-content">{children}</div>}
        {footer && <footer className="cieps-modal-footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
