import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

export class CatalogosController {
  constructor(private readonly db: PrismaClient) {}

  getProvincias    = async (_: Request, res: Response, next: NextFunction) => { try { res.json({ success: true, data: await this.db.provincia.findMany({ orderBy: { nombre: 'asc' } }) }); } catch (e) { next(e); } };
  getCiudades      = async (_: Request, res: Response, next: NextFunction) => { try { res.json({ success: true, data: await this.db.ciudad.findMany({ include: { provincia: true }, orderBy: { nombre: 'asc' } }) }); } catch (e) { next(e); } };
  getMarcas        = async (_: Request, res: Response, next: NextFunction) => { try { res.json({ success: true, data: await this.db.marca.findMany({ orderBy: { nombre: 'asc' } }) }); } catch (e) { next(e); } };
  getModelos       = async (_: Request, res: Response, next: NextFunction) => { try { res.json({ success: true, data: await this.db.modelo.findMany({ include: { marca: true }, orderBy: { nombre: 'asc' } }) }); } catch (e) { next(e); } };
  getCategorias    = async (_: Request, res: Response, next: NextFunction) => { try { res.json({ success: true, data: await this.db.categoria.findMany({ orderBy: { nombre: 'asc' } }) }); } catch (e) { next(e); } };
  getCombustibles  = async (_: Request, res: Response, next: NextFunction) => { try { res.json({ success: true, data: await this.db.tipoCombustible.findMany({ orderBy: { nombre: 'asc' } }) }); } catch (e) { next(e); } };
  getTransmisiones = async (_: Request, res: Response, next: NextFunction) => { try { res.json({ success: true, data: await this.db.tipoTransmision.findMany({ orderBy: { nombre: 'asc' } }) }); } catch (e) { next(e); } };
  getExtras        = async (_: Request, res: Response, next: NextFunction) => { try { res.json({ success: true, data: await this.db.extraEquipamiento.findMany({ where: { isActive: true }, orderBy: { nombre: 'asc' } }) }); } catch (e) { next(e); } };
  getSeguros       = async (_: Request, res: Response, next: NextFunction) => { try { res.json({ success: true, data: await this.db.seguro.findMany({ where: { isActive: true }, orderBy: { nombre: 'asc' } }) }); } catch (e) { next(e); } };
  getTarifas       = async (_: Request, res: Response, next: NextFunction) => { try { res.json({ success: true, data: await this.db.tarifa.findMany({ include: { categoria: true }, orderBy: { nombre: 'asc' } }) }); } catch (e) { next(e); } };
  getCanalesVenta  = async (_: Request, res: Response, next: NextFunction) => { try { res.json({ success: true, data: await this.db.canalVenta.findMany({ orderBy: { nombre: 'asc' } }) }); } catch (e) { next(e); } };
  getSistemasExternos = async (_: Request, res: Response, next: NextFunction) => { try { res.json({ success: true, data: await this.db.sistemaExterno.findMany({ orderBy: { nombre: 'asc' } }) }); } catch (e) { next(e); } };

  getEstadosVehiculo = (_: Request, res: Response): void => {
    res.json({
      success: true,
      data: [
        { value: 'DISPONIBLE',    label: 'Disponible' },
        { value: 'RESERVADO',     label: 'Reservado' },
        { value: 'EN_USO',        label: 'En uso' },
        { value: 'MANTENIMIENTO', label: 'En mantenimiento' },
        { value: 'INACTIVO',      label: 'Inactivo' },
      ],
    });
  };

  createModelo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, marcaId } = req.body;
      if (!nombre || !marcaId) {
        return res.status(400).json({ success: false, error: { message: 'Nombre y marcaId son requeridos' } });
      }

      // Evitar duplicados (409 Conflict) buscando si ya existe
      const existing = await this.db.modelo.findFirst({ where: { nombre: { equals: nombre, mode: 'insensitive' }, marcaId } });
      if (existing) {
        return res.json({ success: true, data: existing });
      }

      const data = await this.db.modelo.create({
        data: { nombre, marcaId },
        include: { marca: true }
      });
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  };

  createMarca = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre } = req.body;
      if (!nombre) {
        return res.status(400).json({ success: false, error: { message: 'El nombre de la marca es requerido' } });
      }

      // Evitar duplicados buscando si ya existe
      const existing = await this.db.marca.findFirst({ where: { nombre: { equals: nombre, mode: 'insensitive' } } });
      if (existing) {
        return res.json({ success: true, data: existing });
      }

      const data = await this.db.marca.create({ data: { nombre } });
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  };
}
