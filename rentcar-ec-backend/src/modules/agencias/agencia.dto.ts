import { z } from 'zod';

export const CreateAgenciaSchema = z.object({
  nombre:    z.string().trim().min(1).max(150),
  empresaId: z.string().uuid(),
  ciudadId:  z.string().uuid(),
  telefono:  z.string().trim().optional(),
  email:     z.string().trim().email().optional(),
  direccion: z.string().trim().optional(),
  isActive:  z.boolean().default(true),
});

export const UpdateAgenciaSchema = CreateAgenciaSchema.partial();

export type CreateAgenciaDto = z.infer<typeof CreateAgenciaSchema>;
export type UpdateAgenciaDto  = z.infer<typeof UpdateAgenciaSchema>;
