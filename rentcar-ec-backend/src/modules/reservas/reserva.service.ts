import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { ReservaRepository } from './reserva.repository.js';
import { VehiculoRepository } from '../vehiculos/vehiculo.repository.js';
import { HistorialRepository } from '../historial/historial.repository.js';
import { OutboxRepository } from '../outbox/outbox.repository.js';
import {
  NotFoundException, ValidationException,
  ForbiddenException, NoAvailabilityException,
} from '../../shared/errors/BusinessException.js';
import type { CreateReservaDto } from './reserva.dto.js';

export class ReservaService {
  constructor(
    private readonly reservaRepository: ReservaRepository,
    private readonly vehiculoRepository: VehiculoRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly historialRepository: HistorialRepository,
    private readonly db: PrismaClient,
  ) {}

  private generarCodigo(): string {
    const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand  = randomBytes(3).toString('hex').toUpperCase();
    return `RC-${fecha}-${rand}`;
  }

  private calcularDias(inicio: Date, fin: Date): number {
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  }

  async create(usuarioId: string, dto: CreateReservaDto) {
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin    = new Date(dto.fechaFin);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaInicio < hoy) throw new ValidationException(`La fecha de inicio (${dto.fechaInicio}) es pasada. Hoy es ${hoy.toLocaleDateString()}`);

    if (fechaFin <= fechaInicio) throw new ValidationException('La fecha de devolución debe ser al menos un día después de la entrega');

    const dias = this.calcularDias(fechaInicio, fechaFin);
    if (dias < 1) throw new ValidationException('La duración mínima de alquiler es de 1 día');

    const vehiculo = await this.vehiculoRepository.findByIdWithRelations(dto.vehiculoId);
    if (!vehiculo || !vehiculo.isActive || vehiculo.deletedAt) throw new NotFoundException('Vehículo', dto.vehiculoId);

    // agenciaId: si Booking no lo envía, se toma del vehículo
    const agenciaId = dto.agenciaId ?? (vehiculo as any).agenciaId;

    // 1. Validar que el vehículo esté DISPONIBLE
    if (vehiculo.status !== 'DISPONIBLE') {
      throw new NoAvailabilityException(`Este vehículo ya no está disponible (Estado actual: ${vehiculo.status})`);
    }

    const hayConflicto = await this.reservaRepository.checkOverlap(dto.vehiculoId, fechaInicio, fechaFin);
    if (hayConflicto) throw new NoAvailabilityException('¡Lo sentimos! Este vehículo ya tiene una reserva confirmada en las fechas seleccionadas.');

    const precioBase = Number(vehiculo.precioDia) * dias;
    let precioSeguro = 0;
    let precioExtras = 0;
    const extrasData: any[] = [];

    if (dto.seguroId) {
      const seguro = await this.db.seguro.findUnique({ where: { id: dto.seguroId } });
      if (seguro) precioSeguro = Number(seguro.precioDia) * dias;
    }

    if (dto.extras?.length) {
      for (const item of dto.extras) {
        const extra = await this.db.extraEquipamiento.findUnique({ where: { id: item.extraId } });
        if (extra) {
          const subtotal = Number(extra.precioDia) * (item.cantidad || 1) * dias;
          precioExtras += subtotal;
          extrasData.push({ extraId: item.extraId, cantidad: item.cantidad || 1, precioDia: Number(extra.precioDia), subtotal });
        }
      }
    }

    const totalAmount = precioBase + precioSeguro + precioExtras;

    const reserva = await this.reservaRepository.create({
      usuarioId, vehiculoId: dto.vehiculoId, agenciaId,
      seguroId: dto.seguroId ?? null, canalVentaId: dto.canalVentaId ?? null,
      codigoReserva: this.generarCodigo(),
      fechaInicio, fechaFin, diasTotal: dias,
      precioBase, precioExtras, precioSeguro, totalAmount,
      status: 'PENDIENTE', notas: dto.notas ?? null,
      extras: extrasData,
    });

    await this.outboxRepository.publicar({ usuarioId, evento: 'RESERVA_CREADA', payload: { reservaId: (reserva as any).id, vehiculoId: dto.vehiculoId, totalAmount, clienteIdExterno: dto.clienteId ?? null } });
    await this.historialRepository.registrar({ usuarioId, accion: 'RESERVA_CREADA', entidad: 'Reserva', entidadId: (reserva as any).id, detalle: { codigoReserva: (reserva as any).codigoReserva, totalAmount } });

    return reserva;
  }

  async getMyReservas(usuarioId: string) {
    return this.reservaRepository.findByUserId(usuarioId);
  }

  async getById(id: string, usuarioId: string, isAdmin: boolean) {
    const reserva = await this.reservaRepository.findByIdWithRelations(id);
    if (!reserva) throw new NotFoundException('Reserva', id);
    if ((reserva as any).usuarioId !== usuarioId && !isAdmin) throw new ForbiddenException('No tienes permisos para ver esta reserva');
    return reserva;
  }

  async cancel(id: string, usuarioId: string, isAdmin: boolean) {
    const reserva = await this.reservaRepository.findByIdWithRelations(id);
    if (!reserva) throw new NotFoundException('Reserva', id);
    if ((reserva as any).usuarioId !== usuarioId && !isAdmin) throw new ForbiddenException('No tienes permisos para cancelar esta reserva');
    if ((reserva as any).status === 'CANCELADA') throw new ValidationException('La reserva ya está cancelada');
    if (['COMPLETADA', 'ACTIVA'].includes((reserva as any).status)) throw new ValidationException(`No se puede cancelar una reserva en estado ${(reserva as any).status}`);

    // NUEVO BLINDAJE HERMÉTICO: No se puede cancelar si ya se generó factura (Protección Contable)
    const tieneFactura = await this.db.factura.findFirst({ where: { reservaId: id } });
    if (tieneFactura || (reserva as any).facturas?.length > 0) {
      throw new ValidationException('BLOQUEO CONTABLE: Esta reserva ya tiene una factura legal emitida. Para anularla, debe realizar una Nota de Crédito manual en el SRI.');
    }

    await this.reservaRepository.updateStatus(id, 'CANCELADA');
    
    // Si la reserva estaba confirmada, liberar el vehículo
    if ((reserva as any).status === 'CONFIRMADA') {
      await this.db.vehiculo.update({
        where: { id: (reserva as any).vehiculoId },
        data:  { status: 'DISPONIBLE' }
      });
    }

    await this.outboxRepository.publicar({ usuarioId, evento: 'RESERVA_CANCELADA', payload: { reservaId: id, codigoReserva: (reserva as any).codigoReserva } });
    await this.historialRepository.registrar({ usuarioId, accion: 'RESERVA_CANCELADA', entidad: 'Reserva', entidadId: id });

    return { cancelada: true, codigoReserva: (reserva as any).codigoReserva };
  }

  async updateStatus(id: string, status: string) {
    const reserva = await this.reservaRepository.findById(id);
    if (!reserva) throw new NotFoundException('Reserva', id);
    await this.reservaRepository.updateStatus(id, status);
    return this.reservaRepository.findByIdWithRelations(id);
  }

  async listAll(page = 1, limit = 20) {
    return this.reservaRepository.findAll(page, limit);
  }
}
