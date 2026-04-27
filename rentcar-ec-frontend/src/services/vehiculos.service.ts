import { apiClient } from '@/lib/api-client';
import type {
  ApiSuccess, Vehiculo, VehiculoSearchParams, PagedResult,
} from '@/types/domain';

export const vehiculosService = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<ApiSuccess<PagedResult<Vehiculo>>>('/vehiculos', { page, limit }),

  getMarketplace: (params?: Partial<VehiculoSearchParams>) =>
    apiClient.get<ApiSuccess<Vehiculo[]>>('/vehiculos/marketplace', params),

  search: (params: VehiculoSearchParams) =>
    apiClient.get<ApiSuccess<Vehiculo[]>>('/vehiculos/search', params),

  getById: (id: string) =>
    apiClient.get<ApiSuccess<Vehiculo>>(`/vehiculos/${id}`),

  create: (data: object) =>
    apiClient.post<ApiSuccess<Vehiculo>>('/vehiculos', data),

  update: (id: string, data: object) =>
    apiClient.patch<ApiSuccess<Vehiculo>>(`/vehiculos/${id}`, data),

  remove: (id: string) =>
    apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/vehiculos/${id}`),
};
