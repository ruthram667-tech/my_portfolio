import { Printer } from 'lucide-react';
import { EXPERIENCE, SITE, SKILLS, SOCIALS } from '@portfolio/shared';
import { Container, PageHeader } from '@/components/layout/layout';
import { Button } from '@/components/ui/ui';
import { useProjects } from '@/data-access';
import { sortProjects } from '@/lib/filters';
import { useSeo } from '@/lib/seo';

export function Resume() {
  useSeo('Resume', 'Resume of Ruthramoorthy S B.');
  const { data: projects = [] } = useProjects();
  return (
    <>
      <div className="no-print">
        <PageHeader title="Resume" description="Built from the same content as this site. Use Print to save a clean PDF." crumbs={[{ label: 'Resume' }]}>
          <Button onClick={() => window.print()}><Printer size={16} aria-hidden /> Print or save as PDF</Button>
        </PageHeader>
      </div>
      <Container narrow className="print-page py-12">
        <h2 className="text-3xl font-extrabold tracking-tight">{SITE.name}</h2>
        <p className="mt-1 text-muted">{SITE.role}</p>
        <p className="mt-2 text-sm text-muted">{[SOCIALS.email, SOCIALS.phone, SOCIALS.linkedin, SOCIALS.github].filter(Boolean).join('  ·  ')}</p>

        <h3 className="label mt-10 border-b border-line pb-2">Summary</h3>
        <p className="mt-3 text-muted">{SITE.intro}</p>

        <h3 className="label mt-10 border-b border-line pb-2">Education and experience</h3>
        <ul className="mt-3 space-y-4">
          {EXPERIENCE.map((e) => (
            <li key={e.title}>
              <p className="font-semibold">{e.title} <span className="font-normal text-muted">· {e.org}{e.period ? ` · ${e.period}` : ''}</span></p>
              {e.description && <p className="text-muted">{e.description}</p>}
            </li>
          ))}
        </ul>

        <h3 className="label mt-10 border-b border-line pb-2">Projects</h3>
        <ul className="mt-3 space-y-3">
          {sortProjects(projects).map((p) => (
            <li key={p.slug}><p className="font-semibold">{p.title} <span className="font-normal text-muted">· {p.category}</span></p><p className="text-muted">{p.summary}</p></li>
          ))}
        </ul>

        <h3 className="label mt-10 border-b border-line pb-2">Skills</h3>
        <ul className="mt-3 space-y-1">{SKILLS.map((g) => <li key={g.group}><span className="font-semibold">{g.group}:</span> <span className="text-muted">{g.skills.join(', ')}</span></li>)}</ul>
      </Container>
    </>
  );
}
