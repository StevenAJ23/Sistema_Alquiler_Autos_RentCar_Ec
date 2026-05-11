import { PrismaClient } from '@prisma/client';

const include = {
  reserva: { include: { vehiculo: { include: { modelo: { include: { marca: true } } } }, usuario: { select: { id: true, email: true, nombres: true, apellidos: true } } } },
  devolucion: true,
};

export class AlquilerRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.alquiler.findMany({ skip, take: limit, include, orderBy: { createdAt: 'desc' } }),
      this.db.alquiler.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByIdWithRelations(id: string) {
    return this.db.alquiler.findUnique({ where: { id }, include });
  }

  async findByReservaId(reservaId: string) {
    return this.db.alquiler.findUnique({ where: { reservaId }, include });
  }

  async create(data: any) {
    return this.db.alquiler.create({ data, include });
  }

  async update(id: string, data: any) {
    return this.db.alquiler.update({ where: { id }, data, include });
  }
}
