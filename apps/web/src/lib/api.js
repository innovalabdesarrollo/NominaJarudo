import { getSession } from './session.js';

/**
 * Local: PUBLIC_API_URL=http://127.0.0.1:3088
 * Vercel: PUBLIC_API_URL vacío → mismo origen (/api/…)
 */
const raw = typeof import.meta !== 'undefined' ? import.meta.env?.PUBLIC_API_URL : undefined;
const BASE = (raw == null || String(raw).trim() === ''
  ? typeof window !== 'undefined'
    ? ''
    : 'http://127.0.0.1:3088'
  : String(raw)
).replace(/\/$/, '');

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${p}`;
}

export async function api(path, options = {}) {
  const session = getSession();
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };
  if (session.token) headers.Authorization = `Bearer ${session.token}`;

  const res = await fetch(apiUrl(path), { ...options, headers });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = data?.error || res.statusText || 'Error';
    throw new Error(msg);
  }
  return data;
}
