import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@portfolio/shared';
import { Tag } from '@/components/ui/ui';

export function ProjectCard({ project, index }: { project: Project; index?: number }) {
  const animDelay = typeof index === 'number' ? `${0.08 + index * 0.08}s` : '0s';

  return (
    <article
      style={{ animationDelay: animDelay }}
      className="card-3d animate-popup-3d group relative flex h-full flex-col p-6 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className="label font-bold text-fg/80">{project.category}</span>
        {typeof index === 'number' && <span className="label tabular font-extrabold text-gold">{String(index + 1).padStart(2, '0')}</span>}
      </div>
      <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-fg transition-colors group-hover:text-gold">
        <Link to={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:content-['']">
          {project.title}
        </Link>
      </h3>
      {project.org && <p className="mt-1 text-sm font-semibold text-gold">{project.org}</p>}
      <p className="mt-3 flex-1 font-medium text-muted leading-relaxed">{project.summary}</p>
      {project.tags.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
          {project.tags.map((t) => (
            <li key={t}><Tag className="bg-black/15 border-black/20 text-fg font-medium">{t}</Tag></li>
          ))}
        </ul>
      )}
      <ArrowUpRight aria-hidden className="absolute right-5 top-5 text-fg/50 opacity-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:scale-125 group-hover:text-gold group-hover:opacity-100" size={20} />
    </article>
  );
}
