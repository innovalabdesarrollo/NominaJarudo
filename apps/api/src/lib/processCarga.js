import { readFile } from 'node:fs/promises';
import { getDb } from '../db.js';
import { newId, todayISO } from './ids.js';
import { extractTextFromPdf, parseTicketsFromText } from './pdfParser.js';
import { auditTicket, pickConfigForDate } from './liquidacion.js';

export async function processCarga(cargaId) {
  const db = getDb();
  const carga = await db.collection('cargas').findOne({ id: cargaId });
  if (!carga) throw new Error('Carga no encontrada');

  await db.collection('cargas').updateOne(
    { id: cargaId },
    { $set: { estadoProcesamiento: 'procesando', mensajeError: null } }
  );

  try {
    const buffer = await readFile(carga.filePath);
    const text = await extractTextFromPdf(buffer);
    const { tickets, warnings } = parseTicketsFromText(text, {
      reportDate: carga.fechaReporte
    });

    const configs = await db.collection('configuraciones').find({}).toArray();
    const config = pickConfigForDate(configs, carga.fechaReporte) || defaultConfig();

    const existing = await db
      .collection('tiquetes')
      .find({ numeroTiquete: { $ne: null } }, { projection: { numeroTiquete: 1 } })
      .toArray();
    const existingSet = new Set(existing.map((t) => t.numeroTiquete));

    // limpiar reproceso
    const oldTickets = await db.collection('tiquetes').find({ cargaId }).toArray();
    const oldIds = oldTickets.map((t) => t.id);
    if (oldIds.length) {
      await db.collection('exclusiones').deleteMany({ tiqueteId: { $in: oldIds } });
      await db.collection('inconsistencias').deleteMany({ tiqueteId: { $in: oldIds } });
      await db.collection('tiquetes').deleteMany({ cargaId });
    }

    const seenInFile = new Set();
    let validCount = 0;
    let excludedCount = 0;
    let inconsistencyCount = 0;
    const tiquetesDocs = [];
    const exclusionesDocs = [];
    const inconsistenciasDocs = [];

    for (const raw of tickets) {
      if (raw.numeroTiquete && seenInFile.has(raw.numeroTiquete)) {
        existingSet.add(raw.numeroTiquete); // fuerza duplicado intra-archivo
      }
      if (raw.numeroTiquete) seenInFile.add(raw.numeroTiquete);

      const audited = auditTicket(raw, config, existingSet);
      if (raw.numeroTiquete) existingSet.add(raw.numeroTiquete);

      const tid = newId();
      const doc = {
        id: tid,
        cargaId,
        plantaId: carga.plantaId,
        reporteSapId: cargaId,
        numeroTiquete: raw.numeroTiquete,
        fechaTiquete: raw.fechaTiquete,
        operadorNombre: raw.operadorNombre,
        vehiculo: raw.vehiculo,
        volumenMetrosCubicos: raw.volumenMetrosCubicos,
        estadoOriginal: raw.estadoOriginal,
        estadoAuditoria: audited.auditStatus,
        liquidable: audited.liquidable,
        archivoOrigen: carga.nombreArchivo,
        createdAt: todayISO()
      };
      tiquetesDocs.push(doc);

      if (audited.liquidable) validCount += 1;
      else excludedCount += 1;

      for (const ex of audited.exclusiones) {
        exclusionesDocs.push({
          id: newId(),
          tiqueteId: tid,
          motivo: ex.motivo,
          tipoExclusion: ex.tipoExclusion,
          observaciones: null,
          fechaDecision: todayISO()
        });
      }
      for (const inc of audited.inconsistencias) {
        inconsistencyCount += 1;
        inconsistenciasDocs.push({
          id: newId(),
          tiqueteId: tid,
          tipoInconsistencia: inc.tipoInconsistencia,
          descripcion: inc.descripcion,
          severidad: inc.severidad,
          estado: 'pendiente',
          fechaDeteccion: todayISO(),
          cargaId,
          plantaId: carga.plantaId
        });
      }
    }

    if (tiquetesDocs.length) await db.collection('tiquetes').insertMany(tiquetesDocs);
    if (exclusionesDocs.length) await db.collection('exclusiones').insertMany(exclusionesDocs);
    if (inconsistenciasDocs.length) {
      await db.collection('inconsistencias').insertMany(inconsistenciasDocs);
    }

    const hasErrors = tickets.length === 0 || inconsistencyCount > 0;
    const status = tickets.length === 0 ? 'error' : hasErrors ? 'con_errores' : 'procesado';

    const resultado = {
      id: newId(),
      reporteSapId: cargaId,
      estadoExtraccion: status,
      cantidadTiquetesExtraidos: tickets.length,
      cantidadTiquetesValidos: validCount,
      cantidadExcluidos: excludedCount,
      cantidadInconsistencias: inconsistencyCount,
      detalleErrores: warnings.join('; ') || null,
      fechaProcesamiento: todayISO(),
      configVersion: config.version
    };

    await db.collection('resultadosExtraccion').deleteMany({ reporteSapId: cargaId });
    await db.collection('resultadosExtraccion').insertOne(resultado);

    await db.collection('cargas').updateOne(
      { id: cargaId },
      {
        $set: {
          estadoProcesamiento: status,
          processedAt: todayISO(),
          recordsCount: tickets.length,
          validCount,
          excludedCount,
          inconsistencyCount,
          mensajeError: tickets.length === 0 ? warnings.join('; ') || 'Sin tiquetes' : null
        }
      }
    );

    return resultado;
  } catch (err) {
    await db.collection('cargas').updateOne(
      { id: cargaId },
      {
        $set: {
          estadoProcesamiento: 'error',
          mensajeError: err.message || String(err),
          processedAt: todayISO()
        }
      }
    );
    throw err;
  }
}

function defaultConfig() {
  return {
    id: 'default',
    version: 0,
    viajesBaseSemana: 3,
    viajesBaseSabado: 2,
    tarifaViajeAdicional: 150,
    volumenConsumoInterno: 0.5,
    excluirCancelados: true,
    excluirConsumoInterno: true,
    estado: 'publicada'
  };
}
