import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { SITE, SOCIALS } from '@portfolio/shared';
import { Container } from '@/components/layout/layout';

const links = [
  { to: '/projects', label: 'Projects' },
  { to: '/unitaryx', label: 'Unitaryx' },
  { to: '/experience', label: 'Experience' },
  { to: '/skills', label: 'Skills' },
  { to: '/blog', label: 'Blog' },
  { to: '/resume', label: 'Resume' },
  { to: '/contact', label: 'Contact' },
];

export function SiteFooter() {
  const social = [
    SOCIALS.github && { href: SOCIALS.github, label: 'GitHub', Icon: Github },
    SOCIALS.linkedin && { href: SOCIALS.linkedin, label: 'LinkedIn', Icon: Linkedin },
    SOCIALS.instagram && { href: SOCIALS.instagram, label: 'Instagram', Icon: Instagram },
    SOCIALS.whatsapp && { href: SOCIALS.whatsapp, label: 'WhatsApp', Icon: MessageCircle },
    { href: `mailto:${SOCIALS.email}`, label: 'Email', Icon: Mail },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Mail }[];

  return (
    <footer className="no-print mt-24 border-t border-line bg-surface">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="text-lg font-bold tracking-tight text-fg">{SITE.name}</div>
          <p className="mt-4 max-w-sm text-sm text-muted">{SITE.role}</p>
        </div>
        <nav aria-label="Footer">
          <p className="label mb-4">Pages</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {links.map((l) => (
              <li key={l.to}><Link to={l.to} className="text-muted hover:text-gold">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="label mb-4">Elsewhere</p>
          <ul className="space-y-2 text-sm">
            {social.map(({ href, label, Icon }) => (
              <li key={label}>
                <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="inline-flex items-center gap-2 text-muted hover:text-gold">
                  <Icon size={16} aria-hidden /> {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-5 text-xs text-subtle sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}</p>
          <Link to="/admin" className="hover:text-gold">Admin</Link>
        </Container>
      </div>
    </footer>
  );
}
