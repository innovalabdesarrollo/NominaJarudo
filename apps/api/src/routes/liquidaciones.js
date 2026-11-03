import { Router } from 'express';
import { getDb } from '../db.js';
import { newId, todayISO } from '../lib/ids.js';
import {
  calcularLiquidacionSemanal,
  normalizeName,
  pickConfigForDate
} from '../lib/liquidacion.js';
import { toDateStr, weekEnd, weekStart } from '../lib/week.js';

const router = Router();

/** Normaliza cualquier día de la semana al lunes (semanaInicio). */
function semanaInicioQuery(raw) {
  if (!raw) return null;
  const start = weekStart(String(raw).slice(0, 10));
  return start ? toDateStr(start) : String(raw).slice(0, 10);
}

router.get('/', async (req, res) => {
  const db = getDb();
  const q = {};
  if (req.query.plantaId) q.plantaId = String(req.query.plantaId);
  if (req.query.semana) q.semanaInicio = semanaInicioQuery(req.query.semana);
  if (req.query.operadorId) q.operadorId = String(req.query.operadorId);
  const items = await db.collection('liquidaciones').find(q).sort({ semanaInicio: -1 }).toArray();
  res.json(items);
});

router.get('/matriz', async (req, res) => {
  const db = getDb();
  const q = {};
  if (req.query.plantaId) q.plantaId = String(req.query.plantaId);
  if (req.query.semana) q.semanaInicio = semanaInicioQuery(req.query.semana);
  const items = await db.collection('matrices').find(q).sort({ operadorId: 1 }).toArray();
  const ops = await db.collection('operadores').find({}).toArray();
  const byId = new Map(ops.map((o) => [o.id, o]));
  res.json(
    items.map((m) => ({
      ...m,
      operadorNombre: byId.get(m.operadorId)?.nombreCompleto || m.operadorId
    }))
  );
});

router.get('/trazabilidad', async (req, res) => {
  const db = getDb();
  const q = {};
  if (req.query.semana) q.periodoLiquidacion = semanaInicioQuery(req.query.semana);
  const items = await db.collection('trazabilidad').find(q).sort({ fechaRegistro: -1 }).limit(300).toArray();
  res.json(items);
});

router.post('/calcular', async (req, res) => {
  const db = getDb();
  const { plantaId, semana } = req.body || {};
  if (!plantaId || !semana) return res.status(400).json({ error: 'plantaId y semana requeridos' });

  const start = weekStart(semana);
  const end = weekEnd(semana);
  if (!start || !end) return res.status(400).json({ error: 'semana inválida' });
  const startStr = toDateStr(start);
  const endStr = toDateStr(end);

  const configs = await db.collection('configuraciones').find({}).toArray();
  const config = pickConfigForDate(configs, startStr);
  if (!config) return res.status(400).json({ error: 'No hay configuración publicada vigente' });

  const tiquetes = await db
    .collection('tiquetes')
    .find({
      plantaId,
      liquidable: true,
      fechaTiquete: { $gte: startStr, $lte: endStr }
    })
    .toArray();

  const operadores = await db.collection('operadores').find({ plantaId, activo: true }).toArray();
  const byName = new Map(operadores.map((o) => [normalizeName(o.nombreCompleto), o]));

  const result = calcularLiquidacionSemanal({
    tiquetesValidos: tiquetes,
    operadoresByName: byName,
    config,
    plantaId,
    semanaRef: startStr
  });

  // reemplazar consolidado de la semana
  await db.collection('liquidaciones').deleteMany({ plantaId, semanaInicio: startStr });
  await db.collection('matrices').deleteMany({ plantaId, semanaInicio: startStr });
  await db.collection('viajesLiquidables').deleteMany({ plantaId, fechaViaje: { $gte: startStr, $lte: endStr } });
  await db.collection('trazabilidad').deleteMany({ periodoLiquidacion: startStr });

  if (result.liquidaciones.length) await db.collection('liquidaciones').insertMany(result.liquidaciones);
  if (result.matrices.length) await db.collection('matrices').insertMany(result.matrices);
  if (result.viajesLiquidables.length) {
    await db.collection('viajesLiquidables').insertMany(result.viajesLiquidables);
  }
  if (result.trazas.length) await db.collection('trazabilidad').insertMany(result.trazas);

  await db.collection('configuraciones').updateOne(
    { id: config.id },
    { $set: { usadaEnLiquidacion: true } }
  );

  // inconsistencias por fecha fuera / sin operador
  for (const t of result.sinOperador) {
    await db.collection('inconsistencias').insertOne({
      id: newId(),
      tiqueteId: t.id,
      tipoInconsistencia: 'operador_no_catalogado',
      descripcion: `Operador "${t.operadorNombre}" no está en catálogo`,
      severidad: 'alta',
      estado: 'pendiente',
      fechaDeteccion: todayISO(),
      plantaId
    });
  }

  const ops = Object.fromEntries(operadores.map((o) => [o.id, o.nombreCompleto]));
  res.json({
    semanaInicio: startStr,
    semanaFin: endStr,
    configVersion: config.version,
    liquidaciones: result.liquidaciones.map((l) => ({
      ...l,
      operadorNombre: ops[l.operadorId]
    })),
    matrices: result.matrices.map((m) => ({
      ...m,
      operadorNombre: ops[m.operadorId]
    })),
    sinOperador: result.sinOperador.length
  });
});

router.post('/matriz/validar', async (req, res) => {
  const db = getDb();
  const { plantaId, semana, usuario } = req.body || {};
  if (!plantaId || !semana) return res.status(400).json({ error: 'plantaId y semana requeridos' });
  const startStr = toDateStr(weekStart(semana));

  const pendingCritical = await db.collection('inconsistencias').countDocuments({
    plantaId,
    estado: 'pendiente',
    severidad: 'critica'
  });
  // no bloquea duro en MVP; informa

  const now = todayISO();
  await db.collection('matrices').updateMany(
    { plantaId, semanaInicio: startStr },
    {
      $set: {
        estadoValidacion: 'confirmada',
        validadaEn: now,
        validadaPor: usuario || 'jefe_planta'
      }
    }
  );
  await db.collection('liquidaciones').updateMany(
    { plantaId, semanaInicio: startStr },
    { $set: { estado: 'cerrada', closedAt: now } }
  );

  const matrices = await db.collection('matrices').find({ plantaId, semanaInicio: startStr }).toArray();
  res.json({ ok: true, pendingCritical, matrices });
});

router.get('/export.csv', async (req, res) => {
  const db = getDb();
  const plantaId = req.query.plantaId;
  const semana = req.query.semana;
  if (!plantaId || !semana) return res.status(400).json({ error: 'plantaId y semana requeridos' });
  const startStr = toDateStr(weekStart(String(semana)));

  const matrices = await db.collection('matrices').find({ plantaId, semanaInicio: startStr }).toArray();
  if (!matrices.length) return res.status(404).json({ error: 'Sin matriz para exportar' });
  if (matrices.some((m) => m.estadoValidacion !== 'confirmada')) {
    return res.status(400).json({ error: 'La matriz debe estar validada antes de exportar' });
  }

  const ops = await db.collection('operadores').find({ plantaId }).toArray();
  const byId = new Map(ops.map((o) => [o.id, o]));
  const planta = await db.collection('plantas').findOne({ id: plantaId });
  const exclusiones = await db
    .collection('tiquetes')
    .aggregate([
      {
        $match: {
          plantaId,
          liquidable: false,
          fechaTiquete: { $gte: startStr, $lte: matrices[0].semanaFin }
        }
      },
      { $count: 'n' }
    ])
    .toArray();

  const lines = [
    'periodo_inicio,periodo_fin,planta,operador,codigo_empleado,total_viajes,viajes_liquidables,viajes_base,viajes_adicionales,total_liquidado,estado,generado_en'
  ];
  const generado = todayISO();
  for (const m of matrices) {
    const op = byId.get(m.operadorId);
    lines.push(
      [
        m.semanaInicio,
        m.semanaFin,
        csv(planta?.nombre || plantaId),
        csv(op?.nombreCompleto || m.operadorId),
        csv(op?.codigoEmpleado || ''),
        m.totalViajes,
        m.viajesLiquidables,
        m.viajesBase,
        m.viajesAdicionales,
        m.totalLiquidado,
        m.estadoValidacion,
        generado
      ].join(',')
    );
  }
  lines.push(`# exclusiones_periodo,${exclusiones[0]?.n || 0}`);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="matriz_${startStr}_${planta?.codigo || 'planta'}.csv"`
  );
  res.send(lines.join('\n'));
});

router.get('/detalle/:operadorId', async (req, res) => {
  const db = getDb();
  const { operadorId } = req.params;
  // Operador autenticado solo ve su propio detalle
  if (req.user?.role === 'operador' && req.user.operadorId && req.user.operadorId !== operadorId) {
    return res.status(403).json({ error: 'No autorizado a ver otro operador' });
  }
  const semana = req.query.semana;
  if (!semana) return res.status(400).json({ error: 'semana requerida' });
  const startStr = toDateStr(weekStart(String(semana)));
  const endStr = toDateStr(weekEnd(String(semana)));

  const liquidacion = await db.collection('liquidaciones').findOne({ operadorId, semanaInicio: startStr });
  const viajes = await db
    .collection('viajesLiquidables')
    .find({ operadorId, fechaViaje: { $gte: startStr, $lte: endStr } })
    .sort({ fechaViaje: 1, numeroViaje: 1 })
    .toArray();

  const op = await db.collection('operadores').findOne({ id: operadorId });
  const tiquetes = await db
    .collection('tiquetes')
    .find({
      plantaId: op?.plantaId,
      operadorNombre: op?.nombreCompleto,
      fechaTiquete: { $gte: startStr, $lte: endStr }
    })
    .toArray();
  const ids = tiquetes.map((t) => t.id);
  const exclusiones = ids.length
    ? await db.collection('exclusiones').find({ tiqueteId: { $in: ids } }).toArray()
    : [];

  res.json({ liquidacion, viajes, tiquetes, exclusiones });
});

function csv(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default router;
