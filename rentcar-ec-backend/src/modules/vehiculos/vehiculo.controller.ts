import { Request, Response, NextFunction } from 'express';
import { VehiculoService } from './vehiculo.service.js';
import { toVehiculoDto } from './vehiculo.dto.js';

export class VehiculoController {
  constructor(private readonly vehiculoService: VehiculoService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page     = Number(req.query.page)                         || 1;
      const pageSize = Number(req.query.pageSize || req.query.limit)  || 20;
      const filters  = {
        search:     req.query.search     as string | undefined,
        categoria:  req.query.categoria  as string | undefined,
        disponible: req.query.disponible !== undefined
          ? req.query.disponible === 'true'
          : undefined,
      };
      const result = await this.vehiculoService.listAll(page, pageSize, filters);
      res.json({ success: true, data: (result.data as any[]).map(toVehiculoDto), total: result.total, page: result.page, pageSize: result.limit, totalPages: result.totalPages });
    } catch (err) { next(err); }
  };

  marketplace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({ success: true, data: await this.vehiculoService.listForMarketplace(req.query) });
    } catch (err) { next(err); }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({ success: true, data: await this.vehiculoService.search(req.query) });
    } catch (err) { next(err); }
  };

  checkDisponibilidad = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query as { fechaInicio?: string; fechaFin?: string };
      if (!fechaInicio || !fechaFin) {
        res.status(400).json({ success: false, message: 'fechaInicio y fechaFin son requeridos', errors: ['fechaInicio requerido', 'fechaFin requerido'].filter((_, i) => [!fechaInicio, !fechaFin][i]) });
        return;
      }
      const data = await this.vehiculoService.checkDisponibilidad(req.params['id'] as string, fechaInicio, fechaFin);
      const status = data.disponible ? 200 : 409;
      res.status(status).json({ success: true, data });
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehiculo = await this.vehiculoService.getById(req.params['id'] as string);
      res.json({ success: true, data: toVehiculoDto(vehiculo) });
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(201).json({ success: true, data: await this.vehiculoService.create(req.body) });
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({ success: true, data: await this.vehiculoService.update(req.params['id'] as string, req.body) });
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.vehiculoService.remove(req.params['id'] as string);
      res.json({ success: true, data: { deleted: true } });
    } catch (err) { next(err); }
  };

  uploadImagen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'No se recibió ninguna imagen' } });
        return;
      }
      const imagenUrl = `/uploads/vehiculos/${req.file.filename}`;
      const vehiculo  = await this.vehiculoService.update(req.params['id'] as string, { imagenUrl });
      res.json({ success: true, data: { imagenUrl, vehiculo } });
    } catch (err) { next(err); }
  };
}
