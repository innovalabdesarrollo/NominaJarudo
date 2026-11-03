import { Router } from 'express';
import { getDb } from '../db.js';
import { newId, todayISO } from '../lib/ids.js';

const router = Router();

router.get('/', async (req, res) => {
  const db = getDb();
  const q = {};
  if (req.query.plantaId) q.plantaId = String(req.query.plantaId);
  const items = await db.collection('operadores').find(q).sort({ nombreCompleto: 1 }).toArray();
  res.json(items);
});

router.post('/', async (req, res) => {
  const { plantaId, nombreCompleto, documento, codigoEmpleado, telefono } = req.body || {};
  if (!plantaId || !nombreCompleto || !documento) {
    return res.status(400).json({ error: 'plantaId, nombreCompleto y documento requeridos' });
  }
  const db = getDb();
  const doc = {
    id: newId(),
    plantaId,
    nombreCompleto: String(nombreCompleto).trim(),
    documento: String(documento).trim(),
    codigoEmpleado: codigoEmpleado ? String(codigoEmpleado).trim() : null,
    telefono: telefono || null,
    activo: true,
    createdAt: todayISO()
  };
  await db.collection('operadores').insertOne(doc);
  res.status(201).json(doc);
});

export default router;
