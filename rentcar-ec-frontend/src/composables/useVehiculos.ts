import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { vehiculosService } from '@/services/vehiculos.service';
import type { VehiculoSearchParams } from '@/types/domain';

export const VEHICULOS_KEY = ['vehiculos'] as const;

export function useVehiculos(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...VEHICULOS_KEY, { page, limit }],
    queryFn: () => vehiculosService.getAll(page, limit),
  });
}

export function useVehiculosMarketplace(params?: Partial<VehiculoSearchParams>) {
  return useQuery({
    queryKey: [...VEHICULOS_KEY, 'marketplace', params],
    queryFn: () => vehiculosService.getMarketplace(params),
  });
}

export function useVehiculosSearch(params: VehiculoSearchParams) {
  const enabled = Boolean(params.fechaInicio && params.fechaFin);
  return useQuery({
    queryKey: [...VEHICULOS_KEY, 'search', params],
    queryFn: () => vehiculosService.search(params),
    enabled,
  });
}

export function useVehiculo(id: string) {
  return useQuery({
    queryKey: [...VEHICULOS_KEY, id],
    queryFn: () => vehiculosService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateVehiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: object) => vehiculosService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
}

export function useUpdateVehiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      vehiculosService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
}

export function useDeleteVehiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiculosService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
}
