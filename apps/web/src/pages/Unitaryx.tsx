import { Link } from 'react-router-dom';
import { PageHeader, Section } from '@/components/layout/layout';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects } from '@/data-access';
import { useSeo } from '@/lib/seo';

export function Unitaryx() {
  useSeo('Unitaryx', 'Unitaryx is a student startup co-founded by Ruthramoorthy S B, working across IoT hardware, machine learning and software.');
  const { data: projects = [] } = useProjects();
  const products = projects.filter((p) => p.org === 'Unitaryx');

  return (
    <>
      <PageHeader title="Unitaryx" description="A student startup building across IoT hardware, machine learning and software products." crumbs={[{ label: 'Unitaryx' }]} />
      <Section>
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5 text-lg text-muted">
            <p>I co-founded Unitaryx as a student startup and I lead a team of ten. We work across IoT hardware, machine learning and software product development.</p>
            <p>Our current products are listed here. For the full list of my own work, see <Link to="/projects" className="text-gold underline underline-offset-4">all projects</Link>.</p>
          </div>
          <dl className="rounded-lg border border-line bg-surface p-6">
            <dt className="label">Team size</dt>
            <dd className="tabular mt-1 text-5xl font-extrabold text-gold">10</dd>
            <dt className="label mt-6">My role</dt>
            <dd className="mt-1">Co-founder, leading the team</dd>
          </dl>
        </div>
      </Section>
      {products.length > 0 && (
        <Section muted>
          <h2 className="mb-8 text-3xl font-bold tracking-tight">Products</h2>
          <div className="grid gap-5 md:grid-cols-2">{products.map((p, i) => <ProjectCard key={p.slug} project={p} index={i} />)}</div>
        </Section>
      )}
    </>
  );
}
