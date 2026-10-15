import type { Project } from '@portfolio/shared';

export type ProjectFilters = { category: string; tech: string; q: string };

export const categoriesOf = (projects: Project[]) => [...new Set(projects.map((p) => p.category))].sort();
export const techOf = (projects: Project[]) => [...new Set(projects.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));

export function filterProjects(projects: Project[], f: ProjectFilters): Project[] {
  const q = f.q.trim().toLowerCase();
  return projects.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.tech && !p.tags.includes(f.tech)) return false;
    if (q) {
      const hay = [p.title, p.summary, p.category, ...p.tags].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export const sortProjects = (projects: Project[]) =>
  [...projects].sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
