import { VehiculoRepository } from './vehiculo.repository.js';
import { NotFoundException, ValidationException } from '../shared/errors/BusinessException.js';

export class VehiculoService {
  constructor(private readonly repo: VehiculoRepository) {}

  async listAll(page = 1, limit = 20, filters: { search?: string; categoria?: string; disponible?: boolean } = {}) {
    return this.repo.findAll(page, limit, filters);
  }

  async getById(id: string) {
    const v = await this.repo.findByIdWithRelations(id);
    if (!v) throw new NotFoundException('Vehículo', id);
    return v;
  }

  async checkDisponibilidad(id: string, fechaInicioStr: string, fechaFinStr: string) {
    const vehiculo = await this.repo.findById(id);
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
      return { disponible: false, mensaje: `El vehículo no está disponible (estado: ${vehiculo.status})` };
    }

    const libre = await this.repo.checkDisponibilidad(id, fechaInicio, fechaFin);
    return {
      disponible: libre,
      mensaje: libre
        ? 'El vehículo está disponible para las fechas solicitadas'
        : 'El vehículo ya tiene una reserva activa en ese rango de fechas',
    };
  }
}
