/** Una fila del ranking (RankingResponse del backend). */
export interface PosicionRanking {
  usuarioId: number;
  nombre: string;
  fotoPerfilUrl: string | null;
  puntosTotales: number;
  rachaActual: number | null;
}

/** Periodo del ranking (GET /api/ranking?periodo=). */
export type PeriodoRanking = 'semana' | 'mes' | 'total';

export const PERIODOS: { id: PeriodoRanking; nombre: string; corto: string }[] = [
  { id: 'semana', nombre: 'Esta semana', corto: 'esta semana' },
  { id: 'mes', nombre: 'Este mes', corto: 'este mes' },
  { id: 'total', nombre: 'Histórico', corto: 'en total' },
];

/** Un movimiento del historial de puntos. */
export interface MovimientoPuntos {
  cantidad: number;
  motivo: string;
  fecha: string;
}

/** GET /api/ranking/yo (MiPosicionResponse). */
export interface MiPosicion {
  periodo: PeriodoRanking;
  /** null si todavía no tiene puntos en el periodo. */
  posicion: number | null;
  puntos: number;
  participantes: number;
  /** Lo que le falta para pasar al de arriba (null si va primero o no tiene puesto). */
  puntosParaSubir: number | null;
  siguienteNombre: string | null;
  rachaActual: number;
  puntosHoy: number;
  puntosSemana: number;
  puntosTotales: number;
  ultimosMovimientos: MovimientoPuntos[];
}

/** Cómo se ganan los puntos (PuntosService, ValidarRespuestaService y GestionDocenteService del backend). */
export const REGLAS_PUNTOS = [
  { icono: 'task_alt', texto: 'Acertar una pregunta de práctica', detalle: 'Baja 5 por cada fallo (mínimo 5)', puntos: '+20' },
  { icono: 'verified', texto: 'Respuesta marcada oficial por un docente', detalle: 'Una vez por respuesta', puntos: '+15' },
  { icono: 'forum', texto: 'Responder en el foro', detalle: 'Hasta 3 veces al día', puntos: '+10' },
  { icono: 'local_fire_department', texto: 'Mantener la racha diaria', detalle: 'Practica días seguidos', puntos: '+5' },
];

/** Niveles según los puntos totales (solo visual, no lo guarda el backend). */
export const NIVELES = [
  { nombre: 'Novato', desde: 0, icono: 'egg' },
  { nombre: 'Aprendiz', desde: 100, icono: 'school' },
  { nombre: 'Avanzado', desde: 300, icono: 'rocket_launch' },
  { nombre: 'Experto', desde: 600, icono: 'psychology' },
  { nombre: 'Maestro del cálculo', desde: 1000, icono: 'workspace_premium' },
];

/** Nivel actual, el siguiente y el avance (0–100) hacia él. */
export function nivelDe(puntos: number) {
  const i = NIVELES.reduce((acc, n, j) => (puntos >= n.desde ? j : acc), 0);
  const actual = NIVELES[i];
  const siguiente = NIVELES[i + 1] ?? null;
  const avance = siguiente ? Math.round(((puntos - actual.desde) / (siguiente.desde - actual.desde)) * 100) : 100;
  return { actual, siguiente, avance, faltan: siguiente ? siguiente.desde - puntos : 0 };
}

/** Texto e ícono amigables para un motivo del historial ("Acierto en práctica: limites" → "Acierto en Límites"). */
export function describirMovimiento(motivo: string): { texto: string; icono: string } {
  const temas: Record<string, string> = { limites: 'Límites', derivadas: 'Derivadas', integrales: 'Integrales' };
  const practica = /^Acierto en práctica: (\w+)/.exec(motivo);
  if (practica) return { texto: `Acierto en ${temas[practica[1]] ?? practica[1]}`, icono: 'task_alt' };
  if (motivo.startsWith('Respuesta oficial')) return { texto: 'Respuesta oficial en el foro', icono: 'verified' };
  if (motivo.startsWith('Respondió en el foro')) return { texto: 'Ayudaste en el foro', icono: 'forum' };
  if (motivo.startsWith('Bonus')) return { texto: 'Bonus de racha', icono: 'local_fire_department' };
  return { texto: motivo, icono: 'stars' };
}

/** Iniciales para el avatar cuando no hay foto ("JL" para Juan Lozano). */
export function inicialesDe(nombre: string): string {
  const partes = (nombre ?? '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}
