# Ruthramoorthy S B – Portfolio

Black, gold and grey multi-page portfolio with a small full-stack backend.

- `apps/web` React 19, Vite, Tailwind v4, React Router, TanStack Query
- `apps/api` Fastify 5, SQLite (`node:sqlite`), JWT cookie auth, admin dashboard API
- `packages/shared` zod schemas and the confirmed content (single source of truth)

## Run
```bash
npm install
cp .env.example .env      # set JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev               # web :5173, api :4000
npm test && npm run build
```
Without `VITE_API_URL` the site runs on built-in content and the contact form opens your email app (it says so). With the API, messages are stored and readable at `/admin`.

## Edit content
Projects, experience, skills and links live in `packages/shared/src/content.ts`. Anything not confirmed is simply not shown.

See `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/DEPLOY.md`.
