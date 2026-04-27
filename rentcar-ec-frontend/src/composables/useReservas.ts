import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { reservasService } from '@/services/reservas.service';
import type { CreateReservaData } from '@/types/domain';

export const RESERVAS_KEY = ['reservas'] as const;

export function useMyReservas() {
  return useQuery({
    queryKey: [...RESERVAS_KEY, 'my'],
    queryFn: () => reservasService.getMy(),
  });
}

export function useReserva(id: string) {
  return useQuery({
    queryKey: [...RESERVAS_KEY, id],
    queryFn: () => reservasService.getById(id),
    enabled: Boolean(id),
  });
}

export function useAllReservas() {
  return useQuery({
    queryKey: [...RESERVAS_KEY, 'all'],
    queryFn: () => reservasService.getAll(),
  });
}

export function useCreateReserva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReservaData) => reservasService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESERVAS_KEY }),
  });
}

export function useCancelReserva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservasService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESERVAS_KEY }),
  });
}

export function useUpdateReservaStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      reservasService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESERVAS_KEY }),
  });
}
