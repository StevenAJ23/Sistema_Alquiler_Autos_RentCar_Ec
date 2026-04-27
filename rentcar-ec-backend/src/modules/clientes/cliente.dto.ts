import { z } from 'zod';

export const CreateClienteSchema = z.object({
  usuarioId:        z.string().min(1),
  numeroLicencia:   z.string().trim().min(1),
  fechaVencLicencia: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Formato YYYY-MM-DD requerido'),
});

export const UpdateClienteSchema = z.object({
  numeroLicencia:    z.string().trim().min(1).optional(),
  fechaVencLicencia: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Formato YYYY-MM-DD requerido').optional(),
});

export type CreateClienteDto = z.infer<typeof CreateClienteSchema>;
export type UpdateClienteDto = z.infer<typeof UpdateClienteSchema>;
