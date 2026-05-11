import { PrismaClient } from '@prisma/client';
import { AlquilerRepository } from '../alquileres/alquiler.repository.js';
import { ReservaRepository } from '../reservas/reserva.repository.js';
import { NotFoundException, ValidationException } from '../shared/errors/BusinessException.js';

export class DevolucionService {
  constructor(
    private readonly alquilerRepo: AlquilerRepository,
    private readonly reservaRepo: ReservaRepository,
    private readonly db: PrismaClient,
  ) {}

  async registrar(dto: { alquilerId: string; kmEntrada: number; estadoVehiculo?: string; cargoExtra?: number; observaciones?: string }) {
    const alquiler = await this.alquilerRepo.findByIdWithRelations(dto.alquilerId);
    if (!alquiler) throw new NotFoundException('Alquiler', dto.alquilerId);
    if ((alquiler as any).status !== 'ACTIVO') throw new ValidationException('El alquiler no está activo');
    if (dto.kmEntrada < (alquiler as any).kmSalida) throw new ValidationException('km de entrada no puede ser menor al de salida');

    const devolucion = await this.db.devolucion.create({
      data: {
        alquilerId: dto.alquilerId, kmEntrada: dto.kmEntrada,
        estadoVehiculo: dto.estadoVehiculo ?? 'BUENO',
        cargoExtra: dto.cargoExtra ?? 0,
        observaciones: dto.observaciones ?? null,
        fechaDevolucion: new Date(),
      },
      include: { alquiler: { include: { reserva: true } } },
    });

    await this.alquilerRepo.update(dto.alquilerId, { status: 'FINALIZADO', fechaFin: new Date(), kmEntrada: dto.kmEntrada, cargoAdicional: dto.cargoExtra ?? 0 });

    const reservaId = (alquiler as any).reserva?.id ?? (alquiler as any).reservaId;
    await this.reservaRepo.updateStatus(reservaId, 'COMPLETADA');

    const vehiculoId = (alquiler as any).reserva?.vehiculoId;
    if (vehiculoId) {
      await this.db.vehiculo.update({ where: { id: vehiculoId }, data: { status: 'DISPONIBLE', kilometraje: dto.kmEntrada } });
    }

    await this.db.outboxEvent.create({
      data: {
        usuarioId: (alquiler as any).reserva?.usuarioId,
        evento: 'VEHICULO_DEVUELTO',
        payload: { devolucionId: devolucion.id, alquilerId: dto.alquilerId, kmEntrada: dto.kmEntrada, cargoExtra: dto.cargoExtra ?? 0 },
      },
    });

    return devolucion;
  }

  async getById(id: string) {
    const d = await this.db.devolucion.findUnique({ where: { id }, include: { alquiler: { include: { reserva: { include: { vehiculo: true } } } } } });
    if (!d) throw new NotFoundException('Devolución', id);
    return d;
  }

  async listAll() {
    return this.db.devolucion.findMany({ orderBy: { createdAt: 'desc' }, include: { alquiler: { include: { reserva: { include: { vehiculo: true } } } } } });
  }
}
