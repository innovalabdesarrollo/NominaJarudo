import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_SEC = 60 * 60 * 12; // 12 h

export function getJwtSecret() {
  return process.env.JWT_SECRET || '';
}

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(String(password), salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const next = scryptSync(String(password), salt, 32);
  const prev = Buffer.from(hash, 'hex');
  if (prev.length !== next.length) return false;
  return timingSafeEqual(prev, next);
}

export function signToken(payload) {
  const secret = getJwtSecret();
  if (!secret) throw new Error('Falta JWT_SECRET en .env');
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC
  };
  const data = Buffer.from(JSON.stringify(body)).toString('base64url');
  const sig = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token) {
  const secret = getJwtSecret();
  if (!secret || !token) return null;
  const [data, sig] = String(token).split('.');
  if (!data || !sig) return null;
  const expected = createHmac('sha256', secret).update(data).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Adjunta req.user si hay Bearer válido (no bloquea). */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  req.user = token ? verifyToken(token) : null;
  next();
}

export function publicUser(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    email: doc.email,
    name: doc.name,
    role: doc.role,
    operadorId: doc.operadorId || null
  };
}
