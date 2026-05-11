import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { ReservaRepository } from './reserva.repository.js';
import { NotFoundException, ValidationException, NoAvailabilityException, ForbiddenException } from '../shared/errors/BusinessException.js';

export class ReservaService {
  constructor(
    private readonly repo: ReservaRepository,
    private readonly db: PrismaClient,
  ) {}

  private generarCodigo(): string {
    const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `RC-${fecha}-${randomBytes(3).toString('hex').toUpperCase()}`;
  }

  async create(usuarioId: string, dto: any) {
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin    = new Date(dto.fechaFin);

    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    if (fechaInicio < hoy) throw new ValidationException('La fecha de inicio es pasada');
    if (fechaFin <= fechaInicio) throw new ValidationException('fechaFin debe ser posterior a fechaInicio');

    const dias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));

    const vehiculo = await this.db.vehiculo.findUnique({ where: { id: dto.vehiculoId } });
    if (!vehiculo || !vehiculo.isActive) throw new NotFoundException('Vehículo', dto.vehiculoId);
    if (vehiculo.status !== 'DISPONIBLE') throw new NoAvailabilityException(`Vehículo no disponible (estado: ${vehiculo.status})`);

    const hayConflicto = await this.repo.checkOverlap(dto.vehiculoId, fechaInicio, fechaFin);
    if (hayConflicto) throw new NoAvailabilityException('El vehículo ya tiene una reserva en esas fechas');

    const agenciaId = dto.agenciaId ?? (vehiculo as any).agenciaId;
    const totalAmount = Number(vehiculo.precioDia) * dias;

    const reserva = await this.repo.create({
      usuarioId, vehiculoId: dto.vehiculoId, agenciaId,
      codigoReserva: this.generarCodigo(),
      fechaInicio, fechaFin, diasTotal: dias,
      precioBase: totalAmount, precioExtras: 0, precioSeguro: 0, totalAmount,
      status: 'PENDIENTE', notas: dto.notas ?? null,
    });

    await this.db.outboxEvent.create({
      data: {
        usuarioId, evento: 'RESERVA_CREADA',
        payload: { reservaId: (reserva as any).id, vehiculoId: dto.vehiculoId, totalAmount, clienteIdExterno: dto.clienteId ?? null },
      },
    });

    return reserva;
  }

  async getById(id: string, usuarioId: string, isAdmin: boolean) {
    const reserva = await this.repo.findByIdWithRelations(id);
    if (!reserva) throw new NotFoundException('Reserva', id);
    if ((reserva as any).usuarioId !== usuarioId && !isAdmin) throw new ForbiddenException('Sin permisos para ver esta reserva');
    return reserva;
  }

  async updateStatus(id: string, status: string) {
    const reserva = await this.repo.findById(id);
    if (!reserva) throw new NotFoundException('Reserva', id);
    await this.repo.updateStatus(id, status);
    return this.repo.findByIdWithRelations(id);
  }

  async listAll(page = 1, limit = 20) {
    return this.repo.findAll(page, limit);
  }
}
