/** Base URL of the API, e.g. https://api.example.com. When empty the site runs from built-in content only. */
export const API_URL: string = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
export const hasApi = API_URL.length > 0;

export class ApiError extends Error {
  constructor(public status: number, message: string, public issues?: { path: string; message: string }[]) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown; timeoutMs?: number } = {}): Promise<T> {
  if (!hasApi) throw new ApiError(0, 'api_not_configured');
  const { json, timeoutMs = 6000, ...rest } = init;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      ...rest,
      credentials: 'include',
      signal: ctrl.signal,
      headers: {
        ...(json !== undefined ? { 'content-type': 'application/json' } : {}),
        'x-requested-with': 'portfolio',
        ...(rest.headers as Record<string, string> | undefined),
      },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
    if (res.status === 204) return undefined as T;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, (data as { error?: string }).error ?? res.statusText, (data as { issues?: { path: string; message: string }[] }).issues);
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, 'network_error');
  } finally {
    clearTimeout(timer);
  }
}
