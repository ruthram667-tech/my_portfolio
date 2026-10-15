import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Container, PageHeader, Section } from '@/components/layout/layout';
import { ExternalLink, Tag } from '@/components/ui/ui';
import { useProject, useProjects } from '@/data-access';
import { sortProjects } from '@/lib/filters';
import { useSeo } from '@/lib/seo';
import { NotFound } from './NotFound';

const SECTION_LABELS = [
  ['overview', 'Overview'],
  ['challenge', 'Challenge'],
  ['solution', 'Solution'],
  ['result', 'Result'],
] as const;

export function ProjectDetail() {
  const { slug = '' } = useParams();
  const { data: project, isLoading } = useProject(slug);
  const { data: all = [] } = useProjects();
  useSeo(project?.title ?? 'Project', project?.summary ?? 'Project details');

  if (isLoading) return <Container className="py-40"><p className="text-muted">Loading…</p></Container>;
  if (!project) return <NotFound />;

  const ordered = sortProjects(all);
  const idx = ordered.findIndex((p) => p.slug === project.slug);
  const prev = idx > 0 ? ordered[idx - 1] : undefined;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : undefined;
  const sections = SECTION_LABELS.filter(([k]) => project.sections[k]);

  return (
    <>
      <PageHeader title={project.title} description={project.summary} crumbs={[{ label: 'Projects', to: '/projects' }, { label: project.title }]} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
          <div className="space-y-10">
            {sections.map(([k, label]) => (
              <section key={k} aria-labelledby={`s-${k}`}>
                <h2 id={`s-${k}`} className="text-2xl font-bold tracking-tight">{label}</h2>
                <p className="mt-3 text-lg text-muted">{project.sections[k]}</p>
              </section>
            ))}
          </div>
          <aside className="h-fit space-y-6 rounded-lg border border-line bg-surface p-6 lg:sticky lg:top-24">
            <div><p className="label">Category</p><p className="mt-1.5">{project.category}</p></div>
            {project.org && <div><p className="label">Venture</p><p className="mt-1.5 text-gold">{project.org}</p></div>}
            {project.tags.length > 0 && (
              <div><p className="label mb-2">Technologies</p><ul className="flex flex-wrap gap-1.5">{project.tags.map((t) => <li key={t}><Tag>{t}</Tag></li>)}</ul></div>
            )}
            {(project.repoUrl || project.demoUrl) && (
              <div className="space-y-2 text-sm">
                {project.repoUrl && <div><ExternalLink href={project.repoUrl}>Source code</ExternalLink></div>}
                {project.demoUrl && <div><ExternalLink href={project.demoUrl}>Live demo</ExternalLink></div>}
              </div>
            )}
          </aside>
        </div>
      </Section>
      <Container className="pb-8">
        <nav aria-label="More projects" className="grid gap-4 border-t border-line pt-10 sm:grid-cols-2">
          {prev ? <Link to={`/projects/${prev.slug}`} className="group rounded-lg border border-line p-5 hover:border-gold-dim"><span className="label inline-flex items-center gap-1.5"><ArrowLeft size={14} aria-hidden />Previous</span><span className="mt-2 block text-lg font-semibold group-hover:text-gold">{prev.title}</span></Link> : <span />}
          {next ? <Link to={`/projects/${next.slug}`} className="group rounded-lg border border-line p-5 text-right hover:border-gold-dim"><span className="label inline-flex items-center gap-1.5">Next<ArrowRight size={14} aria-hidden /></span><span className="mt-2 block text-lg font-semibold group-hover:text-gold">{next.title}</span></Link> : <span />}
        </nav>
      </Container>
    </>
  );
}
