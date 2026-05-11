import app from './app.js';
import prisma from './shared/prisma.js';

const PORT = Number(process.env.PORT) || 3001;

async function start() {
  try {
    await prisma.$connect();
    console.log('[ms-vehiculos] Conectado a PostgreSQL');
    app.listen(PORT, () => console.log(`[ms-vehiculos] Puerto ${PORT}`));
  } catch (err) {
    console.error('[ms-vehiculos] Error al conectar DB:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
start();
