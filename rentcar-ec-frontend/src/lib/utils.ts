import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

// shadcn/ui helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convierte rutas relativas de uploads a URL absoluta del backend
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace('/api/v1', '');
  return `${base}${url}`;
}

// Formato de precios
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Formato de fechas
export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "d 'de' MMMM yyyy", { locale: es });
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'HH:mm');
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), "d MMM · HH:mm", { locale: es });
}

// Calcular días entre dos fechas ISO
export function calcularDias(fechaInicio: string, fechaFin: string): number {
  const dias = differenceInDays(parseISO(fechaFin), parseISO(fechaInicio));
  return Math.max(1, dias);
}

// Etiqueta de estado de reserva (alquiler de autos)
export function reservaStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDIENTE:  'Pendiente',
    CONFIRMADA: 'Confirmada',
    ACTIVA:     'Activa',
    COMPLETADA: 'Completada',
    CANCELADA:  'Cancelada',
  };
  return labels[status] ?? status;
}

export function reservaStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDIENTE:  'text-yellow-600 bg-yellow-50 border-yellow-200',
    CONFIRMADA: 'text-blue-600 bg-blue-50 border-blue-200',
    ACTIVA:     'text-green-600 bg-green-50 border-green-200',
    COMPLETADA: 'text-gray-600 bg-gray-50 border-gray-200',
    CANCELADA:  'text-red-600 bg-red-50 border-red-200',
  };
  return colors[status] ?? 'text-gray-600 bg-gray-50';
}

// Etiqueta de estado de vehículo
export function vehiculoStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DISPONIBLE:   'Disponible',
    RESERVADO:    'Reservado',
    EN_USO:       'En uso',
    MANTENIMIENTO: 'Mantenimiento',
    INACTIVO:     'Inactivo',
  };
  return labels[status] ?? status;
}

export function vehiculoStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DISPONIBLE:   'text-green-600 bg-green-50 border-green-200',
    RESERVADO:    'text-blue-600 bg-blue-50 border-blue-200',
    EN_USO:       'text-orange-600 bg-orange-50 border-orange-200',
    MANTENIMIENTO: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    INACTIVO:     'text-gray-500 bg-gray-50 border-gray-200',
  };
  return colors[status] ?? 'text-gray-600 bg-gray-50';
}
