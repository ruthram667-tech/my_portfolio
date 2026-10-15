import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { trackPageview } from '@/data-access';

/** On route change: scroll to top (not on back/forward), move focus to the page heading, announce the title, record a page view. */
export function RouteEffects() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const first = useRef(true);
  const [announce, setAnnounce] = useState('');

  useEffect(() => {
    if (navType !== 'POP') window.scrollTo({ top: 0, left: 0 });
    const t = window.setTimeout(() => {
      setAnnounce(document.title);
      if (!first.current) document.getElementById('page-title')?.focus({ preventScroll: true });
      first.current = false;
    }, 60);
    if (!pathname.startsWith('/admin')) trackPageview(pathname);
    return () => clearTimeout(t);
  }, [pathname, navType]);

  return <div aria-live="polite" role="status" className="sr-only">{announce}</div>;
}

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    update();
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} aria-hidden className="no-print fixed inset-x-0 top-0 z-50 h-0.5 origin-left scale-x-0 bg-gold" />;
}
