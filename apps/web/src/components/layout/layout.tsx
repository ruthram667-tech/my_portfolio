import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export const Container = ({ children, className, narrow }: { children: ReactNode; className?: string; narrow?: boolean }) => (
  <div className={cn('mx-auto w-full px-5 sm:px-8', narrow ? 'max-w-3xl' : 'max-w-6xl', className)}>{children}</div>
);

export const Section = ({ children, className, id, muted }: { children: ReactNode; className?: string; id?: string; muted?: boolean }) => (
  <section id={id} className={cn('py-16 md:py-24', muted && 'border-y border-line bg-surface', className)}>
    <Container>{children}</Container>
  </section>
);

export function SectionHeader({ title, text, action, className }: { title: string; text?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
        {text && <p className="mt-3 text-muted">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, description, crumbs, children }: { title: string; description?: string; crumbs?: { label: string; to?: string }[]; children?: ReactNode }) {
  return (
    <header className="border-b border-line">
      <Container className="py-14 md:py-20">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-subtle">
              <li><Link to="/" className="hover:text-gold">Home</Link></li>
              {crumbs.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  <ChevronRight size={14} aria-hidden />
                  {c.to ? <Link to={c.to} className="hover:text-gold">{c.label}</Link> : <span aria-current="page" className="text-muted">{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 id="page-title" tabIndex={-1} className="rise text-4xl font-extrabold tracking-tight outline-none md:text-6xl">{title}</h1>
        {description && <p className="rise rise-2 mt-5 max-w-2xl text-lg text-muted">{description}</p>}
        {children && <div className="rise rise-3 mt-8">{children}</div>}
      </Container>
    </header>
  );
}

export const EmptyState = ({ title, text, children }: { title: string; text?: string; children?: ReactNode }) => (
  <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
    <p className="text-lg font-semibold">{title}</p>
    {text && <p className="mx-auto mt-2 max-w-md text-muted">{text}</p>}
    {children && <div className="mt-6 flex justify-center">{children}</div>}
  </div>
);
