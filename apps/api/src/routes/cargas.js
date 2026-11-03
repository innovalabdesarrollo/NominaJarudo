import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { getDb } from '../db.js';
import { newId, todayISO } from '../lib/ids.js';
import { processCarga } from '../lib/processCarga.js';
import { ensureUploadRoot } from '../lib/uploadPath.js';

const uploadRoot = ensureUploadRoot();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) {
      return cb(new Error('Solo se aceptan archivos PDF'));
    }
    cb(null, true);
  }
});

const router = Router();

router.get('/', async (req, res) => {
  const db = getDb();
  const q = {};
  if (req.query.plantaId) q.plantaId = String(req.query.plantaId);
  if (req.query.estado) q.estadoProcesamiento = String(req.query.estado);
  if (req.query.desde) q.fechaReporte = { ...(q.fechaReporte || {}), $gte: String(req.query.desde) };
  if (req.query.hasta) q.fechaReporte = { ...(q.fechaReporte || {}), $lte: String(req.query.hasta) };
  if (req.query.archivo) q.nombreArchivo = new RegExp(String(req.query.archivo), 'i');

  const items = await db
    .collection('cargas')
    .find(q)
    .sort({ fechaCarga: -1 })
    .limit(200)
    .toArray();
  res.json(items);
});

router.get('/:id', async (req, res) => {
  const db = getDb();
  const item = await db.collection('cargas').findOne({ id: req.params.id });
  if (!item) return res.status(404).json({ error: 'No encontrada' });
  const resultado = await db.collection('resultadosExtraccion').findOne({ reporteSapId: item.id });
  res.json({ ...item, resultado });
});

router.post('/', upload.array('files', 20), async (req, res) => {
  try {
    const plantaId = req.body.plantaId;
    const fechaReporte = req.body.fechaReporte;
    const cargadoPor = req.body.cargadoPor || 'jefe_planta';

    if (!plantaId || !fechaReporte) {
      return res.status(400).json({ error: 'plantaId y fechaReporte requeridos' });
    }
    if (!req.files?.length) return res.status(400).json({ error: 'Sin archivos' });

    const db = getDb();
    const created = [];
    const rejected = [];

    for (const file of req.files) {
      const nombreArchivo = file.originalname;
      const dup = await db.collection('cargas').findOne({
        plantaId,
        fechaReporte,
        nombreArchivo
      });
      if (dup) {
        rejected.push({
          nombreArchivo,
          motivo: 'Reporte duplicado (misma planta, fecha y nombre)'
        });
        continue;
      }

      const doc = {
        id: newId(),
        plantaId,
        nombreArchivo,
        fechaReporte,
        fechaCarga: todayISO(),
        estadoProcesamiento: 'pendiente',
        mensajeError: null,
        filePath: file.path,
        fileUrl: `/uploads/${path.basename(file.path)}`,
        cargadoPor,
        recordsCount: 0
      };
      await db.collection('cargas').insertOne(doc);
      created.push(doc);

      // procesar async secuencial para feedback inmediato
      try {
        await processCarga(doc.id);
      } catch (e) {
        // ya marcado en processCarga
        console.error('Proceso carga', doc.id, e.message);
      }
    }

    const refreshed = await db
      .collection('cargas')
      .find({ id: { $in: created.map((c) => c.id) } })
      .toArray();

    res.status(201).json({ created: refreshed, rejected });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Error de carga' });
  }
});

router.post('/:id/reprocesar', async (req, res) => {
  try {
    const result = await processCarga(req.params.id);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
