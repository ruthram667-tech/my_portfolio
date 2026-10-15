# Deploy
**Frontend (static):** `npm run build -w @portfolio/web`, publish `apps/web/dist` (Netlify, Vercel, Cloudflare Pages, GitHub Pages). Postbuild creates `404.html`, `_redirects`, `robots.txt` (and `sitemap.xml` if `VITE_SITE_URL` is set). For a project page set `VITE_BASE=/repo-name/`. GitHub Pages hosts only the frontend.

**API (needs a Node 22 host: Render, Railway, Fly, VPS):** `docker compose up -d` or `npm run build -w @portfolio/api && node apps/api/dist/server.js`. Set `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS` (your site origin), `COOKIE_SECURE=true`, and `COOKIE_SAMESITE=none` when the site and API are on different domains. Then set `VITE_API_URL` on the frontend build.
