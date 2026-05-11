import { Router } from 'express';
import { DevolucionController } from './devolucion.controller.js';
import { authenticate, requireAdmin } from '../shared/middlewares/auth.middleware.js';
import { authenticateJwtOrApiKey } from '../shared/middlewares/apikey.middleware.js';

export function createDevolucionRouter(controller: DevolucionController): Router {
  const router = Router();
  const authJwtOrKey = authenticateJwtOrApiKey(authenticate);

  router.post('/',    authJwtOrKey, controller.registrar);
  router.get('/',     authenticate, requireAdmin, controller.listAll);
  router.get('/:id',  authenticate, requireAdmin, controller.getById);

  return router;
}
