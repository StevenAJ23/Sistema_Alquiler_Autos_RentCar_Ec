import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Formato de fecha inválido (YYYY-MM-DD)');

export const CreateReservaSchema = z.object({
  vehiculoId:   z.string().min(1),
  agenciaId:    z.string().min(1),
  fechaInicio:  dateString,
  fechaFin:     dateString,
  seguroId:     z.string().min(1).optional(),
  canalVentaId: z.string().min(1).optional(),
  extras:       z.array(z.object({
    extraId:  z.string().min(1),
    cantidad: z.number().int().min(1),
  })).optional(),
  notas: z.string().trim().optional(),
});

export const UpdateReservaStatusSchema = z.object({
  status: z.enum(['PENDIENTE', 'CONFIRMADA', 'ACTIVA', 'COMPLETADA', 'CANCELADA']),
});

export type CreateReservaDto       = z.infer<typeof CreateReservaSchema>;
export type UpdateReservaStatusDto = z.infer<typeof UpdateReservaStatusSchema>;
