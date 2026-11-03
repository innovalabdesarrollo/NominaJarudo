import { browser } from '$app/environment';

const KEY = 'nj_session';

/** @typedef {'jefe' | 'admin' | 'operador'} Role */

const defaultSession = () => ({
  role: /** @type {Role} */ ('jefe'),
  operadorId: null,
  name: 'Jefe de planta',
  token: null,
  email: null,
  auth: false
});

export function getSession() {
  if (!browser) return defaultSession();
  try {
    return { ...defaultSession(), ...(JSON.parse(localStorage.getItem(KEY) || 'null') || {}) };
  } catch {
    return defaultSession();
  }
}

export function setSession(session) {
  if (!browser) return;
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  if (!browser) return;
  localStorage.removeItem(KEY);
}

export const ROLES = [
  { id: 'jefe', label: 'Jefe de planta' },
  { id: 'admin', label: 'Admin tarifas' },
  { id: 'operador', label: 'Operador' }
];
