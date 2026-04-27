import { z } from 'zod';

export const CreateFacturaSchema = z.object({
  reservaId:   z.string().uuid(),
  pagoId:      z.string().uuid().optional(),
  rucCliente:  z.string().trim().optional(),
  razonSocial: z.string().trim().optional(),
});

export type CreateFacturaDto = z.infer<typeof CreateFacturaSchema>;
