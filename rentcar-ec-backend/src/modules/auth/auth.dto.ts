import { z } from 'zod';

export const RegisterSchema = z.object({
  email:     z.string().trim().email('Email inválido'),
  password:  z.string().min(6, 'Mínimo 6 caracteres'),
  nombres:   z.string().trim().min(1, 'Nombres requeridos'),
  apellidos: z.string().trim().min(1, 'Apellidos requeridos'),
  cedula:    z.string().trim().max(13).optional(),
  telefono:  z.string().trim().optional(),
  ciudadId:  z.string().uuid().optional(),
});

export const LoginSchema = z.object({
  email:    z.string().trim().email(),
  password: z.string().min(1),
});

export const UpdateProfileSchema = z.object({
  nombres:   z.string().trim().min(1).optional(),
  apellidos: z.string().trim().min(1).optional(),
  telefono:  z.string().trim().optional(),
  ciudadId:  z.string().min(1).optional(),
});

export type RegisterDto      = z.infer<typeof RegisterSchema>;
export type LoginDto         = z.infer<typeof LoginSchema>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
