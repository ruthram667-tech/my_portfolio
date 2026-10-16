import { Link } from 'react-router-dom';
import { PageHeader, Section } from '@/components/layout/layout';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects } from '@/data-access';
import { useSeo } from '@/lib/seo';

export function Unitaryx() {
  useSeo('Jyruka & Unitaryx', 'Jyruka is founded by Ruthramoorthy S B in active collaboration with Unitaryx, working across IoT hardware, machine learning and software.');
  const { data: projects = [] } = useProjects();
  const products = projects.filter((p) => p.org && (p.org.includes('Unitaryx') || p.org.includes('Jyruka')));

  return (
    <>
      <PageHeader
        title="Jyruka & Unitaryx"
        description="My tech company Jyruka in active collaboration with Unitaryx, developing IoT hardware, machine learning and software products."
        crumbs={[{ label: 'Jyruka & Unitaryx' }]}
      />
      <Section>
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5 text-lg font-medium text-black/85 leading-relaxed">
            <p>
              I am the founder of <strong className="font-extrabold text-black">Jyruka</strong>, my own technology venture dedicated to pioneering IoT hardware, smart embedded automation, and predictive machine learning solutions.
            </p>
            <p>
              Jyruka collaborates closely with <strong className="font-extrabold text-black">Unitaryx</strong>, where I am also an active team member. Together, we combine engineering rigor with AI innovation to turn ambitious ideas into functional, real-world systems.
            </p>
            <p>
              Our flagship collaborative products include <strong className="font-extrabold text-black">Buffex</strong> (smart predictive replenishment) and <strong className="font-extrabold text-black">Neervahini / AquaSight AI</strong> (IoT water quality analytics). For the complete catalogue of all my personal and collaborative work, explore <Link to="/projects" className="font-black text-black underline underline-offset-4 hover:opacity-80">all projects</Link>.
            </p>
          </div>
          <dl className="card-3d p-6 space-y-5">
            <div>
              <dt className="label font-bold text-black/70">My Company</dt>
              <dd className="mt-1 text-3xl font-black text-black">Jyruka</dd>
              <dd className="text-sm font-bold text-black/80">Founder &amp; Tech Lead</dd>
            </div>
            <div className="pt-4 border-t border-line">
              <dt className="label font-bold text-black/70">Strategic Partner</dt>
              <dd className="mt-1 text-2xl font-black text-black">Unitaryx</dd>
              <dd className="text-sm font-bold text-black/80">Active Team Member &amp; Collaborator</dd>
            </div>
            <div className="pt-4 border-t border-line">
              <dt className="label font-bold text-black/70">Focus Domains</dt>
              <dd className="mt-1 text-sm font-bold text-black">IoT Hardware · Machine Learning · Software Systems</dd>
            </div>
          </dl>
        </div>
      </Section>
      {products.length > 0 && (
        <Section muted>
          <h2 className="mb-8 text-3xl font-black tracking-tight text-black">Collaborative Products</h2>
          <div className="grid gap-5 md:grid-cols-2">{products.map((p, i) => <ProjectCard key={p.slug} project={p} index={i} />)}</div>
        </Section>
      )}
    </>
  );
}
