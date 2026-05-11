import { VehiculoRepository } from './vehiculo.repository.js';
import {
  NotFoundException, ValidationException,
} from '../../shared/errors/BusinessException.js';

export class VehiculoService {
  constructor(private readonly vehiculoRepository: VehiculoRepository) {}

  async listAll(page = 1, limit = 20, filters: { search?: string; categoria?: string; disponible?: boolean } = {}) {
    return this.vehiculoRepository.findAll(page, limit, filters);
  }

  async listForMarketplace(params: any = {}) {
    return this.vehiculoRepository.findForMarketplace(params);
  }

  async search(params: any) {
    const { fechaInicio, fechaFin, ...rest } = params;
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin    = new Date(fechaFin);
      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        throw new ValidationException('fechaInicio y fechaFin deben ser fechas válidas (YYYY-MM-DD)');
      }
      if (fin <= inicio) {
        throw new ValidationException('fechaFin debe ser posterior a fechaInicio');
      }
      return this.vehiculoRepository.findAvailable({ ...rest, fechaInicio: inicio, fechaFin: fin });
    }
    return this.vehiculoRepository.findAvailable(rest);
  }

  async getById(id: string) {
    const vehiculo = await this.vehiculoRepository.findByIdWithRelations(id);
    if (!vehiculo) throw new NotFoundException('Vehículo', id);
    return vehiculo;
  }

  async create(data: any) {
    if (!data.placa || !data.agenciaId || !data.modeloId || !data.categoriaId) {
      throw new ValidationException('placa, agenciaId, modeloId y categoriaId son requeridos');
    }
    return this.vehiculoRepository.create(data);
  }

  async update(id: string, data: any) {
    const existing = await this.vehiculoRepository.findById(id);
    if (!existing) throw new NotFoundException('Vehículo', id);
    return this.vehiculoRepository.update(id, data);
  }

  async checkDisponibilidad(id: string, fechaInicioStr: string, fechaFinStr: string) {
    const vehiculo = await this.vehiculoRepository.findById(id);
    if (!vehiculo) throw new NotFoundException('Vehículo', id);

    const fechaInicio = new Date(fechaInicioStr + 'T00:00:00');
    const fechaFin    = new Date(fechaFinStr    + 'T00:00:00');

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      throw new ValidationException('fechaInicio y fechaFin deben tener formato YYYY-MM-DD');
    }
    if (fechaFin <= fechaInicio) {
      throw new ValidationException('fechaFin debe ser posterior a fechaInicio');
    }

    if (vehiculo.status !== 'DISPONIBLE') {
      return {
        disponible: false,
        mensaje:    `El vehículo no está disponible (estado actual: ${vehiculo.status})`,
      };
    }

    const libre = await this.vehiculoRepository.checkDisponibilidad(id, fechaInicio, fechaFin);
    return {
      disponible: libre,
      mensaje:    libre
        ? 'El vehículo está disponible para las fechas solicitadas'
        : 'El vehículo ya tiene una reserva activa en ese rango de fechas',
    };
  }

  async remove(id: string): Promise<void> {
    const existing = await this.vehiculoRepository.findById(id);
    if (!existing) throw new NotFoundException('Vehículo', id);
    await this.vehiculoRepository.softDelete(id);
  }
}
