import { Router } from 'express';
import { VehiculoController } from './vehiculo.controller.js';
import { authenticateApiKey } from '../shared/middlewares/apikey.middleware.js';

export function createVehiculoRouter(controller: VehiculoController): Router {
  const router = Router();

  router.get('/',                      controller.list);
  router.get('/:id/disponibilidad',    authenticateApiKey, controller.checkDisponibilidad);
  router.get('/:id',                   controller.getById);

  return router;
}
