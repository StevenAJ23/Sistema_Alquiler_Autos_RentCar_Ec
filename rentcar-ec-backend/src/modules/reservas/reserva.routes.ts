import { Router } from 'express';
import { ReservaController } from './reserva.controller.js';
import { authenticate, requireAdmin } from '../../shared/middlewares/auth.middleware.js';
import { authenticateJwtOrApiKey } from '../../shared/middlewares/apikey.middleware.js';
import { validateBody } from '../../shared/middlewares/validate.middleware.js';
import { CreateReservaSchema, UpdateReservaStatusSchema } from './reserva.dto.js';

export function createReservaRouter(controller: ReservaController): Router {
  const router = Router();
  const authJwtOrKey = authenticateJwtOrApiKey(authenticate);

  // Rutas fijas antes de las paramétricas
  router.post('/',             authJwtOrKey, validateBody(CreateReservaSchema), controller.create);
  router.get('/',              authenticate, requireAdmin, controller.listAll);
  router.get('/my',            authenticate, controller.myReservas);

  // Rutas paramétricas
  router.get('/:id',           authJwtOrKey, controller.getById);
  router.patch('/:id/cancel',  authenticate, controller.cancel);
  router.patch('/:id',         authJwtOrKey, validateBody(UpdateReservaStatusSchema), controller.updateStatus);

  return router;
}
