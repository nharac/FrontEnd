/** Una fila del ranking (RankingResponse del backend). */
export interface PosicionRanking {
  usuarioId: number;
  nombre: string;
  fotoPerfilUrl: string | null;
  puntosTotales: number;
  rachaActual: number | null;
}

/** Cómo se ganan los puntos (PuntosService del backend). */
export const REGLAS_PUNTOS = [
  { icono: 'task_alt', texto: 'Acertar una pregunta de práctica', puntos: 20 },
  { icono: 'forum', texto: 'Responder en el foro', puntos: 10 },
  { icono: 'local_fire_department', texto: 'Mantener la racha diaria', puntos: 5 },
];

/** Iniciales para el avatar cuando no hay foto ("JL" para Juan Lozano). */
export function inicialesDe(nombre: string): string {
  const partes = (nombre ?? '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}
