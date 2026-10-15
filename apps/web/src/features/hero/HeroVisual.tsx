import { lazy, Suspense, useEffect, useState } from 'react';
import { HexMark } from '@/components/Hexagon';

const Hero3D = lazy(() => import('./Hero3D'));

/** 3D only on capable desktop devices after idle; everything else gets the static SVG mark (three.js is never downloaded). */
function canRun3D() {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (
    window.matchMedia('(min-width: 1024px)').matches &&
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    (nav.hardwareConcurrency ?? 8) > 4 &&
    (nav.deviceMemory ?? 8) > 4
  );
}

export function HeroVisual() {
  const [enable3D, setEnable3D] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canRun3D()) return;
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const t = ric ? ric(() => setEnable3D(true)) : window.setTimeout(() => setEnable3D(true), 400);
    return () => {
      if (!ric) clearTimeout(t);
    };
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}>
        <HexMark className="h-40 w-40 opacity-90 md:h-56 md:w-56" />
      </div>
      {enable3D && (
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <Hero3D onReady={() => setReady(true)} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
