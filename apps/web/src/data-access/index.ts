import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import {
  EXPERIENCE, PROJECTS, SKILLS, SOCIALS,
  contactInputSchema, projectSchema, postSchema,
  type ContactInput, type PostRecord, type Project,
} from '@portfolio/shared';
import { api, ApiError, hasApi } from '@/lib/api';

/**
 * The only place the UI reads data from. With VITE_API_URL it uses the API and
 * falls back to the built-in content if the API is unreachable.
 * Without it the site is fully static.
 */
const projectList = z.object({ items: z.array(projectSchema) });
const postRecord = postSchema.extend({ id: z.number(), createdAt: z.string(), updatedAt: z.string() });

export async function getProjects(): Promise<Project[]> {
  if (!hasApi) return PROJECTS;
  try {
    return projectList.parse(await api('/projects')).items;
  } catch {
    return PROJECTS;
  }
}

export async function getProject(slug: string): Promise<Project | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getPosts(): Promise<PostRecord[]> {
  if (!hasApi) return [];
  try {
    return z.object({ items: z.array(postRecord) }).parse(await api('/posts')).items as PostRecord[];
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<PostRecord | null> {
  if (!hasApi) return null;
  try {
    return postRecord.parse(await api(`/posts/${slug}`)) as PostRecord;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const getExperience = async () => EXPERIENCE;
export const getSkills = async () => SKILLS;
export const getSocials = async () => SOCIALS;

export type ContactResult = { mode: 'sent' } | { mode: 'mailto' };

export async function submitContact(input: ContactInput): Promise<ContactResult> {
  const data = contactInputSchema.parse(input);
  if (hasApi) {
    await api('/contact', { method: 'POST', json: data });
    return { mode: 'sent' };
  }
  const body = `${data.message}\n\nFrom: ${data.name} <${data.email}>`;
  window.location.href = `mailto:${SOCIALS.email}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
  return { mode: 'mailto' };
}

export function trackPageview(path: string) {
  if (!hasApi || (navigator as Navigator & { doNotTrack?: string }).doNotTrack === '1') return;
  api('/analytics/pageview', { method: 'POST', json: { path, referrer: document.referrer || undefined }, timeoutMs: 3000 }).catch(() => undefined);
}

// ----- query hooks -----
export const useProjects = () => useQuery({ queryKey: ['projects'], queryFn: getProjects });
export const useProject = (slug: string) => useQuery({ queryKey: ['project', slug], queryFn: () => getProject(slug) });
export const usePosts = () => useQuery({ queryKey: ['posts'], queryFn: getPosts });
export const usePost = (slug: string) => useQuery({ queryKey: ['post', slug], queryFn: () => getPost(slug) });
export const useExperience = () => useQuery({ queryKey: ['experience'], queryFn: getExperience });
export const useSkills = () => useQuery({ queryKey: ['skills'], queryFn: getSkills });
