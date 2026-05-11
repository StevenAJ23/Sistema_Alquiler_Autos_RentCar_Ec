import { Request, Response, NextFunction } from 'express';
import { ReservaService } from './reserva.service.js';

const ESTADO_A_STATUS: Record<string, string> = {
  PENDIENTE: 'PENDIENTE', CONFIRMADA: 'CONFIRMADA',
  CANCELADA: 'CANCELADA', FINALIZADA: 'COMPLETADA',
};

function toDto(r: any) {
  return { id: r.id, codigoReserva: r.codigoReserva, estado: r.status, total: Number(r.totalAmount), fechaInicio: r.fechaInicio, fechaFin: r.fechaFin, vehiculoId: r.vehiculoId };
}

export class ReservaController {
  constructor(private readonly service: ReservaService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const r = await this.service.create(req.user!.id, req.body);
      res.status(201).json({ success: true, data: toDto(r) });
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const r = await this.service.getById(req.params['id'] as string, req.user!.id, req.user!.role === 'ADMIN');
      res.json({ success: true, data: toDto(r) });
    } catch (err) { next(err); }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const statusInterno = ESTADO_A_STATUS[req.body.estado] ?? req.body.estado;
      const r = await this.service.updateStatus(req.params['id'] as string, statusInterno);
      res.json({ success: true, data: toDto(r) });
    } catch (err) { next(err); }
  };

  listAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page  = Math.max(1, parseInt(req.query['page'] as string) || 1);
      const limit = Math.min(100, parseInt(req.query['limit'] as string) || 20);
      res.json({ success: true, ...(await this.service.listAll(page, limit)) });
    } catch (err) { next(err); }
  };
}
