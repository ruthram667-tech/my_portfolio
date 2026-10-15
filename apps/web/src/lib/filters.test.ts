import { describe, expect, it } from 'vitest';
import { PROJECTS } from '@portfolio/shared';
import { categoriesOf, filterProjects, sortProjects, techOf } from './filters';

describe('project filters', () => {
  it('returns everything with empty filters', () => {
    expect(filterProjects(PROJECTS, { category: '', tech: '', q: '' })).toHaveLength(PROJECTS.length);
  });
  it('filters by technology', () => {
    const r = filterProjects(PROJECTS, { category: '', tech: 'IoT', q: '' });
    expect(r.length).toBeGreaterThan(0);
    r.forEach((p) => expect(p.tags).toContain('IoT'));
  });
  it('searches title, summary and tags case-insensitively', () => {
    expect(filterProjects(PROJECTS, { category: '', tech: '', q: 'buffex' }).map((p) => p.slug)).toContain('buffex');
    expect(filterProjects(PROJECTS, { category: '', tech: '', q: 'zzzz-no-match' })).toHaveLength(0);
  });
  it('builds option lists from the data', () => {
    expect(categoriesOf(PROJECTS).length).toBeGreaterThan(2);
    expect(techOf(PROJECTS)).toContain('React');
  });
  it('puts featured projects first', () => {
    const s = sortProjects(PROJECTS);
    expect(s[0].featured).toBe(true);
  });
});
