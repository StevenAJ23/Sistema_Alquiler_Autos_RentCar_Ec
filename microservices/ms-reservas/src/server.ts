import app from './app.js';
import prisma from './shared/prisma.js';

const PORT = Number(process.env.PORT) || 3002;

async function start() {
  try {
    await prisma.$connect();
    console.log('[ms-reservas] Conectado a PostgreSQL');
    app.listen(PORT, () => console.log(`[ms-reservas] Puerto ${PORT}`));
  } catch (err) {
    console.error('[ms-reservas] Error al conectar DB:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
start();
