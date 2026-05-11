export function toVehiculoDto(v: any) {
  return {
    id:          v.id,
    nombre:      `${v.modelo?.marca?.nombre ?? ''} ${v.modelo?.nombre ?? ''} ${v.anio}`.trim(),
    descripcion: v.descripcion ?? null,
    precioPorDia: Number(v.precioDia),
    moneda:      'USD',
    categoria:   v.categoria?.nombre ?? null,
    disponible:  v.status === 'DISPONIBLE',
    imagenUrl:   v.imagenUrl ?? null,
  };
}
