import { Router } from 'express';
import { AlquilerController } from './alquiler.controller.js';
import { authenticate, requireAdmin } from '../shared/middlewares/auth.middleware.js';
import { authenticateJwtOrApiKey } from '../shared/middlewares/apikey.middleware.js';

export function createAlquilerRouter(controller: AlquilerController): Router {
  const router = Router();
  const authJwtOrKey = authenticateJwtOrApiKey(authenticate);

  router.post('/',     authJwtOrKey, controller.iniciar);
  router.get('/',      authenticate, requireAdmin, controller.listAll);
  router.get('/:id',  authenticate, requireAdmin, controller.getById);

  return router;
}
