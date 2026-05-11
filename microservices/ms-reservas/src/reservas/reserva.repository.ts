import { PrismaClient } from '@prisma/client';

const include = {
  usuario:   { select: { id: true, email: true, nombres: true, apellidos: true } },
  vehiculo:  { include: { modelo: { include: { marca: true } }, categoria: true } },
  agencia:   { include: { ciudad: true, empresa: true } },
  seguro:    true,
  extras:    { include: { extra: true } },
  alquiler:  true,
  pagos:     true,
  facturas:  true,
};

export class ReservaRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.reserva.findMany({ skip, take: limit, include, orderBy: { createdAt: 'desc' } }),
      this.db.reserva.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return this.db.reserva.findUnique({ where: { id } });
  }

  async findByIdWithRelations(id: string) {
    return this.db.reserva.findUnique({ where: { id }, include });
  }

  async create(data: any) {
    const { extras, ...reservaData } = data;
    return this.db.reserva.create({
      data: { ...reservaData, ...(extras?.length ? { extras: { create: extras } } : {}) },
      include,
    });
  }

  async updateStatus(id: string, status: string) {
    await this.db.reserva.update({ where: { id }, data: { status: status as any } });
  }

  async findByIdWithRelationsForUpdate(id: string) {
    return this.db.reserva.findUnique({ where: { id }, include });
  }

  async checkOverlap(vehiculoId: string, fechaInicio: Date, fechaFin: Date): Promise<boolean> {
    const count = await this.db.reserva.count({
      where: {
        vehiculoId,
        status: { in: ['PENDIENTE', 'CONFIRMADA', 'ACTIVA'] },
        AND: [
          { fechaInicio: { lte: fechaFin } },
          { fechaFin:    { gte: fechaInicio } },
        ],
      },
    });
    return count > 0;
  }
}
