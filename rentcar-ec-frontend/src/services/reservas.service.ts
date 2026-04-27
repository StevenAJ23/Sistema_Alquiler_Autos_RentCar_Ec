import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, Reserva, CreateReservaData } from '@/types/domain';

export const reservasService = {
  create: (data: CreateReservaData) =>
    apiClient.post<ApiSuccess<Reserva>>('/reservas', data),

  getMy: () =>
    apiClient.get<ApiSuccess<Reserva[]>>('/reservas/my'),

  getById: (id: string) =>
    apiClient.get<ApiSuccess<Reserva>>(`/reservas/${id}`),

  cancel: (id: string) =>
    apiClient.patch<ApiSuccess<{ cancelada: boolean; codigoReserva: string }>>(`/reservas/${id}/cancel`),

  // Admin
  getAll: () =>
    apiClient.get<ApiSuccess<Reserva[]>>('/reservas'),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<ApiSuccess<Reserva>>(`/reservas/${id}`, { status }),
};
