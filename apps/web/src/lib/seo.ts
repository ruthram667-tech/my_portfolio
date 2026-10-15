import { useEffect } from 'react';
import { SITE } from '@portfolio/shared';

const setMeta = (selector: string, attr: 'name' | 'property', key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

export function useSeo(title: string | undefined, description: string) {
  useEffect(() => {
    const full = title ? `${title} | ${SITE.name}` : `${SITE.name} | Portfolio`;
    document.title = full;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', full);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  }, [title, description]);
}
