import { Router } from 'express';
import { ReservaController } from './reserva.controller.js';
import { authenticate, requireAdmin } from '../shared/middlewares/auth.middleware.js';
import { authenticateJwtOrApiKey } from '../shared/middlewares/apikey.middleware.js';

export function createReservaRouter(controller: ReservaController): Router {
  const router = Router();
  const authJwtOrKey = authenticateJwtOrApiKey(authenticate);

  router.post('/',      authJwtOrKey, controller.create);
  router.get('/',       authenticate, requireAdmin, controller.listAll);
  router.get('/:id',   authJwtOrKey, controller.getById);
  router.patch('/:id', authJwtOrKey, controller.updateStatus);

  return router;
}
