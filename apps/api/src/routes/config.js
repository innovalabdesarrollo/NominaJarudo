import { Router } from 'express';
import { getDb } from '../db.js';
import { newId, todayISO } from '../lib/ids.js';
import {
  calcularLiquidacionSemanal,
  normalizeName,
  overlapConflict,
  pickConfigForDate
} from '../lib/liquidacion.js';
import { weekEnd, weekStart, toDateStr } from '../lib/week.js';

const router = Router();

function validateConfigBody(body) {
  const errors = [];
  const viajesBaseSemana = Number(body.viajesBaseSemana);
  const viajesBaseSabado = Number(body.viajesBaseSabado);
  const tarifaViajeAdicional = Number(body.tarifaViajeAdicional);
  const volumenConsumoInterno = Number(body.volumenConsumoInterno ?? 0.5);

  if (!Number.isInteger(viajesBaseSemana) || viajesBaseSemana < 0) {
    errors.push('viajesBaseSemana debe ser entero ≥ 0');
  }
  if (!Number.isInteger(viajesBaseSabado) || viajesBaseSabado < 0) {
    errors.push('viajesBaseSabado debe ser entero ≥ 0');
  }
  if (!Number.isFinite(tarifaViajeAdicional) || tarifaViajeAdicional < 0) {
    errors.push('tarifaViajeAdicional debe ser ≥ 0');
  }
  if (!Number.isFinite(volumenConsumoInterno) || volumenConsumoInterno < 0) {
    errors.push('volumenConsumoInterno inválido');
  }
  if (!body.vigenciaDesde) errors.push('vigenciaDesde requerida');
  if (body.vigenciaHasta && body.vigenciaHasta < body.vigenciaDesde) {
    errors.push('vigenciaHasta debe ser ≥ vigenciaDesde');
  }
  return {
    errors,
    values: {
      nombre: body.nombre || 'Configuración',
      viajesBaseSemana,
      viajesBaseSabado,
      tarifaViajeAdicional,
      volumenConsumoInterno,
      excluirCancelados: body.excluirCancelados !== false,
      excluirConsumoInterno: body.excluirConsumoInterno !== false,
      vigenciaDesde: body.vigenciaDesde,
      vigenciaHasta: body.vigenciaHasta || null,
      motivo: body.motivo || null
    }
  };
}

router.get('/', async (_req, res) => {
  const db = getDb();
  const items = await db.collection('configuraciones').find({}).sort({ version: -1 }).toArray();
  res.json(items);
});

router.get('/historial', async (req, res) => {
  const db = getDb();
  const q = {};
  if (req.query.tipo) q.tipo = String(req.query.tipo);
  if (req.query.desde || req.query.hasta) {
    q.fecha = {};
    if (req.query.desde) q.fecha.$gte = String(req.query.desde);
    if (req.query.hasta) q.fecha.$lte = String(req.query.hasta) + 'T23:59:59.999Z';
  }
  const items = await db.collection('configChanges').find(q).sort({ fecha: -1 }).limit(200).toArray();
  res.json(items);
});

router.post('/', async (req, res) => {
  const { errors, values } = validateConfigBody(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });

  const db = getDb();
  const last = await db.collection('configuraciones').find().sort({ version: -1 }).limit(1).toArray();
  const version = (last[0]?.version || 0) + 1;
  const usuario = req.body.usuario || 'admin';

  const doc = {
    id: newId(),
    version,
    estado: 'pendiente',
    ...values,
    createdAt: todayISO(),
    createdBy: usuario,
    publishedAt: null
  };

  const conflict = overlapConflict(
    await db.collection('configuraciones').find({ estado: { $in: ['publicada', 'pendiente'] } }).toArray(),
    doc
  );
  if (conflict) return res.status(400).json({ error: conflict });

  await db.collection('configuraciones').insertOne(doc);
  await db.collection('configChanges').insertOne({
    id: newId(),
    tipo: 'configuracion',
    configId: doc.id,
    usuario,
    fecha: todayISO(),
    anterior: null,
    nueva: doc,
    motivo: values.motivo || 'Creación'
  });

  res.status(201).json(doc);
});

router.patch('/:id', async (req, res) => {
  const db = getDb();
  const current = await db.collection('configuraciones').findOne({ id: req.params.id });
  if (!current) return res.status(404).json({ error: 'No encontrada' });
  if (current.estado === 'publicada' && current.usadaEnLiquidacion) {
    return res.status(400).json({ error: 'Configuración ya usada en liquidación: crea una nueva versión' });
  }

  const { errors, values } = validateConfigBody({ ...current, ...req.body });
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });

  const next = { ...current, ...values, estado: 'pendiente' };
  const others = await db
    .collection('configuraciones')
    .find({ estado: { $in: ['publicada', 'pendiente'] }, id: { $ne: current.id } })
    .toArray();
  const conflict = overlapConflict(others, next);
  if (conflict) return res.status(400).json({ error: conflict });

  await db.collection('configuraciones').updateOne({ id: current.id }, { $set: values });
  const updated = await db.collection('configuraciones').findOne({ id: current.id });
  await db.collection('configChanges').insertOne({
    id: newId(),
    tipo: 'configuracion',
    configId: current.id,
    usuario: req.body.usuario || 'admin',
    fecha: todayISO(),
    anterior: current,
    nueva: updated,
    motivo: req.body.motivo || 'Edición'
  });
  res.json(updated);
});

router.post('/:id/publicar', async (req, res) => {
  const db = getDb();
  const current = await db.collection('configuraciones').findOne({ id: req.params.id });
  if (!current) return res.status(404).json({ error: 'No encontrada' });

  const { errors } = validateConfigBody(current);
  if (errors.length) return res.status(400).json({ error: `No publicable: ${errors.join('; ')}` });

  const others = await db
    .collection('configuraciones')
    .find({ estado: 'publicada', id: { $ne: current.id } })
    .toArray();
  const conflict = overlapConflict(others, current);
  if (conflict) return res.status(400).json({ error: conflict });

  await db.collection('configuraciones').updateOne(
    { id: current.id },
    { $set: { estado: 'publicada', publishedAt: todayISO() } }
  );
  const updated = await db.collection('configuraciones').findOne({ id: current.id });
  await db.collection('configChanges').insertOne({
    id: newId(),
    tipo: 'publicacion',
    configId: current.id,
    usuario: req.body.usuario || 'admin',
    fecha: todayISO(),
    anterior: current,
    nueva: updated,
    motivo: req.body.motivo || 'Publicación'
  });
  res.json(updated);
});

/** Simulación sin persistir liquidaciones. */
router.post('/simular', async (req, res) => {
  const db = getDb();
  const { plantaId, semana, configId } = req.body || {};
  if (!plantaId || !semana) return res.status(400).json({ error: 'plantaId y semana requeridos' });

  let config = configId
    ? await db.collection('configuraciones').findOne({ id: configId })
    : null;
  if (!config) {
    const all = await db.collection('configuraciones').find({}).toArray();
    config = pickConfigForDate(all, semana);
  }
  if (!config) return res.status(400).json({ error: 'Sin configuración' });

  const start = weekStart(semana);
  const end = weekEnd(semana);
  const startStr = toDateStr(start);
  const endStr = toDateStr(end);

  const tiquetes = await db
    .collection('tiquetes')
    .find({
      plantaId,
      liquidable: true,
      fechaTiquete: { $gte: startStr, $lte: endStr }
    })
    .toArray();

  // Simular depuración con criterios de la config candidata
  const allTickets = await db
    .collection('tiquetes')
    .find({ plantaId, fechaTiquete: { $gte: startStr, $lte: endStr } })
    .toArray();

  let excluidosSim = 0;
  for (const t of allTickets) {
    const cancelado =
      config.excluirCancelados !== false &&
      /CANCEL|ANULAD|VOID|CANCELADO/.test(String(t.estadoOriginal || ''));
    const consumo =
      config.excluirConsumoInterno !== false &&
      Math.abs((t.volumenMetrosCubicos ?? -1) - Number(config.volumenConsumoInterno ?? 0.5)) < 0.001;
    if (cancelado || consumo || t.estadoAuditoria === 'duplicado') excluidosSim += 1;
  }

  const operadores = await db.collection('operadores').find({ plantaId }).toArray();
  const byName = new Map(operadores.map((o) => [normalizeName(o.nombreCompleto), o]));

  const result = calcularLiquidacionSemanal({
    tiquetesValidos: tiquetes,
    operadoresByName: byName,
    config,
    plantaId,
    semanaRef: semana
  });

  res.json({
    simulacion: true,
    config: {
      version: config.version,
      viajesBaseSemana: config.viajesBaseSemana,
      viajesBaseSabado: config.viajesBaseSabado,
      tarifaViajeAdicional: config.tarifaViajeAdicional
    },
    semanaInicio: result.semanaInicio,
    semanaFin: result.semanaFin,
    tiquetesExcluidosEstimados: excluidosSim,
    liquidaciones: result.liquidaciones.map((l) => ({
      operadorId: l.operadorId,
      viajesBase: l.viajesBase,
      viajesAdicionales: l.viajesAdicionales,
      tarifaViajeAdicional: l.tarifaViajeAdicional,
      totalLiquidado: l.totalLiquidado
    })),
    totalPagar: result.liquidaciones.reduce((s, l) => s + l.totalLiquidado, 0)
  });
});

export default router;
