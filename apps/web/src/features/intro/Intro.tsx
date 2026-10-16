import { useEffect, useState } from 'react';
import { SITE } from '@portfolio/shared';

const KEY = 'intro-seen-v1';

const alreadySeen = () => {
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
};

/** CSS-only intro (transform + opacity). Plays once per browser session. React renders it once and only listens for the end. */
export function Intro() {
  const [show, setShow] = useState(() => !alreadySeen());

  useEffect(() => {
    if (!show) return;
    document.documentElement.classList.add('intro-lock');
    const done = () => {
      document.documentElement.classList.remove('intro-lock');
      try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
      setShow(false);
    };
    const t = window.setTimeout(done, 3900);
    (window as Window & { __introDone?: () => void }).__introDone = done;
    return () => {
      clearTimeout(t);
      document.documentElement.classList.remove('intro-lock');
    };
  }, [show]);

  if (!show) return null;

  const skip = () => (window as Window & { __introDone?: () => void }).__introDone?.();
  const first = 'RUTHRAMOORTHY'.split('');

  return (
    <div className="intro" role="presentation">
      <button type="button" className="intro__skip" onClick={skip}>Skip intro</button>
      <div className="intro__line" />
      <div className="intro__dot" />
      <div className="intro__bar intro__bar--top" />
      <div className="intro__bar intro__bar--bottom" />
      <div className="intro__content">
        <div className="intro__name" role="img" aria-label={SITE.name}>
          {first.map((c, i) => (
            <span key={i} aria-hidden style={{ animationDelay: `${1.8 + i * 0.04}s` }}>{c}</span>
          ))}
          <span aria-hidden className="ml-3 font-black text-black" style={{ animationDelay: `${1.8 + first.length * 0.04 + 0.1}s` }}>S B</span>
        </div>
        <p className="intro__sub">AI &amp; Data Science · IoT · Software</p>
      </div>
    </div>
  );
}
