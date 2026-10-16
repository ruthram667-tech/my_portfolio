import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { RouteEffects, ScrollProgress } from '@/components/chrome/RouteEffects';
import { Intro } from '@/features/intro/Intro';
import { Container } from '@/components/layout/layout';
import { ButtonLink } from '@/components/ui/ui';

const lazyPage = <T extends Record<string, React.ComponentType>>(loader: () => Promise<T>, name: keyof T) =>
  lazy(() => loader().then((m) => ({ default: m[name] })));

const Home = lazyPage(() => import('@/pages/Home'), 'Home');
const About = lazyPage(() => import('@/pages/About'), 'About');
const Projects = lazyPage(() => import('@/pages/Projects'), 'Projects');
const ProjectDetail = lazyPage(() => import('@/pages/ProjectDetail'), 'ProjectDetail');
const Unitaryx = lazyPage(() => import('@/pages/Unitaryx'), 'Unitaryx');
const Experience = lazyPage(() => import('@/pages/Experience'), 'Experience');
const Skills = lazyPage(() => import('@/pages/Skills'), 'Skills');
const Blog = lazyPage(() => import('@/pages/Blog'), 'Blog');
const BlogPost = lazyPage(() => import('@/pages/Blog'), 'BlogPost');
const Resume = lazyPage(() => import('@/pages/Resume'), 'Resume');
const Contact = lazyPage(() => import('@/pages/Contact'), 'Contact');
const Admin = lazyPage(() => import('@/pages/admin/Admin'), 'Admin');
const NotFound = lazyPage(() => import('@/pages/NotFound'), 'NotFound');

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60_000, refetchOnWindowFocus: false, retry: 1 } } });

function Skeleton() {
  return <Container className="py-40" aria-busy="true"><div className="h-8 w-48 animate-pulse rounded bg-surface-3" /><div className="mt-6 h-4 w-full max-w-lg animate-pulse rounded bg-surface-2" /></Container>;
}

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <a href="#content" className="sr-only z-[200] rounded-md bg-gold px-4 py-2 font-semibold text-on-gold focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <Intro />
      <ScrollProgress />
      <RouteEffects />
      <SiteHeader />
      <main id="content" className="min-h-[70vh] pt-16">
        <Suspense fallback={<Skeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </QueryClientProvider>
  );
}

function RouteError() {
  return (
    <Container className="py-40">
      <h1 className="text-4xl font-extrabold tracking-tight">Something went wrong</h1>
      <p className="mt-4 text-muted">Please reload the page or go back home.</p>
      <div className="mt-8"><ButtonLink to="/">Back to home</ButtonLink></div>
    </Container>
  );
}

const OldCaseStudy = () => <Navigate to={`/projects/${useParams().slug ?? ''}`} replace />;

const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      errorElement: <RouteError />,
      children: [
        { index: true, element: <Home /> },
        { path: 'about', element: <About /> },
        { path: 'projects', element: <Projects /> },
        { path: 'projects/:slug', element: <ProjectDetail /> },
        { path: 'case-study/:slug', element: <OldCaseStudy /> },
        { path: 'unitaryx', element: <Unitaryx /> },
        { path: 'jyruka', element: <Unitaryx /> },
        { path: 'experience', element: <Experience /> },
        { path: 'skills', element: <Skills /> },
        { path: 'blog', element: <Blog /> },
        { path: 'blog/:slug', element: <BlogPost /> },
        { path: 'resume', element: <Resume /> },
        { path: 'contact', element: <Contact /> },
        { path: 'admin', element: <Admin /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || undefined },
);

export default function App() {
  // Old hash links (#/projects) are redirected once to real paths.
  if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
    const path = window.location.hash.slice(1);
    window.history.replaceState(null, '', import.meta.env.BASE_URL.replace(/\/$/, '') + path);
  }
  return <RouterProvider router={router} />;
}
