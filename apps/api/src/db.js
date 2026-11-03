import { MongoClient } from 'mongodb';

let client;
let db;
let connecting;

function requireUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta MONGODB_URI');
  return uri;
}

export function isAtlasUri() {
  return /mongodb\+srv:|\.mongodb\.net/.test(process.env.MONGODB_URI || '');
}

export async function connectDb() {
  if (db) return db;
  if (connecting) return connecting;

  connecting = (async () => {
    const uri = requireUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(); // nombre de DB en la URI
    await ensureIndexes(db);
    return db;
  })();

  try {
    return await connecting;
  } catch (e) {
    connecting = undefined;
    throw e;
  }
}

async function ensureIndexes(database) {
  await Promise.all([
    database.collection('plantas').createIndex({ codigo: 1 }, { unique: true }),
    database.collection('operadores').createIndex({ plantaId: 1, codigoEmpleado: 1 }),
    database.collection('operadores').createIndex({ nombreCompleto: 1 }),
    database
      .collection('cargas')
      .createIndex({ plantaId: 1, fechaReporte: 1, nombreArchivo: 1 }, { unique: true }),
    database.collection('tiquetes').createIndex({ numeroTiquete: 1 }),
    database.collection('tiquetes').createIndex({ cargaId: 1 }),
    database.collection('tiquetes').createIndex({ fechaTiquete: 1, operadorNombre: 1 }),
    database.collection('exclusiones').createIndex({ tiqueteId: 1 }),
    database.collection('inconsistencias').createIndex({ estado: 1, fechaDeteccion: -1 }),
    database.collection('configuraciones').createIndex({ estado: 1, vigenciaDesde: -1 }),
    database.collection('liquidaciones').createIndex(
      { plantaId: 1, operadorId: 1, semanaInicio: 1 },
      { unique: true }
    ),
    database.collection('matrices').createIndex(
      { plantaId: 1, semanaInicio: 1, operadorId: 1 },
      { unique: true }
    ),
    database.collection('trazabilidad').createIndex({ periodoLiquidacion: 1 }),
    database.collection('configChanges').createIndex({ fecha: -1 }),
    database.collection('usuarios').createIndex({ email: 1 }, { unique: true })
  ]);
}

export function getDb() {
  if (!db) throw new Error('DB no conectada');
  return db;
}

export async function pingDb() {
  const database = await connectDb();
  const ping = await database.command({ ping: 1 });
  return {
    ok: ping.ok === 1,
    dbName: database.databaseName,
    atlas: isAtlasUri()
  };
}
