import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { loadConfig } from '../src/config';
import { Store } from '../src/db';

const H = { 'x-requested-with': 'portfolio' };
let app: FastifyInstance;
let store: Store;

beforeAll(async () => {
  const config = loadConfig({ NODE_ENV: 'test', JWT_SECRET: 'x'.repeat(40), ADMIN_EMAIL: 'admin@example.com', ADMIN_PASSWORD: 'correct horse battery' } as NodeJS.ProcessEnv);
  store = new Store(':memory:');
  await store.seed({ email: config.adminEmail, password: config.adminPassword });
  app = await buildApp(config, store);
});
afterAll(async () => {
  await app.close();
  store.close();
});

const login = async () => {
  const r = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: H, payload: { email: 'admin@example.com', password: 'correct horse battery' } });
  const cookie = (r.cookies[0] as { name: string; value: string });
  return { r, cookie: `${cookie.name}=${cookie.value}` };
};

describe('public api', () => {
  it('health', async () => {
    const r = await app.inject({ method: 'GET', url: '/api/v1/health' });
    expect(r.statusCode).toBe(200);
    expect(r.json().status).toBe('ok');
  });
  it('lists seeded projects and gets one by slug', async () => {
    const list = await app.inject({ method: 'GET', url: '/api/v1/projects' });
    expect(list.json().items.length).toBeGreaterThanOrEqual(7);
    const one = await app.inject({ method: 'GET', url: '/api/v1/projects/buffex' });
    expect(one.json().title).toBe('Buffex');
    expect((await app.inject({ method: 'GET', url: '/api/v1/projects/nope' })).statusCode).toBe(404);
  });
  it('stores a valid contact message', async () => {
    const r = await app.inject({ method: 'POST', url: '/api/v1/contact', payload: { name: 'Ann', email: 'ann@example.com', subject: 'Hello', message: 'I would like to talk about a project.' } });
    expect(r.statusCode).toBe(201);
    expect(store.listMessages().some((m) => m.email === 'ann@example.com')).toBe(true);
  });
  it('rejects invalid contact input with 400', async () => {
    const r = await app.inject({ method: 'POST', url: '/api/v1/contact', payload: { name: '', email: 'bad', subject: '', message: 'short' } });
    expect(r.statusCode).toBe(400);
  });
  it('silently drops honeypot submissions', async () => {
    const before = store.listMessages().length;
    const r = await app.inject({ method: 'POST', url: '/api/v1/contact', payload: { name: 'Bot', email: 'bot@example.com', subject: 'Spam', message: 'Buy cheap stuff now please', website: 'http://spam' } });
    expect(r.statusCode).toBe(202);
    expect(store.listMessages().length).toBe(before);
  });
  it('records page views without personal data', async () => {
    const r = await app.inject({ method: 'POST', url: '/api/v1/analytics/pageview', payload: { path: '/projects', referrer: 'https://example.org/page?x=1' } });
    expect(r.statusCode).toBe(204);
  });
});

describe('auth and admin', () => {
  it('blocks admin routes without a session', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/v1/admin/messages' })).statusCode).toBe(401);
  });
  it('rejects wrong password and login without the CSRF header', async () => {
    const bad = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: H, payload: { email: 'admin@example.com', password: 'wrong' } });
    expect(bad.statusCode).toBe(401);
    const noHeader = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'admin@example.com', password: 'correct horse battery' } });
    expect(noHeader.statusCode).toBe(403);
  });
  it('logs in, sets an httpOnly cookie and reads /auth/me', async () => {
    const { r, cookie } = await login();
    expect(r.statusCode).toBe(200);
    expect((r.cookies[0] as { httpOnly?: boolean }).httpOnly).toBe(true);
    const me = await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie } });
    expect(me.json().email).toBe('admin@example.com');
  });
  it('requires the CSRF header for admin writes', async () => {
    const { cookie } = await login();
    const r = await app.inject({ method: 'DELETE', url: '/api/v1/admin/projects/hydronix', headers: { cookie } });
    expect(r.statusCode).toBe(403);
  });
  it('manages posts: draft hidden publicly, visible once published', async () => {
    const { cookie } = await login();
    const headers = { cookie, ...H };
    const created = await app.inject({ method: 'POST', url: '/api/v1/admin/posts', headers, payload: { slug: 'first-post', title: 'First', excerpt: 'Short', body: 'Body text', tags: ['a'], published: false } });
    expect(created.statusCode).toBe(201);
    expect((await app.inject({ method: 'GET', url: '/api/v1/posts/first-post' })).statusCode).toBe(404);
    const updated = await app.inject({ method: 'PUT', url: '/api/v1/admin/posts/first-post', headers, payload: { slug: 'first-post', title: 'First', excerpt: 'Short', body: 'Body text', tags: ['a'], published: true } });
    expect(updated.statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/api/v1/posts/first-post' })).json().title).toBe('First');
    expect((await app.inject({ method: 'POST', url: '/api/v1/admin/posts', headers, payload: { slug: 'first-post', title: 'Dup', excerpt: 'x', body: 'y' } })).statusCode).toBe(409);
    expect((await app.inject({ method: 'DELETE', url: '/api/v1/admin/posts/first-post', headers })).statusCode).toBe(204);
  });
  it('lists messages, marks read, shows analytics, edits and deletes a project', async () => {
    const { cookie } = await login();
    const headers = { cookie, ...H };
    const msgs = (await app.inject({ method: 'GET', url: '/api/v1/admin/messages', headers })).json().items;
    expect(msgs.length).toBeGreaterThan(0);
    expect((await app.inject({ method: 'PATCH', url: `/api/v1/admin/messages/${msgs[0].id}`, headers, payload: { read: true } })).statusCode).toBe(200);
    const an = (await app.inject({ method: 'GET', url: '/api/v1/admin/analytics', headers })).json();
    expect(an.total).toBeGreaterThan(0);
    const put = await app.inject({ method: 'PUT', url: '/api/v1/admin/projects/hydronix', headers, payload: { title: 'Hydronix', category: 'Data', summary: 'Edited summary', tags: ['IoT'], featured: false, sections: {}, sortOrder: 4 } });
    expect(put.json().summary).toBe('Edited summary');
    expect((await app.inject({ method: 'DELETE', url: '/api/v1/admin/projects/hydronix', headers })).statusCode).toBe(204);
  });
});
