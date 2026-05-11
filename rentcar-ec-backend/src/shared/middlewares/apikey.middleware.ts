import { Request, Response, NextFunction } from 'express';
import prisma from '../database/prisma.js';

export async function authenticateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (!apiKey) {
    res.status(401).json({ success: false, message: 'Se requiere autenticación (JWT o X-Api-Key)', errors: [] });
    return;
  }

  const sistema = await prisma.sistemaExterno.findFirst({
    where: { apiKey, isActive: true },
  });

  if (!sistema) {
    res.status(401).json({ success: false, message: 'API Key inválida o inactiva', errors: [] });
    return;
  }

  const systemUserId = process.env.BOOKING_SYSTEM_USER_ID;
  if (!systemUserId) {
    res.status(500).json({ success: false, message: 'Configuración de sistema incompleta', errors: [] });
    return;
  }

  // Inyecta un usuario de sistema para que el resto del flujo funcione igual que con JWT
  (req as any).user = { id: systemUserId, role: 'ADMIN' };
  (req as any).sistemaExterno = { id: sistema.id, nombre: sistema.nombre, codigo: sistema.codigo };

  next();
}

// Acepta JWT o API Key — primero intenta JWT, si no hay Authorization header prueba API Key
export function authenticateJwtOrApiKey(
  jwtMiddleware: (req: Request, res: Response, next: NextFunction) => void,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const hasJwt    = !!req.headers['authorization'];
    const hasApiKey = !!req.headers['x-api-key'];

    if (hasApiKey && !hasJwt) {
      authenticateApiKey(req, res, next);
      return;
    }

    jwtMiddleware(req, res, next);
  };
}
