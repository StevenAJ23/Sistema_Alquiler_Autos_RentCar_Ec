import { PrismaClient } from '@prisma/client';

const include = {
  modelo:          { include: { marca: true } },
  categoria:       true,
  tipoCombustible: true,
  tipoTransmision: true,
  agencia:         { include: { ciudad: { include: { provincia: true } }, empresa: true } },
};

export class VehiculoRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 20, filters: { search?: string; categoria?: string; disponible?: boolean } = {}) {
    const skip  = (page - 1) * limit;
    const where: any = { isActive: true, deletedAt: null };

    if (filters.disponible !== undefined) {
      where.status = filters.disponible ? 'DISPONIBLE' : { not: 'DISPONIBLE' };
    }
    if (filters.categoria) {
      where.categoria = { nombre: { contains: filters.categoria, mode: 'insensitive' } };
    }
    if (filters.search) {
      where.OR = [
        { modelo: { nombre: { contains: filters.search, mode: 'insensitive' } } },
        { modelo: { marca: { nombre: { contains: filters.search, mode: 'insensitive' } } } },
        { descripcion: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.db.vehiculo.findMany({ skip, take: limit, where, include, orderBy: { createdAt: 'desc' } }),
      this.db.vehiculo.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return this.db.vehiculo.findUnique({ where: { id } });
  }

  async findByIdWithRelations(id: string) {
    return this.db.vehiculo.findUnique({ where: { id }, include });
  }

  async checkDisponibilidad(id: string, fechaInicio: Date, fechaFin: Date): Promise<boolean> {
    const count = await this.db.reserva.count({
      where: {
        vehiculoId: id,
        status: { in: ['PENDIENTE', 'CONFIRMADA', 'ACTIVA'] },
        AND: [
          { fechaInicio: { lte: fechaFin } },
          { fechaFin:    { gte: fechaInicio } },
        ],
      },
    });
    return count === 0;
  }
}
