import { Request, Response, NextFunction } from 'express';
import { BusinessException } from '../errors/BusinessException.js';

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof BusinessException) {
    res.status(err.statusCode).json({ success: false, message: err.message, errors: [] });
    return;
  }
  console.error('[ms-reservas] Error no controlado:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor', errors: [] });
}
