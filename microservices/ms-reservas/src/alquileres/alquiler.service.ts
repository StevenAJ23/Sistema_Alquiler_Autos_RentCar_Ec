import { PrismaClient } from '@prisma/client';
import { AlquilerRepository } from './alquiler.repository.js';
import { ReservaRepository } from '../reservas/reserva.repository.js';
import { NotFoundException, ValidationException } from '../shared/errors/BusinessException.js';

export class AlquilerService {
  constructor(
    private readonly alquilerRepo: AlquilerRepository,
    private readonly reservaRepo: ReservaRepository,
    private readonly db: PrismaClient,
  ) {}

  async iniciar(dto: { reservaId: string; kmSalida: number; observaciones?: string }) {
    const reserva = await this.reservaRepo.findByIdWithRelations(dto.reservaId);
    if (!reserva) throw new NotFoundException('Reserva', dto.reservaId);
    if ((reserva as any).status !== 'CONFIRMADA') {
      throw new ValidationException(`La reserva debe estar CONFIRMADA (estado actual: ${(reserva as any).status})`);
    }
    const existente = await this.alquilerRepo.findByReservaId(dto.reservaId);
    if (existente) throw new ValidationException('Ya existe un alquiler para esta reserva');

    const alquiler = await this.alquilerRepo.create({
      reservaId: dto.reservaId, kmSalida: dto.kmSalida,
      fechaInicio: new Date(), observaciones: dto.observaciones ?? null, status: 'ACTIVO',
    });

    await this.reservaRepo.updateStatus(dto.reservaId, 'ACTIVA');
    await this.db.vehiculo.update({ where: { id: (reserva as any).vehiculoId }, data: { status: 'EN_USO' } });

    await this.db.outboxEvent.create({
      data: { usuarioId: (reserva as any).usuarioId, evento: 'ALQUILER_INICIADO', payload: { alquilerId: (alquiler as any).id, reservaId: dto.reservaId, kmSalida: dto.kmSalida } },
    });

    return alquiler;
  }

  async getById(id: string) {
    const a = await this.alquilerRepo.findByIdWithRelations(id);
    if (!a) throw new NotFoundException('Alquiler', id);
    return a;
  }

  async listAll(page = 1, limit = 20) {
    return this.alquilerRepo.findAll(page, limit);
  }
}
