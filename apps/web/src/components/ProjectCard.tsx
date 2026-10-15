import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@portfolio/shared';
import { Tag } from '@/components/ui/ui';

export function ProjectCard({ project, index }: { project: Project; index?: number }) {
  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-line bg-surface p-6 transition-colors duration-200 hover:border-gold-dim hover:bg-surface-2">
      <div className="flex items-center justify-between">
        <span className="label">{project.category}</span>
        {typeof index === 'number' && <span className="label tabular">{String(index + 1).padStart(2, '0')}</span>}
      </div>
      <h3 className="mt-5 text-2xl font-bold tracking-tight">
        <Link to={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:content-['']">
          {project.title}
        </Link>
      </h3>
      {project.org && <p className="mt-1 text-sm text-gold">{project.org}</p>}
      <p className="mt-3 flex-1 text-muted">{project.summary}</p>
      {project.tags.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
          {project.tags.map((t) => (
            <li key={t}><Tag>{t}</Tag></li>
          ))}
        </ul>
      )}
      <ArrowUpRight aria-hidden className="absolute right-5 top-5 text-subtle opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold group-hover:opacity-100" size={18} />
    </article>
  );
}
