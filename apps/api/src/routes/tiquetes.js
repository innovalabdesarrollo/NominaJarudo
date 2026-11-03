import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const db = getDb();
  const q = {};
  if (req.query.plantaId) q.plantaId = String(req.query.plantaId);
  if (req.query.cargaId) q.cargaId = String(req.query.cargaId);
  if (req.query.estado) q.estadoAuditoria = String(req.query.estado);
  if (req.query.operador) q.operadorNombre = new RegExp(String(req.query.operador), 'i');
  if (req.query.q) {
    const term = String(req.query.q);
    q.$or = [
      { numeroTiquete: new RegExp(term, 'i') },
      { operadorNombre: new RegExp(term, 'i') },
      { vehiculo: new RegExp(term, 'i') }
    ];
  }
  if (req.query.excluidos === '1') q.liquidable = false;
  if (req.query.liquidables === '1') q.liquidable = true;
  if (req.query.desde || req.query.hasta) {
    q.fechaTiquete = {};
    if (req.query.desde) q.fechaTiquete.$gte = String(req.query.desde);
    if (req.query.hasta) q.fechaTiquete.$lte = String(req.query.hasta);
  }

  const items = await db.collection('tiquetes').find(q).sort({ fechaTiquete: -1 }).limit(500).toArray();
  const ids = items.map((t) => t.id);
  const exclusiones = ids.length
    ? await db.collection('exclusiones').find({ tiqueteId: { $in: ids } }).toArray()
    : [];
  const byT = new Map();
  for (const e of exclusiones) {
    if (!byT.has(e.tiqueteId)) byT.set(e.tiqueteId, []);
    byT.get(e.tiqueteId).push(e);
  }

  res.json(items.map((t) => ({ ...t, exclusiones: byT.get(t.id) || [] })));
});

router.get('/inconsistencias', async (req, res) => {
  const db = getDb();
  const q = {};
  if (req.query.plantaId) q.plantaId = String(req.query.plantaId);
  if (req.query.estado) q.estado = String(req.query.estado);
  const items = await db
    .collection('inconsistencias')
    .find(q)
    .sort({ fechaDeteccion: -1 })
    .limit(300)
    .toArray();
  res.json(items);
});

export default router;
