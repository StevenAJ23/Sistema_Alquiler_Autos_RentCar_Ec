import { z } from 'zod';

export const CreatePagoSchema = z.object({
  reservaId:  z.string().uuid(),
  monto:      z.number().positive(),
  metodoPago: z.enum(['EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA', 'PAYPAL', 'OTRO']),
  referencia: z.string().trim().optional(),
});

export type CreatePagoDto = z.infer<typeof CreatePagoSchema>;
