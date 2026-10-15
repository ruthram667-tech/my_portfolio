import { PageHeader, Section } from '@/components/layout/layout';
import { useExperience } from '@/data-access';
import { useSeo } from '@/lib/seo';

const kindLabel = { education: 'Education', work: 'Work', venture: 'Venture' } as const;

export function Experience() {
  useSeo('Experience', 'Education and experience of Ruthramoorthy S B.');
  const { data: items = [] } = useExperience();
  return (
    <>
      <PageHeader title="Experience" description="Education and the venture I co-founded." crumbs={[{ label: 'Experience' }]} />
      <Section>
        <ol className="relative max-w-3xl space-y-10 border-l border-line-strong pl-8">
          {items.map((e) => (
            <li key={`${e.org}-${e.title}`} className="relative">
              <span aria-hidden className="absolute -left-[37px] top-1.5 h-2.5 w-2.5 rounded-full bg-gold" />
              <p className="label">{kindLabel[e.kind]}{e.period ? ` · ${e.period}` : ''}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{e.title}</h2>
              <p className="text-gold">{e.org}</p>
              {e.description && <p className="mt-3 text-muted">{e.description}</p>}
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
