import { randomUUID } from 'node:crypto';

export function newId() {
  return randomUUID();
}

export function todayISO() {
  return new Date().toISOString();
}
