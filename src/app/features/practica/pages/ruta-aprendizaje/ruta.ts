import { Progreso, ProgresoTema, TEMAS, Tema } from '../../models/practica.model';

/** Estado de una parada de la ruta de aprendizaje. */
export type EstadoParada = 'completado' | 'en-curso' | 'siguiente' | 'pendiente';

export interface Parada {
  tema: Tema;
  nombre: string;
  descripcion: string;
  icono: string;
  estado: EstadoParada;
  respondidas: number;
  porcentaje: number;
}

/** Preguntas mínimas y porcentaje de acierto para dar un tema por superado. */
export const MINIMO_PREGUNTAS = 10;
export const MINIMO_PORCENTAJE = 70;

export function superado(p: ProgresoTema | undefined): boolean {
  return !!p && p.respondidas >= MINIMO_PREGUNTAS && p.porcentaje >= MINIMO_PORCENTAJE;
}

/**
 * Arma la ruta en orden de aprendizaje (fundamentos → … → integrales).
 * La primera parada no superada es la "siguiente"; las que ya tienen respuestas
 * pero no se han superado quedan "en curso".
 */
export function armarRuta(progreso: Progreso | null): Parada[] {
  let siguienteMarcada = false;
  return TEMAS.map(t => {
    const p = progreso?.[t.id];
    let estado: EstadoParada;
    if (superado(p)) {
      estado = 'completado';
    } else if (!siguienteMarcada) {
      estado = 'siguiente';
      siguienteMarcada = true;
    } else {
      estado = p && p.respondidas > 0 ? 'en-curso' : 'pendiente';
    }
    return {
      tema: t.id, nombre: t.nombre, descripcion: t.descripcion, icono: t.icono, estado,
      respondidas: p?.respondidas ?? 0, porcentaje: Math.round(p?.porcentaje ?? 0),
    };
  });
}
