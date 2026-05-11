import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma.js';

export async function authenticateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  const apiKey = req.headers['x-api-key'] as string | undefined;
  if (!apiKey) {
    res.status(401).json({ success: false, message: 'Se requiere X-Api-Key', errors: [] });
    return;
  }
  const sistema = await prisma.sistemaExterno.findFirst({ where: { apiKey, isActive: true } });
  if (!sistema) {
    res.status(401).json({ success: false, message: 'API Key inválida o inactiva', errors: [] });
    return;
  }
  const systemUserId = process.env.BOOKING_SYSTEM_USER_ID;
  if (!systemUserId) {
    res.status(500).json({ success: false, message: 'Configuración incompleta', errors: [] });
    return;
  }
  (req as any).user = { id: systemUserId, role: 'ADMIN' };
  (req as any).sistemaExterno = sistema;
  next();
}

export function authenticateJwtOrApiKey(
  jwtMiddleware: (req: Request, res: Response, next: NextFunction) => void,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.headers['x-api-key'] && !req.headers['authorization']) {
      authenticateApiKey(req, res, next);
      return;
    }
    jwtMiddleware(req, res, next);
  };
}
