import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import prisma from './shared/prisma.js';
import { errorMiddleware } from './shared/middlewares/error.middleware.js';

import { ReservaRepository } from './reservas/reserva.repository.js';
import { ReservaService } from './reservas/reserva.service.js';
import { ReservaController } from './reservas/reserva.controller.js';
import { createReservaRouter } from './reservas/reserva.routes.js';

import { AlquilerRepository } from './alquileres/alquiler.repository.js';
import { AlquilerService } from './alquileres/alquiler.service.js';
import { AlquilerController } from './alquileres/alquiler.controller.js';
import { createAlquilerRouter } from './alquileres/alquiler.routes.js';

import { DevolucionService } from './devoluciones/devolucion.service.js';
import { DevolucionController } from './devoluciones/devolucion.controller.js';
import { createDevolucionRouter } from './devoluciones/devolucion.routes.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'ms-reservas', status: 'UP' });
});

const reservaRepo   = new ReservaRepository(prisma);
const alquilerRepo  = new AlquilerRepository(prisma);

const reservaCtrl   = new ReservaController(new ReservaService(reservaRepo, prisma));
const alquilerCtrl  = new AlquilerController(new AlquilerService(alquilerRepo, reservaRepo, prisma));
const devolucionCtrl = new DevolucionController(new DevolucionService(alquilerRepo, reservaRepo, prisma));

app.use('/api/v1/reservas',     createReservaRouter(reservaCtrl));
app.use('/api/v1/alquileres',   createAlquilerRouter(alquilerCtrl));
app.use('/api/v1/devoluciones', createDevolucionRouter(devolucionCtrl));

app.use(errorMiddleware);
export default app;
