import { extractText, getDocumentProxy } from 'unpdf';

const HEADER_ALIASES = {
  numeroTiquete: ['tiquete', 'ticket', 'folio', 'numero', 'nro', 'no', 'doc', 'documento'],
  fechaTiquete: ['fecha', 'date', 'fechadoc', 'fecha_doc', 'fechajornada'],
  operadorNombre: ['operador', 'chofer', 'conductor', 'employee', 'empleado', 'nombre'],
  vehiculo: ['vehiculo', 'vehículo', 'placa', 'unidad', 'camion', 'camión', 'equipo'],
  volumenMetrosCubicos: ['volumen', 'vol', 'm3', 'm³', 'cantidad', 'cant', 'qty'],
  estadoOriginal: ['estado', 'status', 'estatus', 'situacion', 'situación']
};

/**
 * Extrae tiquetes de texto tipo SAP / tabular.
 * Compatible con:
 * - pipe / tab / ; (con o sin encabezado)
 * - columnas por nombre (ES/EN)
 * - líneas espaciadas con fecha ISO, DD/MM/YYYY o DD.MM.YYYY
 */
export function parseTicketsFromText(text, { reportDate } = {}) {
  const rawLines = String(text || '')
    .split(/\r?\n/)
    .map((l) => l.replace(/\u00a0/g, ' ').trim())
    .filter(Boolean);

  const tickets = [];
  const warnings = [];
  let columnMap = null;

  for (const line of rawLines) {
    if (isNoiseLine(line)) continue;

    const delim = detectDelim(line);
    const parts = delim ? splitDelim(line, delim) : null;

    if (parts && looksLikeHeader(parts)) {
      columnMap = mapHeader(parts);
      continue;
    }

    let row = null;
    if (parts && columnMap) {
      row = rowFromMapped(parts, columnMap);
    } else if (parts && parts.length >= 5 && !columnMap) {
      row = rowFromPositional(parts);
    } else {
      row = rowFromLooseLine(line);
    }

    if (!row) continue;

    const fechaTiquete = normalizeDate(row.fechaTiquete) || reportDate || null;
    tickets.push({
      numeroTiquete: String(row.numeroTiquete || '').trim(),
      fechaTiquete,
      operadorNombre: String(row.operadorNombre || '').trim(),
      vehiculo: String(row.vehiculo || '').trim(),
      volumenMetrosCubicos: parseVolume(row.volumenMetrosCubicos),
      estadoOriginal: normalizeEstado(row.estadoOriginal),
      rawLine: line
    });
  }

  if (tickets.length === 0 && String(text || '').trim()) {
    warnings.push(
      'No se detectaron tiquetes. Usa columnas Folio|Fecha|Operador|Vehículo|Volumen|Estado o el PDF demo del seed.'
    );
  }

  return { tickets, warnings };
}

function isNoiseLine(line) {
  if (/^page\s+\d+/i.test(line)) return true;
  if (/^sap\s/i.test(line)) return true;
  if (/^-{3,}/.test(line)) return true;
  if (/^={3,}/.test(line)) return true;
  if (/reporte\s+de\s+producci/i.test(line)) return true;
  if (/^planta\s*:/i.test(line)) return true;
  return false;
}

function detectDelim(line) {
  if (line.includes('|')) return '|';
  if (line.includes('\t')) return '\t';
  if ((line.match(/;/g) || []).length >= 4) return ';';
  return null;
}

function splitDelim(line, delim) {
  return line.split(delim).map((p) => p.trim()).filter((p, i, arr) => !(p === '' && (i === 0 || i === arr.length - 1)));
}

function normalizeKey(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function looksLikeHeader(parts) {
  const keys = parts.map(normalizeKey);
  const hit = keys.some((k) =>
    HEADER_ALIASES.numeroTiquete.includes(k) ||
    HEADER_ALIASES.fechaTiquete.includes(k) ||
    k === 'tiquete' ||
    k === 'folio'
  );
  const hit2 = keys.some((k) => HEADER_ALIASES.volumenMetrosCubicos.includes(k) || HEADER_ALIASES.operadorNombre.includes(k));
  return hit && hit2;
}

function mapHeader(parts) {
  const map = {};
  parts.forEach((p, idx) => {
    const key = normalizeKey(p);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(key) && map[field] == null) map[field] = idx;
    }
  });
  return map.numeroTiquete != null ? map : null;
}

function rowFromMapped(parts, map) {
  const get = (field) => (map[field] != null ? parts[map[field]] : '');
  return {
    numeroTiquete: get('numeroTiquete'),
    fechaTiquete: get('fechaTiquete'),
    operadorNombre: get('operadorNombre'),
    vehiculo: get('vehiculo'),
    volumenMetrosCubicos: get('volumenMetrosCubicos'),
    estadoOriginal: get('estadoOriginal') || 'OK'
  };
}

function rowFromPositional(parts) {
  return {
    numeroTiquete: parts[0],
    fechaTiquete: parts[1],
    operadorNombre: parts[2],
    vehiculo: parts[3],
    volumenMetrosCubicos: parts[4],
    estadoOriginal: parts[5] || 'OK'
  };
}

/** Línea tipo SAP: FOLIO FECHA OPERADOR... PLACA VOL ESTADO */
function rowFromLooseLine(line) {
  const m = line.match(
    /^(\S+)\s+(\d{4}-\d{2}-\d{2}|\d{2}[./]\d{2}[./]\d{4})\s+(.+?)\s+(\S+)\s+(\d+[.,]?\d*)\s*(?:m[³3])?\s+(\S+)\s*$/i
  );
  if (!m) return null;
  return {
    numeroTiquete: m[1],
    fechaTiquete: m[2],
    operadorNombre: m[3],
    vehiculo: m[4],
    volumenMetrosCubicos: m[5],
    estadoOriginal: m[6]
  };
}

export function normalizeDate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

export function parseVolume(raw) {
  if (raw == null || raw === '') return null;
  const n = Number(
    String(raw)
      .replace(/m[³3]/gi, '')
      .trim()
      .replace(/\./g, (match, offset, str) => (str.includes(',') ? '' : match))
      .replace(',', '.')
      .replace(/[^\d.-]/g, '')
  );
  return Number.isFinite(n) ? n : null;
}

function normalizeEstado(raw) {
  const s = String(raw || 'OK').trim().toUpperCase();
  if (/^(X|CANC|ANUL|VOID)/.test(s)) return 'CANCELADO';
  return s;
}

export async function extractTextFromPdf(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return typeof text === 'string' ? text : (text || []).join('\n');
}
