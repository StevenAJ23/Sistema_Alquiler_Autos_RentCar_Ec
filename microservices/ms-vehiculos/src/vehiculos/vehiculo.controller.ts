import { Request, Response, NextFunction } from 'express';
import { VehiculoService } from './vehiculo.service.js';
import { toVehiculoDto } from './vehiculo.dto.js';

export class VehiculoController {
  constructor(private readonly service: VehiculoService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page     = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize || req.query.limit) || 20;
      const filters  = {
        search:     req.query.search    as string | undefined,
        categoria:  req.query.categoria as string | undefined,
        disponible: req.query.disponible !== undefined ? req.query.disponible === 'true' : undefined,
      };
      const result = await this.service.listAll(page, pageSize, filters);
      res.json({
        success: true,
        data: (result.data as any[]).map(toVehiculoDto),
        total: result.total, page: result.page, pageSize: result.limit, totalPages: result.totalPages,
      });
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const v = await this.service.getById(req.params['id'] as string);
      res.json({ success: true, data: toVehiculoDto(v) });
    } catch (err) { next(err); }
  };

  checkDisponibilidad = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query as { fechaInicio?: string; fechaFin?: string };
      if (!fechaInicio || !fechaFin) {
        res.status(400).json({ success: false, message: 'fechaInicio y fechaFin son requeridos', errors: [] });
        return;
      }
      const data = await this.service.checkDisponibilidad(req.params['id'] as string, fechaInicio, fechaFin);
      res.status(data.disponible ? 200 : 409).json({ success: true, data });
    } catch (err) { next(err); }
  };
}
