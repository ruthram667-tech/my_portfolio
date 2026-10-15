// Runs after `vite build`: sitemap, robots, SPA fallback for static hosts.
import { copyFileSync, writeFileSync, existsSync } from 'node:fs';

const site = (process.env.VITE_SITE_URL || '').replace(/\/$/, '');
const base = (process.env.VITE_BASE || '/').replace(/\/?$/, '/');
const slugs = ['buffex', 'neervahini', 'taskassist', 'hydronix', 'ai-live-coach', 'engineering-calculator-suite', 'newflex'];
const paths = ['/', '/about', '/projects', '/unitaryx', '/experience', '/skills', '/blog', '/resume', '/contact', ...slugs.map((s) => `/projects/${s}`)];

if (existsSync('dist/index.html')) {
  copyFileSync('dist/index.html', 'dist/404.html'); // GitHub Pages / static hosts: unknown paths load the SPA
}
if (site) {
  const urls = paths.map((p) => `  <url><loc>${site}${base.replace(/\/$/, '')}${p === '/' ? '/' : p}</loc></url>`).join('\n');
  writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${site}${base}sitemap.xml\n`);
} else {
  writeFileSync('dist/robots.txt', 'User-agent: *\nAllow: /\nDisallow: /admin\n');
  console.log('VITE_SITE_URL not set: sitemap.xml skipped.');
}
writeFileSync('dist/_redirects', '/*  /index.html  200\n');
console.log('postbuild done');
