import { FacturaRepository } from './factura.repository.js';
import { ReservaRepository } from '../reservas/reserva.repository.js';
import { OutboxRepository } from '../outbox/outbox.repository.js';
import {
  NotFoundException, ValidationException,
} from '../../shared/errors/BusinessException.js';
import type { CreateFacturaDto } from './factura.dto.js';

export class FacturaService {
  constructor(
    private readonly facturaRepository: FacturaRepository,
    private readonly reservaRepository: ReservaRepository,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  private generarNumeroFactura(): string {
    return `FAC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  }

  async generar(dto: CreateFacturaDto, requestingUser: { id: string; role: string }) {
    const reserva = await this.reservaRepository.findByIdWithRelations(dto.reservaId);
    if (!reserva) throw new NotFoundException('Reserva', dto.reservaId);

    // 1. Validar si ya existe una factura para esta reserva (Evitar duplicados)
    const facturaExistente = (reserva as any).facturas?.[0];
    if (facturaExistente) return facturaExistente;

    // 2. Validar propiedad (Si es cliente, la reserva debe ser suya)
    if (requestingUser.role === 'CLIENTE' && (reserva as any).usuarioId !== requestingUser.id) {
      throw new NotFoundException('Reserva', dto.reservaId);
    }

    // 3. Validar estado de la reserva
    if ((reserva as any).status === 'CANCELADA') {
      throw new ValidationException('No se puede generar factura para una reserva cancelada');
    }

    // 4. Validar pagos (Debe haber al menos un pago completado)
    const pagos = (reserva as any).pagos || [];
    const tienePagoCompletado = pagos.some((p: any) => p.status === 'COMPLETADO');
    if (!tienePagoCompletado) {
      throw new ValidationException('Debe existir al menos un pago completado para generar la factura');
    }

    // 5. Cálculo de montos (Tratamos totalAmount como PVP - IVA Incluido)
    // Formula: Subtotal = Total / 1.15 | IVA = Total - Subtotal
    const total    = Number((reserva as any).totalAmount);
    const subtotal = Math.round((total / 1.15) * 100) / 100;
    const iva      = Math.round((total - subtotal) * 100) / 100;

    const detalles: any[] = [
      {
        descripcion: `Alquiler ${(reserva as any).vehiculo?.modelo?.marca?.nombre ?? ''} ${(reserva as any).vehiculo?.modelo?.nombre ?? ''} — ${(reserva as any).diasTotal} día(s)`,
        cantidad:    (reserva as any).diasTotal,
        precioUnit:  Math.round((subtotal / (reserva as any).diasTotal) * 100) / 100,
        subtotal:    subtotal,
      },
    ];

    const factura = await this.facturaRepository.create({
      reservaId: dto.reservaId, pagoId: dto.pagoId ?? null,
      numeroFactura: this.generarNumeroFactura(),
      rucCliente: dto.rucCliente ?? null, razonSocial: dto.razonSocial ?? null,
      subtotal, iva, total, detalles,
    });

    await this.outboxRepository.publicar({
      usuarioId: (reserva as any).usuarioId, evento: 'FACTURA_GENERADA',
      payload: { facturaId: (factura as any).id, reservaId: dto.reservaId, total },
    });

    return factura;
  }

  async getById(id: string, requestingUser: { id: string; role: string }) {
    const factura = await this.facturaRepository.findByIdWithRelations(id);
    if (!factura) throw new NotFoundException('Factura', id);
    if (requestingUser.role !== 'ADMIN') {
      const reserva = await this.reservaRepository.findByIdWithRelations((factura as any).reservaId);
      if ((reserva as any)?.usuarioId !== requestingUser.id) {
        throw new NotFoundException('Factura', id);
      }
    }
    return factura;
  }

  async listAll(page = 1, limit = 20) {
    return this.facturaRepository.findAll(page, limit);
  }
}
