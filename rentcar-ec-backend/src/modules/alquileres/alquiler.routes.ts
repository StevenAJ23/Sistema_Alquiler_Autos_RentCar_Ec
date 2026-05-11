import { Router } from 'express';
import { AlquilerController } from './alquiler.controller.js';
import { authenticate, requireAdmin } from '../../shared/middlewares/auth.middleware.js';
import { authenticateJwtOrApiKey } from '../../shared/middlewares/apikey.middleware.js';
import { validateBody } from '../../shared/middlewares/validate.middleware.js';
import { CreateAlquilerSchema } from './alquiler.dto.js';

export function createAlquilerRouter(controller: AlquilerController): Router {
  const router = Router();
  const authJwtOrKey = authenticateJwtOrApiKey(authenticate);

  // POST /alquileres es endpoint del contrato Booking
  router.post('/',    authJwtOrKey, validateBody(CreateAlquilerSchema), controller.iniciar);
  router.get('/',     authenticate, requireAdmin, controller.listAll);
  router.get('/:id',  authenticate, requireAdmin, controller.getById);
  return router;
}
