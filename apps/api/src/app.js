import express from 'express';
import cors from 'cors';
import { connectDb, pingDb } from './db.js';
import { optionalAuth } from './lib/auth.js';
import { ensureUploadRoot } from './lib/uploadPath.js';
import auth from './routes/auth.js';
import plantas from './routes/plantas.js';
import operadores from './routes/operadores.js';
import cargas from './routes/cargas.js';
import tiquetes from './routes/tiquetes.js';
import config from './routes/config.js';
import liquidaciones from './routes/liquidaciones.js';

function buildAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN || 'http://127.0.0.1:5288';
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  const set = new Set();
  for (const origin of list) {
    set.add(origin);
    set.add(origin.replace('localhost', '127.0.0.1'));
    set.add(origin.replace('127.0.0.1', 'localhost'));
  }
  if (process.env.VERCEL_URL) {
    set.add(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    set.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return set;
}

function originAllowed(origin, allowed) {
  if (!origin) return true;
  if (allowed.has(origin)) return true;
  // Previews / mismo proyecto en Vercel
  if (process.env.VERCEL) {
    try {
      const host = new URL(origin).hostname;
      if (host.endsWith('.vercel.app')) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

export function createApp() {
  const app = express();
  const allowedOrigins = buildAllowedOrigins();
  const port = Number(process.env.PORT) || 3088;
  const uploadRoot = ensureUploadRoot();

  app.use(
    cors({
      origin(origin, cb) {
        cb(null, originAllowed(origin, allowedOrigins));
      }
    })
  );
  // inflate:false — reduce superficie Brotli (Node2Shell / CVE-2026-111497)
  app.use(express.json({ limit: '2mb', inflate: false }));

  app.use('/uploads', express.static(uploadRoot));

  app.use(async (_req, res, next) => {
    try {
      await connectDb();
      next();
    } catch (e) {
      console.error(e);
      res.status(503).json({ error: 'DB no disponible' });
    }
  });

  app.get('/api/health', async (_req, res) => {
    try {
      const db = await pingDb();
      res.json({
        ok: true,
        app: 'nomina-jarudo',
        node: process.version,
        port: process.env.VERCEL ? 'vercel' : port,
        db
      });
    } catch {
      res.status(503).json({ ok: false, node: process.version, port });
    }
  });

  app.use(optionalAuth);
  app.use('/api/auth', auth);
  app.use('/api/plantas', plantas);
  app.use('/api/operadores', operadores);
  app.use('/api/cargas', cargas);
  app.use('/api/tiquetes', tiquetes);
  app.use('/api/config', config);
  app.use('/api/liquidaciones', liquidaciones);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error interno' });
  });

  return app;
}

const app = createApp();
export { app };
export default app;
