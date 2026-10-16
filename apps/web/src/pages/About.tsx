import { SITE } from '@portfolio/shared';
import { Container, PageHeader, Section } from '@/components/layout/layout';
import { ButtonLink, Tag } from '@/components/ui/ui';
import { useSeo } from '@/lib/seo';

export function About() {
  useSeo('About', 'About Ruthramoorthy S B: B.Tech AI & Data Science student, Founder of Jyruka, and member of Unitaryx.');
  return (
    <>
      <PageHeader title="About" description={SITE.role} crumbs={[{ label: 'About' }]} />
      <Section>
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5 text-lg font-medium text-black/85 leading-relaxed">
            <p>{SITE.intro}</p>
            <p>My work sits where IoT hardware meets machine learning and software product development, from a sensor on a bench to something people can use.</p>
          </div>
          <aside className="space-y-8 rounded-lg border border-line bg-surface p-6">
            <div>
              <p className="label">Education</p>
              <p className="mt-2 font-semibold">B.Tech, Artificial Intelligence and Data Science</p>
              <p className="text-muted">{SITE.institution}</p>
              <p className="text-sm text-subtle">Graduating {SITE.graduation}</p>
            </div>
            <div>
              <p className="label">Interests</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">{SITE.interests.map((i) => <li key={i}><Tag>{i}</Tag></li>)}</ul>
            </div>
          </aside>
        </div>
      </Section>
      <Container className="pb-8"><div className="flex flex-wrap gap-3"><ButtonLink to="/projects">See my projects</ButtonLink><ButtonLink to="/resume" variant="outline">View resume</ButtonLink></div></Container>
    </>
  );
}
