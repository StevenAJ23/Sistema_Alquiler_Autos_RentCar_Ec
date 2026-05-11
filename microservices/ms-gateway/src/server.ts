import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

const MS_VEHICULOS = process.env.MS_VEHICULOS_URL ?? 'http://localhost:3001';
const MS_RESERVAS  = process.env.MS_RESERVAS_URL  ?? 'http://localhost:3002';
const MS_ADMIN     = process.env.MS_ADMIN_URL     ?? 'http://localhost:3003';

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));

app.get('/health', (_req, res) => {
  res.json({
    success: true, service: 'ms-gateway', status: 'UP',
    routes: { vehiculos: MS_VEHICULOS, reservas: MS_RESERVAS, admin: MS_ADMIN },
  });
});

const proxy = (target: string) =>
  createProxyMiddleware({ target, changeOrigin: true, on: {
    error: (err, _req, res: any) => {
      console.error(`[gateway] Error proxy → ${target}:`, (err as Error).message);
      res.status(502).json({ success: false, message: `Servicio no disponible: ${target}` });
    },
  }});

app.use('/api/v1/vehiculos',     proxy(MS_VEHICULOS));
app.use('/api/v1/reservas',      proxy(MS_RESERVAS));
app.use('/api/v1/alquileres',    proxy(MS_RESERVAS));
app.use('/api/v1/devoluciones',  proxy(MS_RESERVAS));
app.use('/api/v1',               proxy(MS_ADMIN));

app.listen(PORT, () => {
  console.log(`[ms-gateway] Puerto ${PORT}`);
  console.log(`  /vehiculos    → ${MS_VEHICULOS}`);
  console.log(`  /reservas     → ${MS_RESERVAS}`);
  console.log(`  /alquileres   → ${MS_RESERVAS}`);
  console.log(`  /devoluciones → ${MS_RESERVAS}`);
  console.log(`  /api/v1/*     → ${MS_ADMIN}`);
});
