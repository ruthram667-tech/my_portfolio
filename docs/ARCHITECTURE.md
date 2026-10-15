# Architecture
npm workspaces monorepo: `apps/web`, `apps/api`, `packages/shared`.

- Data-access seam (`apps/web/src/data-access`): uses `${VITE_API_URL}/api/v1` when set, otherwise built-in content. Pages never touch content directly.
- API routes (`/api/v1`): health, projects, posts, contact, analytics/pageview, auth (login/logout/me), admin (messages, projects, posts, analytics).
- Security: scrypt password hashing, httpOnly JWT cookie, CSRF header `x-requested-with: portfolio` on admin writes, helmet, CORS allow-list, rate limits, contact honeypot, zod validation everywhere.
- Analytics: pageviews only (path, referrer host, day); no IP or user agent stored.
- Storage: SQLite file. Swap to PostgreSQL later by replacing `apps/api/src/db.ts` (the `Store` class is the only DB touchpoint).
- Frontend perf: lazy routes, lazy three.js hexagon only on capable desktops, CSS-only intro, manual chunks.
