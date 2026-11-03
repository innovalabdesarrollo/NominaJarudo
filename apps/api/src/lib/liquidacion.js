import { newId, todayISO } from './ids.js';
import { journeyType, parseDateOnly, toDateStr, weekEnd, weekStart } from './week.js';

/** Config vigente para una fecha (publicada). */
export function pickConfigForDate(configs, dateStr) {
  const d = parseDateOnly(dateStr);
  if (!d) return null;
  const published = configs
    .filter((c) => c.estado === 'publicada')
    .sort((a, b) => b.version - a.version);

  for (const c of published) {
    const desde = parseDateOnly(c.vigenciaDesde);
    const hasta = c.vigenciaHasta ? parseDateOnly(c.vigenciaHasta) : null;
    if (desde && d >= desde && (!hasta || d <= hasta)) return c;
  }
  return published[0] || null;
}

export function auditTicket(ticket, config, existingTicketNumbers) {
  const exclusiones = [];
  const inconsistencias = [];
  let auditStatus = 'valido';

  if (!ticket.numeroTiquete) {
    inconsistencias.push({
      tipoInconsistencia: 'campo_faltante',
      descripcion: 'Falta número de tiquete',
      severidad: 'critica'
    });
    auditStatus = 'inconsistente';
  }
  if (!ticket.fechaTiquete) {
    inconsistencias.push({
      tipoInconsistencia: 'campo_faltante',
      descripcion: `Tiquete ${ticket.numeroTiquete || '?'}: falta fecha`,
      severidad: 'critica'
    });
    auditStatus = 'inconsistente';
  }
  if (ticket.volumenMetrosCubicos == null) {
    inconsistencias.push({
      tipoInconsistencia: 'campo_faltante',
      descripcion: `Tiquete ${ticket.numeroTiquete}: falta volumen`,
      severidad: 'critica'
    });
    auditStatus = 'inconsistente';
  }
  if (!ticket.operadorNombre) {
    inconsistencias.push({
      tipoInconsistencia: 'campo_faltante',
      descripcion: `Tiquete ${ticket.numeroTiquete}: falta operador`,
      severidad: 'alta'
    });
    auditStatus = 'inconsistente';
  }

  const cancelado =
    config?.excluirCancelados !== false &&
    /CANCEL|ANULAD|VOID|CANCELADO/.test(String(ticket.estadoOriginal || ''));
  if (cancelado) {
    exclusiones.push({
      tipoExclusion: 'cancelado',
      motivo: 'Tiquete con estado cancelado'
    });
    auditStatus = 'cancelado';
  }

  const volInterno = Number(config?.volumenConsumoInterno ?? 0.5);
  const consumoInterno =
    config?.excluirConsumoInterno !== false &&
    ticket.volumenMetrosCubicos != null &&
    Math.abs(ticket.volumenMetrosCubicos - volInterno) < 0.001;
  if (consumoInterno && auditStatus !== 'cancelado') {
    exclusiones.push({
      tipoExclusion: 'consumo_interno',
      motivo: `Consumo interno de ${volInterno} m³`
    });
    auditStatus = 'consumo_interno';
  }

  if (
    ticket.numeroTiquete &&
    existingTicketNumbers.has(ticket.numeroTiquete) &&
    !exclusiones.some((e) => e.tipoExclusion === 'duplicado')
  ) {
    exclusiones.push({
      tipoExclusion: 'duplicado',
      motivo: 'Tiquete duplicado respecto a cargas previas'
    });
    inconsistencias.push({
      tipoInconsistencia: 'duplicado',
      descripcion: `Tiquete ${ticket.numeroTiquete} ya existe`,
      severidad: 'alta'
    });
    auditStatus = 'duplicado';
  }

  const liquidable =
    auditStatus === 'valido' && exclusiones.length === 0 && !inconsistencias.some((i) => i.severidad === 'critica');

  return { auditStatus, exclusiones, inconsistencias, liquidable };
}

/**
 * Agrupa tiquetes válidos por operador+día, aplica base, calcula adicionales.
 */
export function calcularLiquidacionSemanal({
  tiquetesValidos,
  operadoresByName,
  config,
  plantaId,
  semanaRef
}) {
  const start = weekStart(semanaRef);
  const end = weekEnd(semanaRef);
  if (!start || !end) throw new Error('Semana inválida');

  const startStr = toDateStr(start);
  const endStr = toDateStr(end);
  const baseSemana = Number(config?.viajesBaseSemana ?? 3);
  const baseSabado = Number(config?.viajesBaseSabado ?? 2);
  const tarifa = Number(config?.tarifaViajeAdicional ?? 0);

  // group by operadorId + fecha
  const byOpDay = new Map();
  const sinOperador = [];

  for (const t of tiquetesValidos) {
    const d = String(t.fechaTiquete).slice(0, 10);
    if (d < startStr || d > endStr) continue;
    const op = operadoresByName.get(normalizeName(t.operadorNombre));
    if (!op) {
      sinOperador.push(t);
      continue;
    }
    const key = `${op.id}|${d}`;
    if (!byOpDay.has(key)) byOpDay.set(key, { operador: op, fecha: d, tickets: [] });
    byOpDay.get(key).tickets.push(t);
  }

  const byOperador = new Map();
  const viajesLiquidables = [];
  const trazas = [];

  for (const group of byOpDay.values()) {
    const jornada = journeyType(group.fecha);
    const base = jornada === 'sabado' ? baseSabado : baseSemana;
    const sorted = [...group.tickets].sort((a, b) =>
      String(a.numeroTiquete).localeCompare(String(b.numeroTiquete))
    );

    sorted.forEach((t, idx) => {
      const esAdicional = idx >= base;
      viajesLiquidables.push({
        id: newId(),
        operadorId: group.operador.id,
        plantaId,
        fechaViaje: group.fecha,
        jornada,
        numeroViaje: idx + 1,
        ticketNumber: t.numeroTiquete,
        tiqueteId: t.id,
        volumenM3: t.volumenMetrosCubicos,
        estadoAuditoria: 'valido',
        esViajeAdicional: esAdicional
      });
    });

    const validos = sorted.length;
    const baseAplicada = Math.min(validos, base);
    const adicionales = Math.max(0, validos - base);

    if (!byOperador.has(group.operador.id)) {
      byOperador.set(group.operador.id, {
        operadorId: group.operador.id,
        operadorNombre: group.operador.nombreCompleto,
        viajesBase: 0,
        viajesAdicionales: 0,
        totalViajes: 0,
        viajesLiquidables: 0,
        detalleDias: []
      });
    }
    const agg = byOperador.get(group.operador.id);
    agg.viajesBase += baseAplicada;
    agg.viajesAdicionales += adicionales;
    agg.totalViajes += validos;
    agg.viajesLiquidables += validos;
    agg.detalleDias.push({
      fecha: group.fecha,
      jornada,
      base,
      validos,
      baseAplicada,
      adicionales
    });

    trazas.push({
      id: newId(),
      periodoLiquidacion: startStr,
      reglaAplicada: `base_${jornada}_${base}`,
      tarifaAplicada: tarifa,
      operacionRealizada: `Operador ${group.operador.nombreCompleto} ${group.fecha}: ${validos} válidos → base ${baseAplicada}, adicionales ${adicionales}`,
      resultadoCalculo: adicionales * tarifa,
      fechaRegistro: todayISO(),
      tipoOperacion: 'aplicacion_base',
      usuarioResponsable: 'motor'
    });
  }

  const liquidaciones = [];
  const matrices = [];

  for (const agg of byOperador.values()) {
    const totalAmount = agg.viajesAdicionales * tarifa;
    liquidaciones.push({
      id: newId(),
      plantaId,
      operadorId: agg.operadorId,
      semanaInicio: startStr,
      semanaFin: endStr,
      viajesBase: agg.viajesBase,
      viajesAdicionales: agg.viajesAdicionales,
      tarifaViajeAdicional: tarifa,
      totalLiquidado: totalAmount,
      configVersion: config?.version ?? null,
      configId: config?.id ?? null,
      estado: 'calculada',
      detalleDias: agg.detalleDias,
      createdAt: todayISO()
    });
    matrices.push({
      id: newId(),
      plantaId,
      operadorId: agg.operadorId,
      semanaInicio: startStr,
      semanaFin: endStr,
      totalViajes: agg.totalViajes,
      viajesLiquidables: agg.viajesLiquidables,
      viajesBase: agg.viajesBase,
      viajesAdicionales: agg.viajesAdicionales,
      totalLiquidado: totalAmount,
      estadoValidacion: 'pendiente',
      validadaEn: null,
      validadaPor: null
    });

    trazas.push({
      id: newId(),
      periodoLiquidacion: startStr,
      reglaAplicada: `tarifa_v${config?.version ?? '?'}`,
      tarifaAplicada: tarifa,
      operacionRealizada: `Liquidación semanal ${agg.operadorNombre}: ${agg.viajesAdicionales} × ${tarifa}`,
      resultadoCalculo: totalAmount,
      fechaRegistro: todayISO(),
      tipoOperacion: 'liquidacion',
      usuarioResponsable: 'motor'
    });
  }

  return {
    semanaInicio: startStr,
    semanaFin: endStr,
    liquidaciones,
    matrices,
    viajesLiquidables,
    trazas,
    sinOperador
  };
}

export function normalizeName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function overlapConflict(existing, candidate) {
  const a0 = parseDateOnly(candidate.vigenciaDesde);
  const a1 = candidate.vigenciaHasta ? parseDateOnly(candidate.vigenciaHasta) : null;
  if (!a0) return 'vigenciaDesde inválida';

  for (const e of existing) {
    if (e.id === candidate.id) continue;
    if (e.estado !== 'publicada' && e.estado !== 'pendiente') continue;
    const b0 = parseDateOnly(e.vigenciaDesde);
    const b1 = e.vigenciaHasta ? parseDateOnly(e.vigenciaHasta) : null;
    if (!b0) continue;
    const overlap = (!a1 || a1 >= b0) && (!b1 || b1 >= a0);
    if (overlap) {
      return `Solapa con configuración v${e.version} (${e.vigenciaDesde}–${e.vigenciaHasta || 'abierta'})`;
    }
  }
  return null;
}
