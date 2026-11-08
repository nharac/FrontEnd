/** Grupos de logros. RETOS son las insignias especiales. */
export type CategoriaLogro = 'PRACTICA' | 'TEMAS' | 'RACHAS' | 'QUIZ' | 'COMUNIDAD' | 'PUNTOS' | 'RETOS';
/** EXCLUSIVO no se gana jugando (p. ej. Desarrollador de SAESU) y solo lo ve quien lo tiene. */
export type Rareza = 'COMUN' | 'RARO' | 'EPICO' | 'LEGENDARIO' | 'EXCLUSIVO';

/** Un logro con su estado (LogroResponse del backend, GET /api/logros). */
export interface Logro {
  codigo: string;
  /** "???" si es secreto y todavía no se tiene. */
  nombre: string;
  /** La pista, si es secreto y todavía no se tiene. */
  descripcion: string;
  /** Nombre de ícono de Material Symbols. */
  icono: string;
  categoria: CategoriaLogro;
  rareza: Rareza;
  secreto: boolean;
  obtenido: boolean;
  /** null si todavía no lo tiene. */
  fechaObtenido: string | null;
  /** Avance hacia la meta (nunca mayor que la meta). */
  progreso: number;
  meta: number;
}

export interface InfoCategoria { id: CategoriaLogro; nombre: string; icono: string; }

/** Orden y nombres con que se muestran las categorías (sin RETOS, que tiene su propia vitrina). */
export const CATEGORIAS: InfoCategoria[] = [
  { id: 'PRACTICA', nombre: 'Práctica', icono: 'edit_note' },
  { id: 'TEMAS', nombre: 'Temas', icono: 'menu_book' },
  { id: 'RACHAS', nombre: 'Rachas', icono: 'local_fire_department' },
  { id: 'QUIZ', nombre: 'Quiz', icono: 'timer' },
  { id: 'COMUNIDAD', nombre: 'Comunidad', icono: 'groups' },
  { id: 'PUNTOS', nombre: 'Puntos Sumi', icono: 'stars' },
];

export const RAREZAS: Record<Rareza, { nombre: string; orden: number }> = {
  COMUN: { nombre: 'Común', orden: 0 },
  RARO: { nombre: 'Raro', orden: 1 },
  EPICO: { nombre: 'Épico', orden: 2 },
  LEGENDARIO: { nombre: 'Legendario', orden: 3 },
  EXCLUSIVO: { nombre: 'Exclusivo', orden: 4 },
};

/** Código de la insignia exclusiva de los desarrolladores. */
export const CODIGO_DESARROLLADOR = 'DESARROLLADOR';

/** Avance de 0 a 100. */
export function avanceDe(l: Logro): number {
  if (l.obtenido) return 100;
  return l.meta > 0 ? Math.min(100, Math.round((l.progreso / l.meta) * 100)) : 0;
}

/**
 * Los logros pendientes más cercanos a cumplirse (mayor avance primero;
 * a igual avance, el de menor rareza). No se sugieren los secretos ni los que ya llegaron
 * a la meta pero esperan otra condición (p. ej. Precisión: 50 respuestas, pero menos del 80 %).
 */
export function proximosLogros(logros: Logro[], cuantos = 3): Logro[] {
  return logros
    .filter(l => !l.obtenido && !l.secreto && l.progreso < l.meta)
    .sort((a, b) => avanceDe(b) - avanceDe(a) || RAREZAS[a.rareza].orden - RAREZAS[b.rareza].orden)
    .slice(0, cuantos);
}
