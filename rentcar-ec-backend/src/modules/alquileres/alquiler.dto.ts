import { z } from 'zod';

export const CreateAlquilerSchema = z.object({
  reservaId:     z.string().uuid(),
  kmSalida:      z.number().min(0),
  observaciones: z.string().trim().optional(),
});

export type CreateAlquilerDto = z.infer<typeof CreateAlquilerSchema>;
