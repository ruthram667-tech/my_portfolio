import { describe, expect, it } from 'vitest';
import { PROJECTS, EXPERIENCE, SKILLS, SOCIALS, SITE } from './content';
import { contactInputSchema, experienceItemSchema, postSchema, projectSchema, skillGroupSchema, socialsSchema } from './schemas';

const everyString = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => everyString(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => everyString(x, out));
  return out;
};

describe('content', () => {
  it('validates every project and has unique slugs', () => {
    PROJECTS.forEach((p) => expect(() => projectSchema.parse(p)).not.toThrow());
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECTS.length);
  });
  it('validates experience, skills and socials', () => {
    EXPERIENCE.forEach((e) => experienceItemSchema.parse(e));
    SKILLS.forEach((s) => skillGroupSchema.parse(s));
    socialsSchema.parse(SOCIALS);
  });
  it('contains no placeholder text and no empty strings', () => {
    const all = everyString([PROJECTS, EXPERIENCE, SKILLS, SOCIALS, SITE]);
    all.forEach((s) => {
      expect(s.trim().length).toBeGreaterThan(0);
      expect(/todo|lorem|placeholder/i.test(s)).toBe(false);
    });
  });
});

describe('input schemas', () => {
  it('rejects a filled honeypot', () => {
    const r = contactInputSchema.safeParse({ name: 'A', email: 'a@b.co', subject: 'Hi', message: 'Hello there friend', website: 'spam' });
    expect(r.success).toBe(false);
  });
  it('accepts a valid message', () => {
    const r = contactInputSchema.safeParse({ name: 'A', email: 'a@b.co', subject: 'Hi', message: 'Hello there friend' });
    expect(r.success).toBe(true);
  });
  it('rejects a bad post slug', () => {
    expect(postSchema.safeParse({ slug: 'Bad Slug', title: 't', excerpt: 'e', body: 'b' }).success).toBe(false);
  });
});
