/**
 * Utilidades de fechas para el módulo docente.
 * El backend envía LocalDateTime sin zona horaria (hora de Colombia).
 */

/** Días completos transcurridos desde la fecha. */
export function diasDesde(fecha: string): number {
  const ms = Date.now() - new Date(fecha).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** Texto relativo: "hace 5 min", "hace 3 h", "hace 2 días". */
export function haceCuanto(fecha: string): string {
  const minutos = Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / 60_000));
  if (minutos < 1) return 'hace un momento';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
}
