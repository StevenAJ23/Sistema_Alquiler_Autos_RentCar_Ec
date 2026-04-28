// src/types/domain.ts
// Tipos del dominio — espejo del schema Prisma del backend.
// Reutilizables en Ionic Vue / Quasar (Reto 3) sin modificación.

// ── Enums ────────────────────────────────────────────────────
export type UserRole       = 'ADMIN' | 'OPERADOR' | 'CLIENTE';
export type VehicleStatus  = 'DISPONIBLE' | 'RESERVADO' | 'EN_USO' | 'MANTENIMIENTO' | 'INACTIVO';
export type ReservaStatus  = 'PENDIENTE' | 'CONFIRMADA' | 'ACTIVA' | 'COMPLETADA' | 'CANCELADA';
export type AlquilerStatus = 'ACTIVO' | 'FINALIZADO' | 'CANCELADO';
export type PagoStatus     = 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO' | 'REEMBOLSADO';

// ── Catálogos ─────────────────────────────────────────────────
export interface Provincia   { id: string; nombre: string; codigo: string; }
export interface Ciudad      { id: string; nombre: string; provincia: Provincia; }
export interface Marca       { id: string; nombre: string; logoUrl?: string | null; }
export interface Modelo      { id: string; nombre: string; marca: Marca; }
export interface Categoria   { id: string; nombre: string; descripcion?: string | null; }
export interface TipoCombustible { id: string; nombre: string; }
export interface TipoTransmision { id: string; nombre: string; }
export interface ExtraEquipamiento { id: string; nombre: string; descripcion?: string | null; precioDia: number; }
export interface Seguro      { id: string; nombre: string; descripcion?: string | null; precioDia: number; cobertura?: string | null; }
export interface Tarifa      { id: string; nombre: string; precioDia: number; diasMinimos: number; categoria: Categoria; }
export interface CanalVenta  { id: string; nombre: string; codigo: string; }

// ── Empresas y Agencias ───────────────────────────────────────
export interface Empresa {
  id: string;
  nombre: string;
  ruc: string;
  email?: string | null;
  telefono?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
}

export interface Agencia {
  id: string;
  nombre: string;
  direccion: string;
  telefono?: string | null;
  email?: string | null;
  isActive: boolean;
  empresa: Empresa;
  ciudad: Ciudad;
}

// ── Vehículos ─────────────────────────────────────────────────
export interface Vehiculo {
  id: string;
  placa: string;
  color: string;
  anio: number;
  kilometraje: number;
  numeroPasajeros: number;
  precioDia: number;
  imagenUrl?: string | null;
  descripcion?: string | null;
  status: VehicleStatus;
  isActive: boolean;
  modelo: Modelo;
  categoria: Categoria;
  tipoCombustible: TipoCombustible;
  tipoTransmision: TipoTransmision;
  agencia: Agencia;
  createdAt: string;
  updatedAt: string;
}

// ── Usuarios ──────────────────────────────────────────────────
export interface Usuario {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  cedula?: string | null;
  telefono?: string | null;
  role: UserRole;
  isActive: boolean;
  ciudad?: Ciudad | null;
  cliente?: Cliente | null;
  createdAt: string;
}

export interface Cliente {
  id: string;
  usuarioId: string;
  numeroLicencia: string;
  fechaVencLicencia: string;
}

// ── Reservas ──────────────────────────────────────────────────
export interface ReservaExtra {
  id: string;
  extra: ExtraEquipamiento;
  cantidad: number;
  precioDia: number;
  subtotal: number;
}

export interface Reserva {
  id: string;
  correlationId: string;
  codigoReserva: string;
  fechaInicio: string;
  fechaFin: string;
  diasTotal: number;
  precioBase: number;
  precioExtras: number;
  precioSeguro: number;
  totalAmount: number;
  status: ReservaStatus;
  notas?: string | null;
  createdAt: string;
  usuario: Pick<Usuario, 'id' | 'email' | 'nombres' | 'apellidos'>;
  vehiculo: Vehiculo;
  agencia: Agencia;
  seguro?: Seguro | null;
  canalVenta?: CanalVenta | null;
  extras: ReservaExtra[];
  alquiler?: Alquiler | null;
  pagos: Pago[];
  facturas: Factura[];
}

// ── Alquileres ────────────────────────────────────────────────
export interface Alquiler {
  id: string;
  reservaId: string;
  kmSalida: number;
  kmEntrada?: number | null;
  fechaInicio: string;
  fechaFin?: string | null;
  cargoAdicional: number;
  status: AlquilerStatus;
  observaciones?: string | null;
  reserva?: Reserva;
  devolucion?: Devolucion | null;
  createdAt: string;
}

// ── Devoluciones ──────────────────────────────────────────────
export interface Devolucion {
  id: string;
  alquilerId: string;
  fechaDevolucion: string;
  kmEntrada: number;
  estadoVehiculo: string;
  cargoExtra: number;
  observaciones?: string | null;
  alquiler?: Alquiler;
  createdAt: string;
}

// ── Pagos ─────────────────────────────────────────────────────
export interface PagoReservaSnippet {
  id: string;
  codigoReserva: string;
  usuario?: { nombres: string; apellidos: string } | null;
}

export interface Pago {
  id: string;
  reservaId: string;
  monto: number;
  metodoPago: string;
  referencia?: string | null;
  status: PagoStatus;
  createdAt: string;
  reserva?: PagoReservaSnippet | null;
  factura?: Factura | null;
}

// ── Facturas ──────────────────────────────────────────────────
export interface DetalleFactura {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
}

export interface Factura {
  id: string;
  numeroFactura: string;
  rucCliente?: string | null;
  razonSocial?: string | null;
  subtotal: number;
  iva: number;
  total: number;
  createdAt: string;
  detalles: DetalleFactura[];
}

// ── API envelope ──────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Auth ──────────────────────────────────────────────────────
export interface AuthResponse {
  user: Usuario;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  cedula?: string;
  telefono?: string;
  ciudadId?: string;
}

// ── Búsqueda de vehículos ─────────────────────────────────────
export interface VehiculoSearchParams {
  fechaInicio?: string;
  fechaFin?: string;
  ciudadId?: string;
  categoriaId?: string;
  tipoCombustibleId?: string;
  tipoTransmisionId?: string;
}

// ── Creación de reserva ───────────────────────────────────────
export interface CreateReservaData {
  vehiculoId: string;
  agenciaId: string;
  fechaInicio: string;
  fechaFin: string;
  seguroId?: string;
  canalVentaId?: string;
  extras?: { extraId: string; cantidad: number }[];
  notas?: string;
}
