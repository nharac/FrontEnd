import { EJERCICIOS_RESUELTOS, EjercicioResuelto } from './ejercicios-resueltos';

const VACIAS = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'un', 'una', 'y', 'o', 'en', 'a', 'que', 'es', 'con', 'por', 'para', 'se',
  'calcula', 'resuelve', 'halla', 'cual', 'cuál', 'cuanto', 'cuánto', 'vale', 'valor', 'si', 'al', 'lo', 'su']);

const NIVEL: Record<string, EjercicioResuelto['nivel']> = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' };

function palabras(texto: string): Set<string> {
  return new Set(texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/).filter(p => p.length > 2 && !VACIAS.has(p)));
}

/**
 * Ejercicio resuelto parecido a una pregunta: mismo tema, el que más palabras comparte
 * con el enunciado y, si empatan, el del mismo nivel.
 */
export function sugerirResuelto(tema: string, enunciado: string, dificultad?: string): EjercicioResuelto | null {
  const candidatos = EJERCICIOS_RESUELTOS.filter(e => e.tema === tema);
  if (!candidatos.length) return null;
  const clave = palabras(enunciado);
  const nivel = NIVEL[(dificultad ?? '').toLowerCase()];
  let mejor = candidatos[0];
  let mejorPuntaje = -1;
  for (const e of candidatos) {
    const p = palabras(`${e.titulo} ${e.enunciado} ${e.clave}`);
    let puntaje = 0;
    for (const w of clave) if (p.has(w)) puntaje += 2;
    if (nivel && e.nivel === nivel) puntaje += 1;
    if (puntaje > mejorPuntaje) { mejor = e; mejorPuntaje = puntaje; }
  }
  return mejor;
}
