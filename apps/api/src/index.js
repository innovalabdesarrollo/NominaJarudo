import http from 'node:http';
import app from './app.js';
import { connectDb, pingDb } from './db.js';

const port = Number(process.env.PORT) || 3088;
const host = process.env.HOST || '127.0.0.1';

await connectDb();
const dbInfo = await pingDb();
console.log(
  `[NominaJarudo] DB ok · ${dbInfo.dbName}${dbInfo.atlas ? ' (Atlas)' : ''} · Node ${process.version}`
);

const server = http.createServer(app);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[NominaJarudo] Puerto ${port} en uso por otro proceso. ` +
        `No se terminó ningún proceso. Cambia PORT en .env y alinea PUBLIC_API_URL.`
    );
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`API Nómina Jarudo en http://${host}:${port}`);
});
