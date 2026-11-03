import { connectDb, getDb, pingDb } from '../src/db.js';
import { newId, todayISO } from '../src/lib/ids.js';
import { hashPassword } from '../src/lib/auth.js';
import { mkdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

await connectDb();
const info = await pingDb();
console.log('Seed DB:', info.dbName);

const db = getDb();

await Promise.all([
  db.collection('plantas').deleteMany({}),
  db.collection('operadores').deleteMany({}),
  db.collection('usuarios').deleteMany({}),
  db.collection('configuraciones').deleteMany({}),
  db.collection('configChanges').deleteMany({}),
  db.collection('cargas').deleteMany({}),
  db.collection('tiquetes').deleteMany({}),
  db.collection('exclusiones').deleteMany({}),
  db.collection('inconsistencias').deleteMany({}),
  db.collection('resultadosExtraccion').deleteMany({}),
  db.collection('liquidaciones').deleteMany({}),
  db.collection('matrices').deleteMany({}),
  db.collection('viajesLiquidables').deleteMany({}),
  db.collection('trazabilidad').deleteMany({})
]);

const planta = {
  id: newId(),
  nombre: 'Planta Jarudo Norte',
  codigo: 'JAR-N',
  ubicacion: 'Monterrey, NL',
  activa: true,
  createdAt: todayISO()
};
await db.collection('plantas').insertOne(planta);

const operadores = [
  { nombreCompleto: 'Juan Pérez', documento: 'JMP001', codigoEmpleado: 'OP-01' },
  { nombreCompleto: 'María López', documento: 'MLP002', codigoEmpleado: 'OP-02' },
  { nombreCompleto: 'Carlos Ruiz', documento: 'CRZ003', codigoEmpleado: 'OP-03' }
].map((o) => ({
  id: newId(),
  plantaId: planta.id,
  ...o,
  telefono: null,
  activo: true,
  createdAt: todayISO()
}));
await db.collection('operadores').insertMany(operadores);

const usuarios = [
  {
    id: newId(),
    email: 'jefe@jarudo.local',
    passwordHash: hashPassword('jefe123'),
    name: 'Jefe de planta',
    role: 'jefe',
    operadorId: null,
    activo: true,
    createdAt: todayISO()
  },
  {
    id: newId(),
    email: 'admin@jarudo.local',
    passwordHash: hashPassword('admin123'),
    name: 'Admin tarifas',
    role: 'admin',
    operadorId: null,
    activo: true,
    createdAt: todayISO()
  },
  {
    id: newId(),
    email: 'operador@jarudo.local',
    passwordHash: hashPassword('op123'),
    name: operadores[0].nombreCompleto,
    role: 'operador',
    operadorId: operadores[0].id,
    activo: true,
    createdAt: todayISO()
  }
];
await db.collection('usuarios').insertMany(usuarios);

const config = {
  id: newId(),
  version: 1,
  nombre: 'Reglas base MVP',
  viajesBaseSemana: 3,
  viajesBaseSabado: 2,
  tarifaViajeAdicional: 180,
  volumenConsumoInterno: 0.5,
  excluirCancelados: true,
  excluirConsumoInterno: true,
  vigenciaDesde: '2026-01-01',
  vigenciaHasta: null,
  estado: 'publicada',
  createdAt: todayISO(),
  createdBy: 'seed',
  publishedAt: todayISO(),
  usadaEnLiquidacion: false,
  motivo: 'Seed inicial'
};
await db.collection('configuraciones').insertOne(config);

const uploadRoot = path.resolve(process.env.UPLOAD_DIR || './uploads');
await mkdir(uploadRoot, { recursive: true });

const lines = [
  'TIQUETE|FECHA|OPERADOR|VEHICULO|VOLUMEN|ESTADO',
  'TKT-1001|2026-10-27|Juan Pérez|CAM-01|8.0|OK',
  'TKT-1002|2026-10-27|Juan Pérez|CAM-01|7.5|OK',
  'TKT-1003|2026-10-27|Juan Pérez|CAM-01|8.0|OK',
  'TKT-1004|2026-10-27|Juan Pérez|CAM-01|8.0|OK',
  'TKT-1005|2026-10-27|María López|CAM-02|0.5|OK',
  'TKT-1006|2026-10-27|María López|CAM-02|7.0|OK',
  'TKT-1007|2026-10-27|María López|CAM-02|7.0|CANCELADO',
  'TKT-1008|2026-10-27|Carlos Ruiz|CAM-03|9.0|OK',
  'TKT-1009|2026-10-28|Juan Pérez|CAM-01|8.0|OK',
  'TKT-1010|2026-10-28|Juan Pérez|CAM-01|8.0|OK',
  'TKT-1011|2026-10-28|Juan Pérez|CAM-01|8.0|OK',
  'TKT-1012|2026-10-28|Juan Pérez|CAM-01|8.0|OK',
  'TKT-1013|2026-11-01|Juan Pérez|CAM-01|8.0|OK',
  'TKT-1014|2026-11-01|Juan Pérez|CAM-01|8.0|OK',
  'TKT-1015|2026-11-01|María López|CAM-02|7.5|OK',
  'TKT-1016|2026-11-01|María López|CAM-02|7.5|OK',
  'TKT-1017|2026-11-01|María López|CAM-02|7.5|OK'
];

const pdfPath = path.join(uploadRoot, 'demo_sap_semana.pdf');
await new Promise((resolve, reject) => {
  const doc = new PDFDocument({ margin: 40 });
  const stream = createWriteStream(pdfPath);
  doc.pipe(stream);
  doc.fontSize(10);
  for (const l of lines) doc.text(l);
  doc.end();
  stream.on('finish', resolve);
  stream.on('error', reject);
});

console.log('Planta:', planta.codigo);
console.log('Operadores:', operadores.length);
console.log('Usuarios demo:');
console.log('  jefe@jarudo.local / jefe123');
console.log('  admin@jarudo.local / admin123');
console.log('  operador@jarudo.local / op123  →', operadores[0].nombreCompleto);
console.log('Config v1 publicada · tarifa', config.tarifaViajeAdicional);
console.log('PDF demo:', pdfPath);
console.log('Listo. Define JWT_SECRET en .env · sube demo_sap_semana.pdf (fecha 2026-10-27).');
process.exit(0);
