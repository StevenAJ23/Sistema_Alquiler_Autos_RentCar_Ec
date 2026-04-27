import { z } from 'zod';

export const UpdateUsuarioSchema = z.object({
  nombres:   z.string().trim().min(1).optional(),
  apellidos: z.string().trim().min(1).optional(),
  telefono:  z.string().trim().optional(),
  ciudadId:  z.string().min(1).optional(),
  isActive:  z.boolean().optional(),
});

export type UpdateUsuarioDto = z.infer<typeof UpdateUsuarioSchema>;
