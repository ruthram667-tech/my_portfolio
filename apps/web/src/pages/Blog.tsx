import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Container, EmptyState, PageHeader, Section } from '@/components/layout/layout';
import { Tag } from '@/components/ui/ui';
import { usePost, usePosts } from '@/data-access';
import { Markdown } from '@/lib/markdown';
import { useSeo } from '@/lib/seo';
import { NotFound } from './NotFound';

const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const minutes = (text: string) => Math.max(1, Math.round(text.split(/\s+/).length / 220));

export function Blog() {
  useSeo('Blog', 'Writing by Ruthramoorthy S B on IoT, machine learning and building software.');
  const { data: posts = [], isLoading } = usePosts();
  return (
    <>
      <PageHeader title="Blog" description="Notes on building IoT, ML and software products." crumbs={[{ label: 'Blog' }]} />
      <Section>
        {posts.length ? (
          <ul className="grid gap-5 md:grid-cols-2">
            {posts.map((p) => (
              <li key={p.slug}>
                <article className="relative h-full rounded-lg border border-line bg-surface p-6 hover:border-gold-dim">
                  <p className="label">{fmt(p.publishedAt)} · {minutes(p.body)} min read</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight"><Link to={`/blog/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">{p.title}</Link></h2>
                  <p className="mt-2 text-muted">{p.excerpt}</p>
                  {p.tags.length > 0 && <ul className="mt-4 flex flex-wrap gap-1.5">{p.tags.map((t) => <li key={t}><Tag>{t}</Tag></li>)}</ul>}
                </article>
              </li>
            ))}
          </ul>
        ) : !isLoading ? (
          <EmptyState title="Posts are coming soon" text="Nothing has been published yet." />
        ) : null}
      </Section>
    </>
  );
}

export function BlogPost() {
  const { slug = '' } = useParams();
  const { data: post, isLoading } = usePost(slug);
  useSeo(post?.title ?? 'Post', post?.excerpt ?? 'Blog post');
  if (isLoading) return <Container className="py-40"><p className="text-muted">Loading…</p></Container>;
  if (!post) return <NotFound />;
  return (
    <>
      <PageHeader title={post.title} description={post.excerpt} crumbs={[{ label: 'Blog', to: '/blog' }, { label: post.title }]}>
        <p className="label">{fmt(post.publishedAt)} · {minutes(post.body)} min read</p>
      </PageHeader>
      <Section>
        <Container narrow className="px-0 sm:px-0"><Markdown source={post.body} /></Container>
        <div className="mx-auto mt-12 max-w-3xl"><Link to="/blog" className="inline-flex items-center gap-2 text-gold hover:underline"><ArrowLeft size={16} aria-hidden />All posts</Link></div>
      </Section>
    </>
  );
}
