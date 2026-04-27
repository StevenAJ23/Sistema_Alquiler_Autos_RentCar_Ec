import { z } from 'zod';

export const CreateMantenimientoSchema = z.object({
  vehiculoId:  z.string().min(1),
  tipo:        z.string().trim().min(1),
  descripcion: z.string().trim().min(1),
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Formato YYYY-MM-DD requerido'),
  fechaFin:    z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  costo:       z.number().min(0).optional(),
  tecnico:     z.string().trim().optional(),
});

export const UpdateMantenimientoSchema = CreateMantenimientoSchema.partial().omit({ vehiculoId: true }).extend({
  isActive: z.boolean().optional(),
});

export type CreateMantenimientoDto = z.infer<typeof CreateMantenimientoSchema>;
export type UpdateMantenimientoDto = z.infer<typeof UpdateMantenimientoSchema>;
