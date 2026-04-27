import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const CreateVehiculoSchema = z.object({
  placa:             z.string().trim().min(1).max(20),
  color:             z.string().trim().min(1).max(50),
  anio:              z.number().int().min(1990).max(currentYear + 1),
  kilometraje:       z.number().min(0).default(0),
  precioDia:         z.number().positive(),
  numeroPasajeros:   z.number().int().min(1).max(20).default(5),
  descripcion:       z.string().trim().optional(),
  modeloId:          z.string().uuid(),
  categoriaId:       z.string().uuid(),
  agenciaId:         z.string().min(1),
  tipoCombustibleId: z.string().uuid(),
  tipoTransmisionId: z.string().uuid(),
});

export const UpdateVehiculoSchema = CreateVehiculoSchema.partial().extend({
  status:    z.enum(['DISPONIBLE', 'RESERVADO', 'EN_USO', 'MANTENIMIENTO', 'INACTIVO']).optional(),
  isActive:  z.boolean().optional(),
  imagenUrl: z.string().url().nullable().optional(),
});

export type CreateVehiculoDto = z.infer<typeof CreateVehiculoSchema>;
export type UpdateVehiculoDto  = z.infer<typeof UpdateVehiculoSchema>;
