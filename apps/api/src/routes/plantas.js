import { Router } from 'express';
import { getDb } from '../db.js';
import { newId, todayISO } from '../lib/ids.js';

const router = Router();

router.get('/', async (_req, res) => {
  const db = getDb();
  const items = await db.collection('plantas').find({}).sort({ nombre: 1 }).toArray();
  res.json(items);
});

router.post('/', async (req, res) => {
  const { nombre, codigo, ubicacion } = req.body || {};
  if (!nombre || !codigo) return res.status(400).json({ error: 'nombre y codigo requeridos' });
  const db = getDb();
  const doc = {
    id: newId(),
    nombre: String(nombre).trim(),
    codigo: String(codigo).trim().toUpperCase(),
    ubicacion: ubicacion || null,
    activa: true,
    createdAt: todayISO()
  };
  try {
    await db.collection('plantas').insertOne(doc);
    res.status(201).json(doc);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Código de planta duplicado' });
    throw e;
  }
});

export default router;
