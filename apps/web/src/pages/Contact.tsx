import { useState, type FormEvent } from 'react';
import { Check, Copy, Github, Instagram, Linkedin, Mail, MessageCircle, Phone } from 'lucide-react';
import { SOCIALS, contactInputSchema, type ContactInput } from '@portfolio/shared';
import { PageHeader, Section } from '@/components/layout/layout';
import { Button, Field, Input, Textarea } from '@/components/ui/ui';
import { submitContact } from '@/data-access';
import { ApiError } from '@/lib/api';
import { useSeo } from '@/lib/seo';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'mailto' } | { kind: 'error'; message: string };

export function Contact() {
  useSeo('Contact', 'Contact Ruthramoorthy S B for projects, collaboration or startup conversations.');
  const [values, setValues] = useState<ContactInput>({ name: '', email: '', subject: '', message: '', website: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInput, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [copied, setCopied] = useState(false);

  const onChange = (k: keyof ContactInput) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = contactInputSchema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<keyof ContactInput, string>> = {};
      parsed.error.issues.forEach((i) => { const k = i.path[0] as keyof ContactInput; next[k] ??= i.message; });
      setErrors(next);
      return;
    }
    setErrors({});
    setStatus({ kind: 'sending' });
    try {
      const r = await submitContact(parsed.data);
      setStatus({ kind: r.mode });
      if (r.mode === 'sent') setValues({ name: '', email: '', subject: '', message: '', website: '' });
    } catch (err) {
      const rate = err instanceof ApiError && err.status === 429;
      setStatus({ kind: 'error', message: rate ? 'Too many messages from this connection. Please try again later.' : 'Your message could not be sent. Please email me directly instead.' });
    }
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(SOCIALS.email); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const rows = [
    { Icon: Mail, label: SOCIALS.email, href: `mailto:${SOCIALS.email}` },
    SOCIALS.phone && { Icon: Phone, label: SOCIALS.phone, href: `tel:${SOCIALS.phone.replace(/\s/g, '')}` },
    SOCIALS.whatsapp && { Icon: MessageCircle, label: 'WhatsApp', href: SOCIALS.whatsapp },
    SOCIALS.linkedin && { Icon: Linkedin, label: 'LinkedIn', href: SOCIALS.linkedin },
    SOCIALS.github && { Icon: Github, label: 'GitHub', href: SOCIALS.github },
    SOCIALS.instagram && { Icon: Instagram, label: 'Instagram', href: SOCIALS.instagram },
  ].filter(Boolean) as { Icon: typeof Mail; label: string; href: string }[];

  return (
    <>
      <PageHeader title="Contact" description="For projects, collaboration or startup conversations." crumbs={[{ label: 'Contact' }]} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <ul className="space-y-1">
              {rows.map(({ Icon, label, href }) => (
                <li key={label}>
                  <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="flex items-center gap-3 rounded-md border border-transparent px-3 py-3 text-lg hover:border-line hover:bg-surface hover:text-gold">
                    <Icon size={18} aria-hidden className="text-gold" /> {label}
                  </a>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-5" onClick={copy}>{copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}{copied ? 'Copied' : 'Copy email'}</Button>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-lg border border-line bg-surface p-6 md:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="name" label="Name" error={errors.name}><Input id="name" autoComplete="name" value={values.name} onChange={onChange('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} /></Field>
              <Field id="email" label="Email" error={errors.email}><Input id="email" type="email" autoComplete="email" value={values.email} onChange={onChange('email')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} /></Field>
            </div>
            <Field id="subject" label="Subject" error={errors.subject}><Input id="subject" value={values.subject} onChange={onChange('subject')} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? 'subject-error' : undefined} /></Field>
            <Field id="message" label="Message" error={errors.message} hint={`${values.message.length}/4000`}><Textarea id="message" value={values.message} onChange={onChange('message')} maxLength={4000} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} /></Field>
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={values.website} onChange={onChange('website')} /></label></div>
            <Button type="submit" size="lg" disabled={status.kind === 'sending'}>{status.kind === 'sending' ? 'Sending…' : 'Send message'}</Button>
            <div role="status" aria-live="polite" className="min-h-6 text-sm">
              {status.kind === 'sent' && <p className="text-gold">Message sent. Thank you, I will reply by email.</p>}
              {status.kind === 'mailto' && <p className="text-muted">Your email app should have opened with your message. Nothing is sent until you press send there.</p>}
              {status.kind === 'error' && <p className="text-danger">{status.message}</p>}
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}
