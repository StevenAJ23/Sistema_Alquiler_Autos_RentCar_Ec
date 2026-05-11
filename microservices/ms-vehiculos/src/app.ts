import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { VehiculoController } from './vehiculos/vehiculo.controller.js';
import { VehiculoService } from './vehiculos/vehiculo.service.js';
import { VehiculoRepository } from './vehiculos/vehiculo.repository.js';
import { createVehiculoRouter } from './vehiculos/vehiculo.routes.js';
import { errorMiddleware } from './shared/middlewares/error.middleware.js';
import prisma from './shared/prisma.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'ms-vehiculos', status: 'UP' });
});

const repo       = new VehiculoRepository(prisma);
const service    = new VehiculoService(repo);
const controller = new VehiculoController(service);

app.use('/api/v1/vehiculos', createVehiculoRouter(controller));

app.use(errorMiddleware);

export default app;
