import { Link } from 'react-router-dom';
import { PageHeader, Section } from '@/components/layout/layout';
import { Tag } from '@/components/ui/ui';
import { useProjects, useSkills } from '@/data-access';
import { useSeo } from '@/lib/seo';

export function Skills() {
  useSeo('Skills', 'Skills of Ruthramoorthy S B across AI, data, web and hardware.');
  const { data: groups = [] } = useSkills();
  const { data: projects = [] } = useProjects();
  const used = new Set(projects.flatMap((p) => p.tags));

  return (
    <>
      <PageHeader title="Skills" description="Grouped by area. Skills used in a project link to it." crumbs={[{ label: 'Skills' }]} />
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          {groups.map((g) => (
            <section key={g.group} aria-labelledby={`g-${g.group}`} className="rounded-lg border border-line bg-surface p-6">
              <h2 id={`g-${g.group}`} className="label">{g.group}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.skills.map((s) => (
                  <li key={s}>
                    {used.has(s) ? (
                      <Link to={`/projects?tech=${encodeURIComponent(s)}`} className="inline-flex items-center rounded-sm border border-gold-dim bg-surface-2 px-2.5 py-1 text-sm text-gold hover:border-gold">{s}</Link>
                    ) : (
                      <Tag className="px-2.5 py-1 text-sm">{s}</Tag>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Section>
    </>
  );
}
