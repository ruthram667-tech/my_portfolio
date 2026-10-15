import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import { contactInputSchema, loginInputSchema, pageviewInputSchema, postSchema, projectSchema } from '@portfolio/shared';
import type { Config } from './config';
import { Store } from './db';
import { DUMMY_HASH, verifyPassword } from './security';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: number; email: string };
    user: { sub: number; email: string };
  }
}

const CSRF_HEADER = 'x-requested-with';
const CSRF_VALUE = 'portfolio';

export async function buildApp(config: Config, store: Store): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.nodeEnv === 'test' ? false : { level: config.nodeEnv === 'production' ? 'info' : 'debug', redact: ['req.headers.cookie', 'req.headers.authorization'] },
    trustProxy: true,
    bodyLimit: 64 * 1024,
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: (origin, cb) => cb(null, !origin || config.corsOrigins.includes(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['content-type', CSRF_HEADER],
  });
  await app.register(cookie);
  await app.register(jwt, { secret: config.jwtSecret, cookie: { cookieName: 'token', signed: false }, sign: { expiresIn: '12h' } });
  await app.register(rateLimit, { global: true, max: 120, timeWindow: '1 minute' });

  app.setErrorHandler((err: Error & { statusCode?: number; validation?: unknown }, req, reply) => {
    if (err instanceof z.ZodError) {
      return reply.code(400).send({ error: 'validation_error', issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) });
    }
    const status = err.statusCode ?? 500;
    if (status >= 500) req.log.error(err);
    return reply.code(status).send({ error: status >= 500 ? 'internal_error' : (err.message || 'error') });
  });

  const requireAdmin = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'unauthorized' });
    }
    if (req.method !== 'GET' && req.headers[CSRF_HEADER] !== CSRF_VALUE) {
      return reply.code(403).send({ error: 'csrf_check_failed' });
    }
  };

  const setAuthCookie = (reply: FastifyReply, token: string) =>
    reply.setCookie('token', token, { httpOnly: true, secure: config.cookieSecure, sameSite: config.cookieSameSite, path: '/', maxAge: 12 * 3600 });

  const v1 = '/api/v1';

  app.get(`${v1}/health`, async () => ({ status: 'ok', time: new Date().toISOString() }));

  // ---------- public content ----------
  app.get(`${v1}/projects`, async () => ({ items: store.listProjects() }));
  app.get(`${v1}/projects/:slug`, async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const p = store.getProject(slug);
    return p ?? reply.code(404).send({ error: 'not_found' });
  });
  app.get(`${v1}/posts`, async () => ({ items: store.listPosts(false) }));
  app.get(`${v1}/posts/:slug`, async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const p = store.getPost(slug, false);
    return p ?? reply.code(404).send({ error: 'not_found' });
  });

  // ---------- contact ----------
  app.post(`${v1}/contact`, { config: { rateLimit: { max: 5, timeWindow: '1 hour' } } }, async (req, reply) => {
    const body = contactInputSchema.safeParse(req.body);
    if (!body.success) {
      // A filled honeypot is answered like a success so bots learn nothing.
      const raw = req.body as { website?: unknown } | undefined;
      if (raw && typeof raw.website === 'string' && raw.website.length > 0) return reply.code(202).send({ ok: true });
      throw body.error;
    }
    const { name, email, subject, message } = body.data;
    const id = store.addMessage({ name, email, subject, message });
    return reply.code(201).send({ ok: true, id });
  });

  // ---------- analytics (privacy friendly) ----------
  app.post(`${v1}/analytics/pageview`, { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
    const body = pageviewInputSchema.parse(req.body);
    store.addPageview(body.path, body.referrer);
    return reply.code(204).send();
  });

  // ---------- auth ----------
  app.post(`${v1}/auth/login`, { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } }, async (req, reply) => {
    if (req.headers[CSRF_HEADER] !== CSRF_VALUE) return reply.code(403).send({ error: 'csrf_check_failed' });
    const { email, password } = loginInputSchema.parse(req.body);
    const user = store.findUser(email);
    const ok = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !ok) return reply.code(401).send({ error: 'invalid_credentials' });
    const token = app.jwt.sign({ sub: user.id, email: user.email });
    setAuthCookie(reply, token);
    return { email: user.email };
  });
  app.post(`${v1}/auth/logout`, async (req, reply) => {
    if (req.headers[CSRF_HEADER] !== CSRF_VALUE) return reply.code(403).send({ error: 'csrf_check_failed' });
    reply.clearCookie('token', { path: '/' });
    return reply.code(204).send();
  });
  app.get(`${v1}/auth/me`, { preHandler: requireAdmin }, async (req) => ({ email: req.user.email }));

  // ---------- admin ----------
  const admin = { preHandler: requireAdmin };

  app.get(`${v1}/admin/messages`, admin, async () => ({ items: store.listMessages() }));
  app.patch(`${v1}/admin/messages/:id`, admin, async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const { read } = z.object({ read: z.boolean() }).parse(req.body);
    return store.setMessageRead(id, read) ? { ok: true } : reply.code(404).send({ error: 'not_found' });
  });
  app.delete(`${v1}/admin/messages/:id`, admin, async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    return store.deleteMessage(id) ? reply.code(204).send() : reply.code(404).send({ error: 'not_found' });
  });

  app.put(`${v1}/admin/projects/:slug`, admin, async (req) => {
    const { slug } = req.params as { slug: string };
    const p = projectSchema.parse({ ...(req.body as object), slug });
    store.upsertProject(p);
    return store.getProject(slug);
  });
  app.delete(`${v1}/admin/projects/:slug`, admin, async (req, reply) => {
    const { slug } = req.params as { slug: string };
    return store.deleteProject(slug) ? reply.code(204).send() : reply.code(404).send({ error: 'not_found' });
  });

  app.get(`${v1}/admin/posts`, admin, async () => ({ items: store.listPosts(true) }));
  app.post(`${v1}/admin/posts`, admin, async (req, reply) => {
    const p = postSchema.parse(req.body);
    if (store.getPost(p.slug, true)) return reply.code(409).send({ error: 'slug_taken' });
    return reply.code(201).send(store.savePost(p));
  });
  app.put(`${v1}/admin/posts/:slug`, admin, async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const p = postSchema.parse(req.body);
    if (!store.getPost(slug, true)) return reply.code(404).send({ error: 'not_found' });
    if (p.slug !== slug && store.getPost(p.slug, true)) return reply.code(409).send({ error: 'slug_taken' });
    return store.savePost(p, slug);
  });
  app.delete(`${v1}/admin/posts/:slug`, admin, async (req, reply) => {
    const { slug } = req.params as { slug: string };
    return store.deletePost(slug) ? reply.code(204).send() : reply.code(404).send({ error: 'not_found' });
  });

  app.get(`${v1}/admin/analytics`, admin, async () => store.analytics());

  return app;
}
