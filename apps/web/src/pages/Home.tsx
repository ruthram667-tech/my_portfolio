import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Linkedin, Mail } from 'lucide-react';
import { SITE, SOCIALS, SKILLS } from '@portfolio/shared';
import { Container, Section, SectionHeader } from '@/components/layout/layout';
import { ButtonLink, Tag } from '@/components/ui/ui';
import { ProjectCard } from '@/components/ProjectCard';
import { ConstellationMesh } from '@/features/hero/ConstellationMesh';
import { useProjects } from '@/data-access';
import { sortProjects } from '@/lib/filters';
import { useSeo } from '@/lib/seo';

function TypingWords() {
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reduce) return;
    const word = SITE.typingWords[i % SITE.typingWords.length]!;
    let t: number;
    if (!deleting && text === word) t = window.setTimeout(() => setDeleting(true), 1500);
    else if (deleting && text === '') {
      t = window.setTimeout(() => { setDeleting(false); setI((v) => v + 1); }, 150);
    } else t = window.setTimeout(() => setText(word.slice(0, text.length + (deleting ? -1 : 1))), deleting ? 45 : 90);
    return () => clearTimeout(t);
  }, [text, deleting, i, reduce]);

  const shown = reduce ? SITE.typingWords.join(' · ') : text;
  return (
    <p className="mt-6 min-h-8 text-xl font-extrabold text-black md:text-2xl" aria-label={`Interests: ${SITE.typingWords.join(', ')}`}>
      <span aria-hidden>{shown}{!reduce && <span className="ml-0.5 animate-pulse text-black">|</span>}</span>
    </p>
  );
}

const MARQUEE_ITEMS = [
  { text: 'Founder @ Jyruka', highlight: true },
  { text: 'Unitaryx Member & Collaborator', highlight: true },
  { text: 'IoT Hardware', highlight: false },
  { text: 'Machine Learning', highlight: false },
  { text: '7 Documented Projects', highlight: true },
  { text: 'Embedded Systems', highlight: false },
  { text: 'AI & Data Science', highlight: false },
  { text: 'B.Tech Class of 2029', highlight: true },
  { text: 'Full-Stack Web', highlight: false },
  { text: 'Python & C++', highlight: false },
  { text: 'Fastify & SQLite', highlight: false },
];

export function Home() {
  useSeo(undefined, 'Portfolio of Ruthramoorthy S B, B.Tech AI & Data Science student, Founder of Jyruka, and member of Unitaryx. IoT, machine learning and software products.');
  const { data: projects = [] } = useProjects();
  const featured = sortProjects(projects).filter((p) => p.featured).slice(0, 3);

  const stats = [
    { value: 'Founder', label: 'Jyruka (Collaborator with Unitaryx)' },
    { value: String(projects.length), label: 'Projects documented here' },
    { value: SITE.graduation, label: 'B.Tech graduation year' },
  ].filter((s) => s.value && s.value !== '0');

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <ConstellationMesh />
        <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden />
        <Container className="relative pb-16 pt-32 md:pb-24 md:pt-40">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="label rise font-bold text-black/80">Portfolio · {new Date().getFullYear()}</p>
            <h1 className="rise rise-2 mt-5 font-black leading-[1.05] tracking-tight">
              <span className="block text-3xl font-extrabold text-black md:text-4xl">Hi There, I&apos;m</span>
              <span className="mt-2 block text-4xl font-black text-black sm:text-5xl md:text-6xl">{SITE.name}</span>
            </h1>
            <TypingWords />
            <p className="rise rise-3 mt-6 max-w-2xl text-lg font-medium leading-relaxed text-black/85">
              I build across <span className="font-extrabold text-black">IoT hardware</span>, <span className="font-extrabold text-black">machine learning</span> and <span className="font-extrabold text-black">software products</span>. I study <span className="font-extrabold text-black">Artificial Intelligence</span> &amp; <span className="font-extrabold text-black">Data Science</span>. I am the founder of <span className="font-extrabold text-black">Jyruka</span>, collaborating with <span className="font-extrabold text-black">Unitaryx</span> where I am an active member.
            </p>
            <div className="rise rise-4 mt-9 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink to="/projects" size="lg">View projects <ArrowRight size={18} aria-hidden /></ButtonLink>
              <ButtonLink to="/contact" variant="outline" size="lg">Contact</ButtonLink>
            </div>
            <div className="mt-10 flex items-center justify-center gap-2 text-muted">
              {SOCIALS.github && <a aria-label="GitHub" href={SOCIALS.github} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-md border border-line bg-surface text-black hover:border-black hover:text-black shadow-sm transition-colors"><Github size={18} /></a>}
              {SOCIALS.linkedin && <a aria-label="LinkedIn" href={SOCIALS.linkedin} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-md border border-line bg-surface text-black hover:border-black hover:text-black shadow-sm transition-colors"><Linkedin size={18} /></a>}
              <a aria-label="Email" href={`mailto:${SOCIALS.email}`} className="grid h-10 w-10 place-items-center rounded-md border border-line bg-surface text-black hover:border-black hover:text-black shadow-sm transition-colors"><Mail size={18} /></a>
            </div>
          </div>
        </Container>

        {/* Continuous Horizontal Rotating Marquee */}
        <div className="relative border-t border-line bg-surface/30 py-3.5 overflow-hidden">
          <div className="marquee-mask flex overflow-hidden select-none">
            <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-sm">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 font-medium text-black/85 transition-colors hover:text-black">
                  <span className="text-black text-xs">✦</span>
                  {item.highlight ? (
                    <span className="inline-flex items-center rounded-full border border-black/40 bg-black/10 px-3 py-0.5 text-xs font-black tracking-wide text-black">
                      {item.text}
                    </span>
                  ) : (
                    <span className="font-bold tracking-wide text-black">{item.text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {stats.length >= 2 && (
          <div className="relative border-t border-line bg-surface/10">
            <Container>
              <dl className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {stats.map((s) => (
                  <div key={s.label} className="group px-0 py-6 sm:px-6 first:sm:pl-0 transition-colors duration-200 hover:bg-surface/30">
                    <dt className="order-2 text-sm text-muted group-hover:text-fg transition-colors">{s.label}</dt>
                    <dd className="tabular text-3xl font-bold tracking-tight text-fg group-hover:text-gold transition-colors">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Container>
          </div>
        )}
      </section>

      <Section>
        <SectionHeader
          title="Selected projects"
          text="Hardware, data and web products I have built or co-built."
          action={<Link to="/projects" className="inline-flex items-center gap-1.5 text-sm font-bold text-black hover:underline">All projects <ArrowRight size={16} aria-hidden /></Link>}
        />
        <div className="grid gap-5 md:grid-cols-3">
          {featured.map((p, i) => <ProjectCard key={p.slug} project={p} index={i} />)}
        </div>
      </Section>

      <Section className="defer">
        <div className="card-3d p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-center">
            <div>
              <p className="label font-bold text-fg/80">Company &amp; Collaboration</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-fg md:text-4xl">Jyruka <span className="text-2xl font-bold text-black/60">× Unitaryx</span></h2>
            </div>
            <div>
              <p className="text-lg font-medium leading-relaxed text-black/85">
                I am the founder of <span className="font-extrabold text-black">Jyruka</span>, my own tech company driving IoT, embedded intelligence, and AI systems. Jyruka operates in close collaboration with <span className="font-extrabold text-black">Unitaryx</span>, where I am also an active member engineering deep-tech hardware, predictive machine learning models, and software products.
              </p>
              <Link to="/unitaryx" className="mt-5 inline-flex items-center gap-1.5 font-black text-black hover:underline">About Jyruka &amp; Unitaryx <ArrowRight size={16} aria-hidden /></Link>
            </div>
          </div>
        </div>
      </Section>

      <Section className="defer">
        <SectionHeader title="What I work with" action={<Link to="/skills" className="inline-flex items-center gap-1.5 text-sm font-bold text-black hover:underline">All skills <ArrowRight size={16} aria-hidden /></Link>} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((g, i) => (
            <div key={g.group} style={{ animationDelay: `${0.1 + i * 0.08}s` }} className="card-3d animate-popup-3d p-6 cursor-pointer">
              <p className="label mb-3 font-bold text-fg/90">{g.group}</p>
              <ul className="flex flex-wrap gap-1.5">{g.skills.map((s) => <li key={s}><Tag className="bg-black/15 border-black/20 text-fg font-medium">{s}</Tag></li>)}</ul>
            </div>
          ))}
        </div>
      </Section>

      <Section className="defer pt-0">
        <div className="card-3d p-8 md:p-12">
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight text-fg md:text-4xl">Have a project or an idea? Let&apos;s talk.</h2>
          <div className="mt-6"><ButtonLink to="/contact" size="lg">Get in touch <ArrowRight size={18} aria-hidden /></ButtonLink></div>
        </div>
      </Section>
    </>
  );
}
