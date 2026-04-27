import { z } from 'zod';

export const CreateEmpresaSchema = z.object({
  nombre:    z.string().trim().min(1).max(150),
  ruc:       z.string().trim().max(20).optional(),
  email:     z.string().trim().email().optional(),
  telefono:  z.string().trim().optional(),
  direccion: z.string().trim().optional(),
  isActive:  z.boolean().default(true),
});

export const UpdateEmpresaSchema = CreateEmpresaSchema.partial();

export type CreateEmpresaDto = z.infer<typeof CreateEmpresaSchema>;
export type UpdateEmpresaDto  = z.infer<typeof UpdateEmpresaSchema>;
