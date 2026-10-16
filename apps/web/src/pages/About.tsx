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
          <aside className="space-y-6">
            <div className="card-3d overflow-hidden rounded-2xl p-2.5">
              <div className="relative overflow-hidden rounded-xl bg-surface/50">
                <img
                  src="/profile-cutout.png"
                  alt={SITE.name}
                  className="h-auto w-full object-cover object-top"
                  style={{
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)',
                  }}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" aria-hidden />
              </div>
              <div className="p-3 text-center">
                <p className="font-black text-black">{SITE.name}</p>
                <p className="text-xs font-bold text-black/75">Founder of Jyruka · Member of Unitaryx</p>
              </div>
            </div>
            <div className="card-3d p-6 space-y-6">
              <div>
                <p className="label font-bold text-black/70">Education</p>
                <p className="mt-2 font-bold text-black">B.Tech, Artificial Intelligence and Data Science</p>
                <p className="text-black/85 font-medium">{SITE.institution}</p>
                <p className="text-sm font-semibold text-black/70">Graduating {SITE.graduation}</p>
              </div>
              <div className="pt-4 border-t border-line">
                <p className="label font-bold text-black/70">Interests</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">{SITE.interests.map((i) => <li key={i}><Tag className="bg-black/15 border-black/20 text-black font-semibold">{i}</Tag></li>)}</ul>
              </div>
            </div>
          </aside>
        </div>
      </Section>
      <Container className="pb-8"><div className="flex flex-wrap gap-3"><ButtonLink to="/projects">See my projects</ButtonLink><ButtonLink to="/resume" variant="outline">View resume</ButtonLink></div></Container>
    </>
  );
}
