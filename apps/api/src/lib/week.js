/** Semana laboral MX: lunes–sábado (domingo cierra). */

export function parseDateOnly(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  const s = String(value).slice(0, 10);
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

export function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

/** Lunes de la semana que contiene `date`. */
export function weekStart(date) {
  const d = parseDateOnly(date);
  if (!d) return null;
  const day = d.getUTCDay(); // 0=dom
  const offset = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setUTCDate(d.getUTCDate() + offset);
  return start;
}

export function weekEnd(date) {
  const start = weekStart(date);
  if (!start) return null;
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 5); // sábado
  return end;
}

export function isSaturday(date) {
  const d = parseDateOnly(date);
  return d ? d.getUTCDay() === 6 : false;
}

export function journeyType(date) {
  return isSaturday(date) ? 'sabado' : 'semana';
}
