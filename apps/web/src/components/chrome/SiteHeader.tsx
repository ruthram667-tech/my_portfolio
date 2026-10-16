import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { SITE } from '@portfolio/shared';
import { cn } from '@/lib/cn';
import { buttonClass } from '@/components/ui/ui';

export const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/unitaryx', label: 'Jyruka × Unitaryx' },
  { to: '/experience', label: 'Experience' },
  { to: '/skills', label: 'Skills' },
  { to: '/blog', label: 'Blog' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={cn('no-print fixed inset-x-0 top-0 z-40 border-b transition-colors duration-200', scrolled || open ? 'border-line bg-bg/95' : 'border-transparent bg-transparent')}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="flex items-center font-bold tracking-tight text-fg transition-colors hover:text-gold" aria-label={`${SITE.name}, home`}>
          <span>{SITE.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => cn('rounded-md px-3 py-2 text-sm transition-colors', isActive ? 'text-gold' : 'text-muted hover:text-fg')}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/contact" className={buttonClass('primary', 'sm', 'hidden sm:inline-flex')}>Contact</Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md border border-line text-fg lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto border-t border-line bg-bg lg:hidden">
          <nav aria-label="Mobile" className="mx-auto flex max-w-6xl flex-col px-5 py-6">
            {[...NAV, { to: '/resume', label: 'Resume' }, { to: '/contact', label: 'Contact' }].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={'end' in n ? n.end : false}
                className={({ isActive }) => cn('border-b border-line py-4 text-2xl font-semibold tracking-tight', isActive ? 'text-gold' : 'text-fg')}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
