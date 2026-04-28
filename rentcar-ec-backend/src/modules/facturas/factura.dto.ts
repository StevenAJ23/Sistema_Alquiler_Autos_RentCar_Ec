import { z } from 'zod';
import { zCedulaORucOpcional } from '../../shared/utils/validation.utils.js';

export const CreateFacturaSchema = z.object({
  reservaId:   z.string().uuid('El ID de reserva debe ser un UUID válido'),
  pagoId:      z.string().uuid('El ID de pago debe ser un UUID válido').optional(),
  rucCliente:  zCedulaORucOpcional,
  razonSocial: z.string().trim().max(200, 'La razón social no puede superar 200 caracteres').optional(),
});

export type CreateFacturaDto = z.infer<typeof CreateFacturaSchema>;
