import { createRequire } from 'node:module';
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { PROJECTS, type AnalyticsSummary, type ContactInput, type MessageRecord, type Post, type PostRecord, type Project } from '@portfolio/shared';
import { hashPassword } from './security';

// node:sqlite is loaded through require so bundlers and test runners do not rewrite the specifier.
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as typeof import('node:sqlite');

type Row = Record<string, unknown>;

export class Store {
  readonly db: DatabaseSyncType;

  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    this.migrate();
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS projects (
        slug TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        summary TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        featured INTEGER NOT NULL DEFAULT 0,
        org TEXT,
        repo_url TEXT,
        demo_url TEXT,
        sections TEXT NOT NULL DEFAULT '{}',
        sort_order INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        body TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        published INTEGER NOT NULL DEFAULT 0,
        published_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS pageviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        referrer_host TEXT,
        day TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_pageviews_day ON pageviews(day);
    `);
  }

  // ---------- seed ----------
  async seed(admin?: { email?: string; password?: string }) {
    const count = (this.db.prepare('SELECT COUNT(*) AS n FROM projects').get() as { n: number }).n;
    if (count === 0) PROJECTS.forEach((p) => this.upsertProject(p));
    if (admin?.email && admin.password) {
      const exists = this.db.prepare('SELECT id FROM users WHERE email = ?').get(admin.email.toLowerCase());
      if (!exists) {
        this.db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(admin.email.toLowerCase(), await hashPassword(admin.password));
      }
    }
  }

  // ---------- users ----------
  findUser(email: string) {
    return this.db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email.toLowerCase()) as
      | { id: number; email: string; password_hash: string }
      | undefined;
  }

  // ---------- projects ----------
  private toProject(r: Row): Project {
    return {
      slug: r.slug as string,
      title: r.title as string,
      category: r.category as string,
      summary: r.summary as string,
      tags: JSON.parse(r.tags as string),
      featured: !!r.featured,
      ...(r.org ? { org: r.org as string } : {}),
      ...(r.repo_url ? { repoUrl: r.repo_url as string } : {}),
      ...(r.demo_url ? { demoUrl: r.demo_url as string } : {}),
      sections: JSON.parse(r.sections as string),
      sortOrder: r.sort_order as number,
    };
  }
  listProjects(): Project[] {
    return (this.db.prepare('SELECT * FROM projects ORDER BY sort_order, title').all() as Row[]).map((r) => this.toProject(r));
  }
  getProject(slug: string): Project | undefined {
    const r = this.db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as Row | undefined;
    return r ? this.toProject(r) : undefined;
  }
  upsertProject(p: Project) {
    this.db
      .prepare(
        `INSERT INTO projects (slug,title,category,summary,tags,featured,org,repo_url,demo_url,sections,sort_order)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(slug) DO UPDATE SET title=excluded.title, category=excluded.category, summary=excluded.summary,
           tags=excluded.tags, featured=excluded.featured, org=excluded.org, repo_url=excluded.repo_url,
           demo_url=excluded.demo_url, sections=excluded.sections, sort_order=excluded.sort_order`,
      )
      .run(p.slug, p.title, p.category, p.summary, JSON.stringify(p.tags), p.featured ? 1 : 0, p.org ?? null, p.repoUrl ?? null, p.demoUrl ?? null, JSON.stringify(p.sections), p.sortOrder);
  }
  deleteProject(slug: string) {
    return Number(this.db.prepare('DELETE FROM projects WHERE slug = ?').run(slug).changes) > 0;
  }

  // ---------- posts ----------
  private toPost(r: Row): PostRecord {
    return {
      id: r.id as number,
      slug: r.slug as string,
      title: r.title as string,
      excerpt: r.excerpt as string,
      body: r.body as string,
      tags: JSON.parse(r.tags as string),
      published: !!r.published,
      publishedAt: (r.published_at as string | null) ?? null,
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    };
  }
  listPosts(includeDrafts: boolean): PostRecord[] {
    const sql = includeDrafts ? 'SELECT * FROM posts ORDER BY created_at DESC' : 'SELECT * FROM posts WHERE published = 1 ORDER BY published_at DESC';
    return (this.db.prepare(sql).all() as Row[]).map((r) => this.toPost(r));
  }
  getPost(slug: string, includeDrafts: boolean): PostRecord | undefined {
    const r = this.db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug) as Row | undefined;
    if (!r) return undefined;
    const post = this.toPost(r);
    return post.published || includeDrafts ? post : undefined;
  }
  savePost(p: Post, originalSlug?: string): PostRecord {
    const publishedAt = p.published ? (p.publishedAt ?? new Date().toISOString()) : null;
    const tags = JSON.stringify(p.tags);
    if (originalSlug && this.getPost(originalSlug, true)) {
      this.db
        .prepare(`UPDATE posts SET slug=?, title=?, excerpt=?, body=?, tags=?, published=?, published_at=?, updated_at=datetime('now') WHERE slug=?`)
        .run(p.slug, p.title, p.excerpt, p.body, tags, p.published ? 1 : 0, publishedAt, originalSlug);
    } else {
      this.db
        .prepare('INSERT INTO posts (slug,title,excerpt,body,tags,published,published_at) VALUES (?,?,?,?,?,?,?)')
        .run(p.slug, p.title, p.excerpt, p.body, tags, p.published ? 1 : 0, publishedAt);
    }
    return this.getPost(p.slug, true)!;
  }
  deletePost(slug: string) {
    return Number(this.db.prepare('DELETE FROM posts WHERE slug = ?').run(slug).changes) > 0;
  }

  // ---------- messages ----------
  addMessage(m: Pick<ContactInput, 'name' | 'email' | 'subject' | 'message'>) {
    const r = this.db.prepare('INSERT INTO messages (name,email,subject,message) VALUES (?,?,?,?)').run(m.name, m.email, m.subject, m.message);
    return Number(r.lastInsertRowid);
  }
  listMessages(): MessageRecord[] {
    return (this.db.prepare('SELECT * FROM messages ORDER BY id DESC').all() as Row[]).map((r) => ({
      id: r.id as number,
      name: r.name as string,
      email: r.email as string,
      subject: r.subject as string,
      message: r.message as string,
      read: !!r.read,
      createdAt: r.created_at as string,
    }));
  }
  setMessageRead(id: number, read: boolean) {
    return Number(this.db.prepare('UPDATE messages SET read = ? WHERE id = ?').run(read ? 1 : 0, id).changes) > 0;
  }
  deleteMessage(id: number) {
    return Number(this.db.prepare('DELETE FROM messages WHERE id = ?').run(id).changes) > 0;
  }

  // ---------- analytics (no IP, no user agent, no cookies) ----------
  addPageview(path: string, referrer?: string) {
    let host: string | null = null;
    try {
      host = referrer ? new URL(referrer).host : null;
    } catch {
      host = null;
    }
    this.db.prepare('INSERT INTO pageviews (path, referrer_host, day) VALUES (?,?,?)').run(path, host, new Date().toISOString().slice(0, 10));
  }
  analytics(): AnalyticsSummary {
    const total = (this.db.prepare('SELECT COUNT(*) AS n FROM pageviews').get() as { n: number }).n;
    const since = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
    const byDay = this.db.prepare('SELECT day, COUNT(*) AS views FROM pageviews WHERE day >= ? GROUP BY day ORDER BY day').all(since) as { day: string; views: number }[];
    const topPaths = this.db.prepare('SELECT path, COUNT(*) AS views FROM pageviews GROUP BY path ORDER BY views DESC LIMIT 8').all() as { path: string; views: number }[];
    return { total, last7Days: byDay.reduce((a, b) => a + b.views, 0), byDay, topPaths };
  }

  close() {
    this.db.close();
  }
}
