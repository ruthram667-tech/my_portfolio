import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageHeader, Section, EmptyState } from '@/components/layout/layout';
import { Button, Chip, Input } from '@/components/ui/ui';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects } from '@/data-access';
import { categoriesOf, filterProjects, sortProjects, techOf } from '@/lib/filters';
import { useSeo } from '@/lib/seo';

export function Projects() {
  useSeo('Projects', 'Projects by Ruthramoorthy S B across IoT, machine learning, data and web.');
  const { data: projects = [], isLoading } = useProjects();
  const [params, setParams] = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const filters = { category: params.get('category') ?? '', tech: params.get('tech') ?? '', q: params.get('q') ?? '' };

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(t.tagName)) { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const categories = useMemo(() => categoriesOf(projects), [projects]);
  const tech = useMemo(() => techOf(projects), [projects]);
  const results = useMemo(() => sortProjects(filterProjects(projects, filters)), [projects, filters.category, filters.tech, filters.q]); // eslint-disable-line react-hooks/exhaustive-deps
  const active = filters.category || filters.tech || filters.q;

  return (
    <>
      <PageHeader title="Projects" description="Hardware, data and web products. Filter by category or technology." crumbs={[{ label: 'Projects' }]} />
      <Section>
        <div className="mb-8 space-y-3">
          <div className="relative max-w-md">
            <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
            <Input ref={searchRef} type="search" aria-label="Search projects" placeholder="Search projects (press /)" className="pl-10" value={filters.q} onChange={(e) => set('q', e.target.value)} />
          </div>
          <p className="label">Category</p>
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            <Chip active={!filters.category} onClick={() => set('category', '')}>All</Chip>
            {categories.map((c) => <Chip key={c} active={filters.category === c} onClick={() => set('category', filters.category === c ? '' : c)}>{c}</Chip>)}
          </div>
          <p className="label">Technology</p>
          <div role="group" aria-label="Filter by technology" className="flex flex-wrap gap-2">
            {tech.map((t) => <Chip key={t} active={filters.tech === t} onClick={() => set('tech', filters.tech === t ? '' : t)}>{t}</Chip>)}
          </div>
        </div>
        <p className="mb-5 text-sm text-muted" aria-live="polite">{isLoading ? 'Loading projects…' : `${results.length} ${results.length === 1 ? 'project' : 'projects'}`}</p>
        {results.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{results.map((p, i) => <ProjectCard key={p.slug} project={p} index={i} />)}</div>
        ) : !isLoading ? (
          <EmptyState title="No projects match" text="Try a different search or clear the filters.">
            {active ? <Button variant="outline" onClick={() => setParams({}, { replace: true })}>Clear filters</Button> : null}
          </EmptyState>
        ) : null}
      </Section>
    </>
  );
}
