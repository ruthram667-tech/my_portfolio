import { z } from 'zod';

export const slugSchema = z.string().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase letters, numbers and dashes');

const text = (max: number) => z.string().trim().min(1).max(max);

export const projectSchema = z.object({
  slug: slugSchema,
  title: text(120),
  category: text(60),
  summary: text(600),
  tags: z.array(text(40)).max(20).default([]),
  featured: z.boolean().default(false),
  org: text(80).optional(),
  repoUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  sections: z
    .object({
      overview: text(4000).optional(),
      challenge: text(4000).optional(),
      solution: text(4000).optional(),
      result: text(4000).optional(),
    })
    .default({}),
  sortOrder: z.number().int().default(0),
});
export type Project = z.infer<typeof projectSchema>;

export const postSchema = z.object({
  slug: slugSchema,
  title: text(160),
  excerpt: text(400),
  body: text(50000),
  tags: z.array(text(40)).max(10).default([]),
  published: z.boolean().default(false),
  publishedAt: z.string().datetime().nullable().optional(),
});
export type Post = z.infer<typeof postSchema>;
export type PostRecord = Post & { id: number; createdAt: string; updatedAt: string };

export const contactInputSchema = z.object({
  name: text(100),
  email: z.string().trim().email().max(200),
  subject: text(150),
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(4000),
  website: z.string().max(0).optional().default(''), // honeypot, must stay empty
});
export type ContactInput = z.infer<typeof contactInputSchema>;

export const messageRecordSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  subject: z.string(),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
});
export type MessageRecord = z.infer<typeof messageRecordSchema>;

export const loginInputSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const pageviewInputSchema = z.object({
  path: z.string().max(200).regex(/^\//),
  referrer: z.string().max(300).optional(),
});
export type PageviewInput = z.infer<typeof pageviewInputSchema>;

export const experienceItemSchema = z.object({
  title: text(120),
  org: text(160),
  kind: z.enum(['education', 'work', 'venture']),
  period: text(60).optional(),
  description: text(800).optional(),
});
export type ExperienceItem = z.infer<typeof experienceItemSchema>;

export const skillGroupSchema = z.object({
  group: text(60),
  skills: z.array(text(60)).min(1),
});
export type SkillGroup = z.infer<typeof skillGroupSchema>;

export const socialsSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  whatsapp: z.string().url().optional(),
  instagram: z.string().url().optional(),
});
export type Socials = z.infer<typeof socialsSchema>;

export type AnalyticsSummary = {
  total: number;
  last7Days: number;
  byDay: { day: string; views: number }[];
  topPaths: { path: string; views: number }[];
};
