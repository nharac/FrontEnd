/** Color de barra según el porcentaje de aciertos (gris si no hay intentos). */
export function colorPorcentaje(porcentaje: number, intentos = 1): 'verde' | 'ambar' | 'rojo' | 'gris' {
  if (!intentos) return 'gris';
  if (porcentaje >= 70) return 'verde';
  if (porcentaje >= 50) return 'ambar';
  return 'rojo';
}

/** Iniciales para el avatar: "Laura Gómez" → "LG". */
export function iniciales(nombre: string): string {
  const partes = (nombre || '?').trim().split(/\s+/);
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}
