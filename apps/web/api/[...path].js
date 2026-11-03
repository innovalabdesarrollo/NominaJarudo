/**
 * Express serverless en el mismo dominio que SvelteKit (Vercel).
 * Rutas: /api/health, /api/auth, /api/cargas, …
 */
import app from '@nomina-jarudo/api';

function withApiPrefix(req) {
  const url = req.url || '/';
  if (url === '/api' || url.startsWith('/api/') || url.startsWith('/health')) {
    return;
  }
  req.url = '/api' + (url.startsWith('/') ? url : `/${url}`);
}

export default function handler(req, res) {
  withApiPrefix(req);
  return app(req, res);
}
