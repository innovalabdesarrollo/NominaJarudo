import { Router } from 'express';
import { getDb } from '../db.js';
import {
  getJwtSecret,
  hashPassword,
  optionalAuth,
  publicUser,
  signToken,
  verifyPassword
} from '../lib/auth.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json({
    ready: Boolean(getJwtSecret()),
    hint: getJwtSecret() ? null : 'Define JWT_SECRET en .env y reinicia la API'
  });
});

router.post('/login', async (req, res) => {
  if (!getJwtSecret()) {
    return res.status(503).json({ error: 'Falta JWT_SECRET en .env' });
  }
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password requeridos' });
  }

  const db = getDb();
  const user = await db.collection('usuarios').findOne({ email, activo: true });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = signToken({
    sub: user.id,
    role: user.role,
    name: user.name,
    operadorId: user.operadorId || null
  });

  res.json({ token, user: publicUser(user) });
});

router.get('/me', optionalAuth, async (req, res) => {
  if (!req.user?.sub) return res.status(401).json({ error: 'No autenticado' });
  const db = getDb();
  const user = await db.collection('usuarios').findOne({ id: req.user.sub, activo: true });
  if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
  res.json({ user: publicUser(user) });
});

/** Solo seed / admin local — no expuesto en UI de producción por ahora. */
export function buildUserDoc({ email, password, name, role, operadorId }) {
  return {
    email: String(email).trim().toLowerCase(),
    passwordHash: hashPassword(password),
    name,
    role,
    operadorId: operadorId || null,
    activo: true
  };
}

export default router;
