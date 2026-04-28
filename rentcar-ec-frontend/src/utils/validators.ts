// ── Expresiones regulares ──────────────────────────────────────────────────────

const RE_SOLO_LETRAS  = /^[a-zA-ZÀ-ÿ\s]+$/;
const RE_SOLO_DIGITOS = /^\d+$/;
const RE_CEDULA_EC    = /^\d{10}$/;
const RE_RUC_EC       = /^\d{13}$/;
const RE_PLACA_EC     = /^[A-Z]{2,3}-?\d{3,4}[A-Z]?$/;
const RE_TELEFONO     = /^[\d\s+()\-]{7,20}$/;
const RE_EMAIL        = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_UUID         = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RE_LICENCIA     = /^[a-zA-Z0-9\-]{4,20}$/;

// ── Algoritmo cédula Ecuador ──────────────────────────────────────────────────

function validarCedulaAlgoritmo(cedula: string): boolean {
  const prov = parseInt(cedula.substring(0, 2));
  if (prov < 1 || prov > 24) return false;
  const d = cedula.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let v = d[i] * (i % 2 === 0 ? 2 : 1);
    if (v > 9) v -= 9;
    sum += v;
  }
  const mod = sum % 10;
  return (mod === 0 ? 0 : 10 - mod) === d[9];
}

// ── Funciones de validación ────────────────────────────────────────────────────
// Cada función devuelve '' si es válido, o un mensaje de error si no lo es.

/** Campo de texto requerido (no vacío) */
export function reqStr(value: string, campo = 'Este campo'): string {
  return value?.trim() ? '' : `${campo} es requerido`;
}

/** Solo letras y espacios (nombres, apellidos, colores, etc.) */
export function soloLetras(value: string, campo = 'Este campo'): string {
  if (!value?.trim()) return `${campo} es requerido`;
  if (!RE_SOLO_LETRAS.test(value)) return `${campo} solo puede contener letras (sin números ni símbolos)`;
  if (value.trim().length < 2) return `${campo} debe tener al menos 2 caracteres`;
  return '';
}

/** Solo letras opcionales (vacío permitido) */
export function soloLetrasOpc(value: string, campo = 'Este campo'): string {
  if (!value?.trim()) return '';
  if (!RE_SOLO_LETRAS.test(value)) return `${campo} solo puede contener letras`;
  return '';
}

/** Email válido requerido */
export function email(value: string): string {
  if (!value?.trim()) return 'El email es requerido';
  if (!RE_EMAIL.test(value)) return 'Ingresa un email válido (ej: usuario@dominio.com)';
  return '';
}

/** Email válido opcional (vacío permitido) */
export function emailOpc(value: string): string {
  if (!value?.trim()) return '';
  if (!RE_EMAIL.test(value)) return 'Ingresa un email válido (ej: usuario@dominio.com)';
  return '';
}

/** Contraseña: mínimo 6, máximo 100 caracteres */
export function password(value: string): string {
  if (!value) return 'La contraseña es requerida';
  if (value.length < 6)  return 'La contraseña debe tener al menos 6 caracteres';
  if (value.length > 100) return 'La contraseña no puede superar 100 caracteres';
  return '';
}

/** Confirmar contraseña coincide */
export function confirmarPassword(pass: string, confirm: string): string {
  if (!confirm) return 'Confirma tu contraseña';
  if (pass !== confirm) return 'Las contraseñas no coinciden';
  return '';
}

/** Cédula ecuatoriana opcional: 10 dígitos + algoritmo */
export function cedulaEc(value: string): string {
  if (!value?.trim()) return '';
  if (!RE_CEDULA_EC.test(value)) return 'La cédula debe tener exactamente 10 dígitos';
  if (!validarCedulaAlgoritmo(value)) return 'La cédula ingresada no es válida';
  return '';
}

/** RUC ecuatoriano opcional: 13 dígitos */
export function rucEc(value: string): string {
  if (!value?.trim()) return '';
  if (!RE_SOLO_DIGITOS.test(value)) return 'El RUC debe contener solo dígitos';
  if (value.length !== 13) return 'El RUC debe tener exactamente 13 dígitos';
  if (parseInt(value.substring(10)) <= 0) return 'El RUC ingresado no es válido';
  return '';
}

/** Teléfono opcional: dígitos, +, -, espacios, paréntesis */
export function telefonoOpc(value: string): string {
  if (!value?.trim()) return '';
  if (!RE_TELEFONO.test(value)) return 'Teléfono inválido: use dígitos y los símbolos + - ( ) (7-20 caracteres)';
  return '';
}

/** Placa ecuatoriana requerida */
export function placaEc(value: string): string {
  if (!value?.trim()) return 'La placa es requerida';
  const v = value.toUpperCase().replace(/\s/g, '');
  if (!RE_PLACA_EC.test(v)) return 'Formato inválido: use letras y dígitos (ej: ABC-1234)';
  return '';
}

/** Año de vehículo */
export function anioVehiculo(value: number | string): string {
  const n = Number(value);
  const currentYear = new Date().getFullYear();
  if (value === '' || value === null || value === undefined) return 'El año es requerido';
  if (!Number.isInteger(n)) return 'El año debe ser un número entero';
  if (n < 1990) return 'El año no puede ser anterior a 1990';
  if (n > currentYear + 1) return `El año no puede superar ${currentYear + 1}`;
  return '';
}

/** Número entero no negativo (kilometraje, etc.) */
export function enteroNoNegativo(value: number | string, campo = 'Este campo'): string {
  const n = Number(value);
  if (value === '' || value === null || value === undefined) return `${campo} es requerido`;
  if (!Number.isInteger(n)) return `${campo} debe ser un número entero (sin decimales)`;
  if (n < 0) return `${campo} no puede ser negativo`;
  return '';
}

/** Número positivo decimal (precios, montos, cargos > 0) */
export function numeroPositivo(value: number | string, campo = 'Este campo'): string {
  const n = Number(value);
  if (value === '' || value === null || value === undefined) return `${campo} es requerido`;
  if (isNaN(n)) return `${campo} debe ser un número válido`;
  if (n <= 0) return `${campo} debe ser mayor a 0`;
  return '';
}

/** Número no negativo decimal (cargos extras, costos opcionales ≥ 0) */
export function numeroNoNegativo(value: number | string, campo = 'Este campo'): string {
  const n = Number(value);
  if (isNaN(n)) return `${campo} debe ser un número válido`;
  if (n < 0) return `${campo} no puede ser negativo`;
  return '';
}

/** Fecha YYYY-MM-DD no anterior a hoy */
export function fechaHoyOFutura(value: string, campo = 'La fecha'): string {
  if (!value) return `${campo} es requerida`;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  if (new Date(value + 'T00:00:00') < hoy) return `${campo} no puede ser anterior a hoy`;
  return '';
}

/** Fecha fin posterior a fecha inicio */
export function rangoFechas(inicio: string, fin: string): string {
  if (!inicio || !fin) return '';
  if (new Date(fin + 'T00:00:00') <= new Date(inicio + 'T00:00:00')) {
    return 'La fecha de fin debe ser posterior a la fecha de inicio';
  }
  return '';
}

/** UUID válido */
export function uuid(value: string, campo = 'El ID'): string {
  if (!value?.trim()) return `${campo} es requerido`;
  if (!RE_UUID.test(value)) return `${campo} debe ser un UUID válido`;
  return '';
}

/** Número de licencia: alfanumérico, 4-20 chars */
export function numeroLicencia(value: string): string {
  if (!value?.trim()) return 'El número de licencia es requerido';
  if (!RE_LICENCIA.test(value)) return 'La licencia solo puede contener letras, dígitos y guiones (4-20 caracteres)';
  return '';
}

/** Texto con longitud mínima requerida */
export function minLen(value: string, min: number, campo = 'Este campo'): string {
  if (!value?.trim()) return `${campo} es requerido`;
  if (value.trim().length < min) return `${campo} debe tener al menos ${min} caracteres`;
  return '';
}

// ── Helper para ejecutar varios validadores y obtener el primer error ─────────

/**
 * Ejecuta una lista de funciones validadoras y retorna el primer mensaje de error,
 * o '' si todos pasan.
 */
export function primero(...validators: (() => string)[]): string {
  for (const fn of validators) {
    const err = fn();
    if (err) return err;
  }
  return '';
}
