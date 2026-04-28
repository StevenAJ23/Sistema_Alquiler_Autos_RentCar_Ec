import { apiClient } from '@/lib/api-client';
import type {
  ApiSuccess, PagedResult, Usuario, Agencia, Empresa,
  Marca, Modelo, Categoria, TipoCombustible, TipoTransmision,
  ExtraEquipamiento, Seguro, Tarifa, CanalVenta,
  Provincia, Ciudad,
} from '@/types/domain';

export const adminService = {
  getDashboard: () =>
    apiClient.get<ApiSuccess<any>>('/admin/dashboard'),

  // Usuarios
  getUsuarios: (page = 1, limit = 20) =>
    apiClient.get<ApiSuccess<PagedResult<Usuario>>>('/usuarios', { page, limit }),

  // Agencias
  getAgencias: () =>
    apiClient.get<ApiSuccess<any>>('/agencias'),
  createAgencia: (data: object) =>
    apiClient.post<ApiSuccess<Agencia>>('/agencias', data),
  updateAgencia: (id: string, data: object) =>
    apiClient.patch<ApiSuccess<Agencia>>(`/agencias/${id}`, data),
  deleteAgencia: (id: string) =>
    apiClient.delete<ApiSuccess<any>>(`/agencias/${id}`),

  // Empresas
  getEmpresas: () =>
    apiClient.get<ApiSuccess<any>>('/empresas'),
  createEmpresa: (data: object) =>
    apiClient.post<ApiSuccess<Empresa>>('/empresas', data),
  updateEmpresa: (id: string, data: object) =>
    apiClient.patch<ApiSuccess<Empresa>>(`/empresas/${id}`, data),
  deleteEmpresa: (id: string) =>
    apiClient.delete<ApiSuccess<any>>(`/empresas/${id}`),

  // Catálogos públicos
  getProvincias:    () => apiClient.get<ApiSuccess<Provincia[]>>('/provincias'),
  getCiudades:      () => apiClient.get<ApiSuccess<Ciudad[]>>('/ciudades'),
  getMarcas:        () => apiClient.get<ApiSuccess<Marca[]>>('/marcas'),
  getModelos:       () => apiClient.get<ApiSuccess<Modelo[]>>('/modelos'),
  getCategorias:    () => apiClient.get<ApiSuccess<Categoria[]>>('/categorias'),
  getCombustibles:  () => apiClient.get<ApiSuccess<TipoCombustible[]>>('/tipos-combustible'),
  getTransmisiones: () => apiClient.get<ApiSuccess<TipoTransmision[]>>('/tipos-transmision'),
  getExtras:        () => apiClient.get<ApiSuccess<ExtraEquipamiento[]>>('/extras'),
  getSeguros:       () => apiClient.get<ApiSuccess<Seguro[]>>('/seguros'),
  getTarifas:       () => apiClient.get<ApiSuccess<Tarifa[]>>('/tarifas'),
  getCanalesVenta:  () => apiClient.get<ApiSuccess<CanalVenta[]>>('/canales-venta'),

  // Auditoría
  getHistorial:    (page = 1, limit = 50) => apiClient.get<ApiSuccess<any>>('/admin/historial', { page, limit }),
  getKardex:       (page = 1, limit = 50) => apiClient.get<ApiSuccess<any>>('/admin/kardex', { page, limit }),
  getOutboxEvents: (page = 1, limit = 50) => apiClient.get<ApiSuccess<any>>('/admin/outbox-events', { page, limit }),
};

export const pagosService = {
  crear:  (data: object) => apiClient.post<ApiSuccess<any>>('/pagos', data),
  getAll: ()             => apiClient.get<ApiSuccess<any>>('/pagos'),
  getById:(id: string)   => apiClient.get<ApiSuccess<any>>(`/pagos/${id}`),
};

export const facturasService = {
  generar: (data: object) => apiClient.post<ApiSuccess<any>>('/facturas', data),
  getAll:  ()             => apiClient.get<ApiSuccess<any>>('/facturas'),
  getById: (id: string)   => apiClient.get<ApiSuccess<any>>(`/facturas/${id}`),
};

export const alquileresService = {
  iniciar: (data: object) => apiClient.post<ApiSuccess<any>>('/alquileres', data),
  getAll:  ()             => apiClient.get<ApiSuccess<any>>('/alquileres'),
  getById: (id: string)   => apiClient.get<ApiSuccess<any>>(`/alquileres/${id}`),
};

export const devolucionesService = {
  registrar: (data: object) => apiClient.post<ApiSuccess<any>>('/devoluciones', data),
  getAll:    ()             => apiClient.get<ApiSuccess<any>>('/devoluciones'),
  getById:   (id: string)   => apiClient.get<ApiSuccess<any>>(`/devoluciones/${id}`),
};
