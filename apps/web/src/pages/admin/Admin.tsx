import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import type { AnalyticsSummary, MessageRecord, PostRecord, Project } from '@portfolio/shared';
import { Container, PageHeader, Section } from '@/components/layout/layout';
import { Button, Field, Input, Textarea, Chip } from '@/components/ui/ui';
import { api, ApiError, hasApi } from '@/lib/api';
import { useSeo } from '@/lib/seo';

type Tab = 'messages' | 'projects' | 'posts' | 'analytics';
const errText = (e: unknown) => (e instanceof ApiError ? (e.issues?.map((i) => `${i.path}: ${i.message}`).join('; ') || e.message) : 'Something went wrong');

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const m = useMutation({
    mutationFn: () => api('/auth/login', { method: 'POST', json: { email, password } }),
    onSuccess: onDone,
    onError: (e) => setError(e instanceof ApiError && e.status === 429 ? 'Too many attempts. Try again in a few minutes.' : e instanceof ApiError && e.status === 401 ? 'Wrong email or password.' : 'Could not sign in.'),
  });
  const submit = (e: FormEvent) => { e.preventDefault(); setError(''); m.mutate(); };
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-5 rounded-lg border border-line bg-surface p-6">
      <Field id="a-email" label="Email"><Input id="a-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
      <Field id="a-pass" label="Password"><Input id="a-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
      <Button type="submit" disabled={m.isPending} className="w-full">{m.isPending ? 'Signing in…' : 'Sign in'}</Button>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </form>
  );
}

function Messages() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin', 'messages'], queryFn: () => api<{ items: MessageRecord[] }>('/admin/messages') });
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin', 'messages'] });
  const read = useMutation({ mutationFn: (v: { id: number; read: boolean }) => api(`/admin/messages/${v.id}`, { method: 'PATCH', json: { read: v.read } }), onSuccess: refresh });
  const del = useMutation({ mutationFn: (id: number) => api(`/admin/messages/${id}`, { method: 'DELETE' }), onSuccess: refresh });
  const items = data?.items ?? [];
  if (!items.length) return <p className="text-muted">No messages yet.</p>;
  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <li key={m.id} className="rounded-lg border border-line bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{m.subject} {!m.read && <span className="ml-2 rounded-sm bg-gold px-1.5 py-0.5 text-xs text-on-gold">New</span>}</p>
              <p className="text-sm text-muted">{m.name} · <a className="text-gold hover:underline" href={`mailto:${m.email}`}>{m.email}</a> · {new Date(m.createdAt.replace(' ', 'T') + 'Z').toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => read.mutate({ id: m.id, read: !m.read })}>{m.read ? 'Mark unread' : 'Mark read'}</Button>
              <Button size="sm" variant="outline" aria-label={`Delete message from ${m.name}`} onClick={() => confirm('Delete this message?') && del.mutate(m.id)}><Trash2 size={14} aria-hidden /></Button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-muted">{m.message}</p>
        </li>
      ))}
    </ul>
  );
}

const emptyProject: Project = { slug: '', title: '', category: '', summary: '', tags: [], featured: false, sections: {}, sortOrder: 100 };

function ProjectEditor({ initial, isNew, onClose }: { initial: Project; isNew: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [p, setP] = useState<Project>(initial);
  const [tags, setTags] = useState(initial.tags.join(', '));
  const [error, setError] = useState('');
  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = { ...p, tags: tags.split(',').map((t) => t.trim()).filter(Boolean) };
      (['org', 'repoUrl', 'demoUrl'] as const).forEach((k) => { if (!body[k]) delete body[k]; });
      body.sections = Object.fromEntries(Object.entries(p.sections).filter(([, v]) => v));
      return api(`/admin/projects/${p.slug}`, { method: 'PUT', json: body });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); onClose(); },
    onError: (e) => setError(errText(e)),
  });
  const sec = (k: 'overview' | 'challenge' | 'solution' | 'result') => (
    <Field id={`p-${k}`} label={k[0]!.toUpperCase() + k.slice(1)}><Textarea id={`p-${k}`} value={p.sections[k] ?? ''} onChange={(e) => setP({ ...p, sections: { ...p.sections, [k]: e.target.value } })} /></Field>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); setError(''); save.mutate(); }} className="space-y-4 rounded-lg border border-gold-dim bg-surface p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="p-slug" label="Slug" hint="lowercase-with-dashes, cannot change later"><Input id="p-slug" value={p.slug} disabled={!isNew} onChange={(e) => setP({ ...p, slug: e.target.value })} required /></Field>
        <Field id="p-title" label="Title"><Input id="p-title" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} required /></Field>
        <Field id="p-cat" label="Category"><Input id="p-cat" value={p.category} onChange={(e) => setP({ ...p, category: e.target.value })} required /></Field>
        <Field id="p-org" label="Venture (optional)"><Input id="p-org" value={p.org ?? ''} onChange={(e) => setP({ ...p, org: e.target.value })} /></Field>
        <Field id="p-repo" label="Repo URL (optional)"><Input id="p-repo" type="url" value={p.repoUrl ?? ''} onChange={(e) => setP({ ...p, repoUrl: e.target.value })} /></Field>
        <Field id="p-demo" label="Demo URL (optional)"><Input id="p-demo" type="url" value={p.demoUrl ?? ''} onChange={(e) => setP({ ...p, demoUrl: e.target.value })} /></Field>
      </div>
      <Field id="p-sum" label="Summary"><Textarea id="p-sum" value={p.summary} onChange={(e) => setP({ ...p, summary: e.target.value })} required /></Field>
      <Field id="p-tags" label="Technologies" hint="Comma separated"><Input id="p-tags" value={tags} onChange={(e) => setTags(e.target.value)} /></Field>
      {sec('overview')}{sec('challenge')}{sec('solution')}{sec('result')}
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.featured} onChange={(e) => setP({ ...p, featured: e.target.checked })} /> Featured on home</label>
        <label className="flex items-center gap-2 text-sm">Order <Input className="w-24" type="number" value={p.sortOrder} onChange={(e) => setP({ ...p, sortOrder: Number(e.target.value) })} /></label>
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3"><Button type="submit" disabled={save.isPending}>Save</Button><Button type="button" variant="outline" onClick={onClose}>Cancel</Button></div>
    </form>
  );
}

function Projects() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['projects'], queryFn: () => api<{ items: Project[] }>('/projects') });
  const [editing, setEditing] = useState<{ p: Project; isNew: boolean } | null>(null);
  const del = useMutation({ mutationFn: (slug: string) => api(`/admin/projects/${slug}`, { method: 'DELETE' }), onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }) });
  if (editing) return <ProjectEditor initial={editing.p} isNew={editing.isNew} onClose={() => setEditing(null)} />;
  return (
    <div className="space-y-4">
      <Button onClick={() => setEditing({ p: emptyProject, isNew: true })}>New project</Button>
      <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
        {(data?.items ?? []).map((p) => (
          <li key={p.slug} className="flex items-center justify-between gap-3 p-4">
            <div><p className="font-semibold">{p.title}</p><p className="text-sm text-muted">{p.category} · /{p.slug}</p></div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing({ p, isNew: false })}>Edit</Button>
              <Button size="sm" variant="outline" aria-label={`Delete ${p.title}`} onClick={() => confirm(`Delete ${p.title}?`) && del.mutate(p.slug)}><Trash2 size={14} aria-hidden /></Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type PostForm = { slug: string; title: string; excerpt: string; body: string; tags: string; published: boolean };
function PostEditor({ original, onClose }: { original?: PostRecord; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState<PostForm>({ slug: original?.slug ?? '', title: original?.title ?? '', excerpt: original?.excerpt ?? '', body: original?.body ?? '', tags: original?.tags.join(', ') ?? '', published: original?.published ?? false });
  const [error, setError] = useState('');
  const save = useMutation({
    mutationFn: () => {
      const json = { slug: f.slug, title: f.title, excerpt: f.excerpt, body: f.body, tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean), published: f.published, publishedAt: original?.publishedAt ?? undefined };
      return original ? api(`/admin/posts/${original.slug}`, { method: 'PUT', json }) : api('/admin/posts', { method: 'POST', json });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'posts'] }); qc.invalidateQueries({ queryKey: ['posts'] }); onClose(); },
    onError: (e) => setError(e instanceof ApiError && e.status === 409 ? 'That slug is already used.' : errText(e)),
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); setError(''); save.mutate(); }} className="space-y-4 rounded-lg border border-gold-dim bg-surface p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="b-title" label="Title"><Input id="b-title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required /></Field>
        <Field id="b-slug" label="Slug"><Input id="b-slug" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} required /></Field>
      </div>
      <Field id="b-ex" label="Excerpt"><Textarea id="b-ex" className="min-h-20" value={f.excerpt} onChange={(e) => setF({ ...f, excerpt: e.target.value })} required /></Field>
      <Field id="b-body" label="Body (Markdown)"><Textarea id="b-body" className="min-h-64 font-mono text-sm" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} required /></Field>
      <Field id="b-tags" label="Tags" hint="Comma separated"><Input id="b-tags" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} /> Published (visible on the site)</label>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3"><Button type="submit" disabled={save.isPending}>Save</Button><Button type="button" variant="outline" onClick={onClose}>Cancel</Button></div>
    </form>
  );
}

function Posts() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin', 'posts'], queryFn: () => api<{ items: PostRecord[] }>('/admin/posts') });
  const [editing, setEditing] = useState<{ post?: PostRecord } | null>(null);
  const del = useMutation({ mutationFn: (slug: string) => api(`/admin/posts/${slug}`, { method: 'DELETE' }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'posts'] }); qc.invalidateQueries({ queryKey: ['posts'] }); } });
  if (editing) return <PostEditor original={editing.post} onClose={() => setEditing(null)} />;
  return (
    <div className="space-y-4">
      <Button onClick={() => setEditing({})}>New post</Button>
      {data?.items.length ? (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {data.items.map((p) => (
            <li key={p.slug} className="flex items-center justify-between gap-3 p-4">
              <div><p className="font-semibold">{p.title}</p><p className="text-sm text-muted">{p.published ? 'Published' : 'Draft'} · /{p.slug}</p></div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing({ post: p })}>Edit</Button>
                <Button size="sm" variant="outline" aria-label={`Delete ${p.title}`} onClick={() => confirm(`Delete ${p.title}?`) && del.mutate(p.slug)}><Trash2 size={14} aria-hidden /></Button>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="text-muted">No posts yet.</p>}
    </div>
  );
}

function Analytics() {
  const { data } = useQuery({ queryKey: ['admin', 'analytics'], queryFn: () => api<AnalyticsSummary>('/admin/analytics') });
  if (!data) return null;
  const max = Math.max(1, ...data.byDay.map((d) => d.views));
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-5"><p className="label">Total page views</p><p className="tabular mt-1 text-4xl font-bold">{data.total}</p></div>
        <div className="rounded-lg border border-line bg-surface p-5"><p className="label">Last 7 days</p><p className="tabular mt-1 text-4xl font-bold text-gold">{data.last7Days}</p></div>
      </div>
      <div>
        <p className="label mb-3">Views per day</p>
        {data.byDay.length ? (
          <ul className="space-y-2">{data.byDay.map((d) => (
            <li key={d.day} className="flex items-center gap-3 text-sm"><span className="tabular w-28 shrink-0 whitespace-nowrap text-muted">{d.day}</span><span className="h-3 rounded-sm bg-gold" style={{ width: `${(d.views / max) * 100}%`, minWidth: 4 }} /><span className="tabular">{d.views}</span></li>
          ))}</ul>
        ) : <p className="text-muted">No data yet.</p>}
      </div>
      <div>
        <p className="label mb-3">Top pages</p>
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">{data.topPaths.map((t) => <li key={t.path} className="flex justify-between p-3 text-sm"><span>{t.path}</span><span className="tabular text-muted">{t.views}</span></li>)}</ul>
        <p className="mt-3 text-xs text-subtle">Counts only. No IP address, cookie or device information is stored.</p>
      </div>
    </div>
  );
}

export function Admin() {
  useSeo('Admin', 'Admin dashboard.');
  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex,nofollow';
    document.head.appendChild(m);
    return () => m.remove();
  }, []);
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('messages');
  const me = useQuery({ queryKey: ['me'], queryFn: () => api<{ email: string }>('/auth/me'), retry: false, enabled: hasApi });
  const logout = useMutation({ mutationFn: () => api('/auth/logout', { method: 'POST' }), onSuccess: () => qc.resetQueries({ queryKey: ['me'] }) });

  if (!hasApi) {
    return (<><PageHeader title="Admin" description="Sign in to manage content." /><Section><p className="max-w-lg text-muted">The admin dashboard needs the backend API. Set <code className="text-fg">VITE_API_URL</code> to your API address and rebuild.</p></Section></>);
  }
  const authed = !!me.data;
  return (
    <>
      <PageHeader title="Admin" description={authed ? `Signed in as ${me.data.email}` : 'Sign in to manage content.'}>
        {authed && <Button variant="outline" size="sm" onClick={() => logout.mutate()}>Sign out</Button>}
      </PageHeader>
      <Section>
        {me.isLoading ? <p className="text-muted">Checking session…</p> : !authed ? (
          <Login onDone={() => qc.invalidateQueries({ queryKey: ['me'] })} />
        ) : (
          <Container className="px-0 sm:px-0">
            <div role="tablist" aria-label="Admin sections" className="mb-8 flex flex-wrap gap-2">
              {(['messages', 'projects', 'posts', 'analytics'] as Tab[]).map((t) => <Chip key={t} role="tab" aria-selected={tab === t} active={tab === t} onClick={() => setTab(t)}>{t[0]!.toUpperCase() + t.slice(1)}</Chip>)}
            </div>
            <div role="tabpanel">
              {tab === 'messages' && <Messages />}
              {tab === 'projects' && <Projects />}
              {tab === 'posts' && <Posts />}
              {tab === 'analytics' && <Analytics />}
            </div>
          </Container>
        )}
      </Section>
    </>
  );
}
