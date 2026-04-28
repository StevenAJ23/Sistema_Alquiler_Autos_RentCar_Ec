import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Iniciando limpieza de transacciones...');

  try {
    // El orden importa por las llaves foráneas
    console.log('- Borrando detalles de facturas...');
    await prisma.detalleFactura.deleteMany({});

    console.log('- Borrando facturas...');
    await prisma.factura.deleteMany({});

    console.log('- Borrando registros de alquiler (check-ins/outs)...');
    await prisma.alquiler.deleteMany({});

    console.log('- Borrando pagos...');
    await prisma.pago.deleteMany({});

    console.log('- Borrando todas las reservas...');
    await prisma.reserva.deleteMany({});

    console.log('- Restaurando estado de vehículos a DISPONIBLE...');
    await prisma.vehiculo.updateMany({
      data: { status: 'DISPONIBLE' }
    });

    console.log('\n✅ ¡Sistema limpio! Todos los vehículos están libres ahora.');
  } catch (error) {
    console.error('❌ Error limpiando el sistema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
