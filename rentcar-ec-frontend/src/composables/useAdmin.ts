import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

function getToken() {
  return localStorage.getItem('rentcar_token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

function extractData(response: unknown) {
  const r = response as Record<string, unknown>;
  const inner = (r?.data as Record<string, unknown>)?.data;
  if (inner !== undefined) return inner;
  if (r?.data !== undefined) return r.data;
  if (Array.isArray(response)) return response;
  return response;
}

async function adminGet(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`Error al cargar ${path}`);
  const json = await res.json();
  return extractData(json);
}

async function adminPost(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((err?.error as Record<string, unknown>)?.message as string || 'Error al crear');
  }
  return res.json();
}

async function adminPatch(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((err?.error as Record<string, unknown>)?.message as string || 'Error al actualizar');
  }
  return res.json();
}

async function adminDelete(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Error al eliminar');
  return res.json();
}

// Dashboard
export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/vehiculos?limit=1`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Error al cargar dashboard');
      const json = await res.json() as Record<string, unknown>;
      const d = json?.data as Record<string, unknown>;
      return { totalVehiculos: (d?.total as number) ?? 0 };
    },
  });
}

// Usuarios
export function useAdminUsers() {
  return useQuery({ queryKey: ['admin-usuarios'], queryFn: () => adminGet('/usuarios') });
}
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/usuarios/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-usuarios'] }),
  });
}
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/usuarios/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-usuarios'] }),
  });
}

// Agencias
export function useAdminAgencias() {
  return useQuery({ queryKey: ['admin-agencias'], queryFn: () => adminGet('/agencias') });
}
export function useCreateAgencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/agencias', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-agencias'] }),
  });
}
export function useUpdateAgencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/agencias/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-agencias'] }),
  });
}
export function useDeleteAgencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/agencias/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-agencias'] }),
  });
}

// Ciudades
export function useCiudades() {
  return useQuery({ queryKey: ['ciudades'], queryFn: () => adminGet('/ciudades') });
}

// Empresas
export function useAdminEmpresas() {
  return useQuery({ queryKey: ['admin-empresas'], queryFn: () => adminGet('/empresas') });
}
export function useCreateEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/empresas', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-empresas'] }),
  });
}
export function useUpdateEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/empresas/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-empresas'] }),
  });
}
export function useDeleteEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/empresas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-empresas'] }),
  });
}

// Reservas admin
export function useAdminReservas() {
  return useQuery({ queryKey: ['admin-reservas'], queryFn: () => adminGet('/reservas') });
}
export function useAdminUpdateReservaStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminPatch(`/reservas/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reservas'] }),
  });
}

// Alquileres
export function useAdminAlquileres() {
  return useQuery({ queryKey: ['admin-alquileres'], queryFn: () => adminGet('/alquileres') });
}
export function useIniciarAlquiler() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/alquileres', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-alquileres'] });
      qc.invalidateQueries({ queryKey: ['admin-reservas'] });
    },
  });
}
export function useRegistrarDevolucion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/devoluciones', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-alquileres'] });
      qc.invalidateQueries({ queryKey: ['admin-reservas'] });
    },
  });
}

// Pagos
export function useAdminPagos() {
  return useQuery({ queryKey: ['admin-pagos'], queryFn: () => adminGet('/pagos') });
}
export function useCrearPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/pagos', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pagos'] });
      qc.invalidateQueries({ queryKey: ['admin-reservas'] });
    },
  });
}

// Facturas
export function useAdminFacturas() {
  return useQuery({ queryKey: ['admin-facturas'], queryFn: () => adminGet('/facturas') });
}
export function useGenerarFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/facturas', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-facturas'] });
    },
  });
}

// Devoluciones
export function useAdminDevoluciones() {
  return useQuery({ queryKey: ['admin-devoluciones'], queryFn: () => adminGet('/devoluciones') });
}

// Historial
export function useAdminHistorial() {
  return useQuery({ queryKey: ['admin-historial'], queryFn: () => adminGet('/historial') });
}

// Kardex
export function useAdminKardex() {
  return useQuery({ queryKey: ['admin-kardex'], queryFn: () => adminGet('/kardex') });
}

// Mantenimientos
export function useAdminMantenimientos() {
  return useQuery({ queryKey: ['admin-mantenimientos'], queryFn: () => adminGet('/mantenimientos') });
}
export function useCrearMantenimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/mantenimientos', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-mantenimientos'] }),
  });
}
export function useUpdateMantenimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/mantenimientos/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-mantenimientos'] }),
  });
}
export function useDeleteMantenimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/mantenimientos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-mantenimientos'] }),
  });
}
