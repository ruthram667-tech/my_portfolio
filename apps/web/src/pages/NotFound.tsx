import { Container } from '@/components/layout/layout';
import { ButtonLink } from '@/components/ui/ui';
import { useSeo } from '@/lib/seo';

export function NotFound() {
  useSeo('Page not found', 'This page does not exist.');
  return (
    <Container className="py-40">
      <p className="label">404</p>
      <h1 id="page-title" tabIndex={-1} className="mt-4 text-5xl font-extrabold tracking-tight outline-none">Page not found</h1>
      <p className="mt-4 max-w-md text-lg text-muted">The page you are looking for does not exist or has moved.</p>
      <div className="mt-8 flex flex-wrap gap-3"><ButtonLink to="/">Back to home</ButtonLink><ButtonLink to="/projects" variant="outline">Browse projects</ButtonLink></div>
    </Container>
  );
}
