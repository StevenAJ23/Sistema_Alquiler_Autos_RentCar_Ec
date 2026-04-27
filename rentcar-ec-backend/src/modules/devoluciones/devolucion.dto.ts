import { z } from 'zod';

export const CreateDevolucionSchema = z.object({
  alquilerId:     z.string().uuid(),
  kmEntrada:      z.number().min(0),
  estadoVehiculo: z.enum(['EXCELENTE', 'BUENO', 'REGULAR', 'DAÑADO']),
  cargoExtra:     z.number().min(0).default(0),
  observaciones:  z.string().trim().optional(),
});

export type CreateDevolucionDto = z.infer<typeof CreateDevolucionSchema>;
