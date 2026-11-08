import { Dificultad, Tema } from './practica.model';

/** Respuestas de un día (GET /api/practica/actividad). Fecha en formato yyyy-MM-dd, hora de Colombia. */
export interface DiaActividad { fecha: string; respondidas: number; aciertos: number; }

export interface Actividad {
  dias: DiaActividad[];
  diasActivos: number;
  totalRespondidas: number;
  totalAciertos: number;
  mejorDia: DiaActividad | null;
}

export interface Rendimiento { tema: Tema; dificultad: Dificultad; respondidas: number; correctas: number; porcentaje: number; }

/** Fortalezas y debilidades (GET /api/practica/analisis). */
export interface Analisis {
  detalle: Rendimiento[];
  fortalezas: Rendimiento[];
  debilidades: Rendimiento[];
  recomendacion: { tema: Tema; dificultad: Dificultad; motivo: string } | null;
}

/** Meta de la semana, lunes a domingo (GET/PUT /api/practica/meta). */
export interface MetaSemanal {
  meta: number;
  respondidas: number;
  aciertos: number;
  inicioSemana: string;
  finSemana: string;
  /** Incluye hoy (el domingo vale 1). */
  diasRestantes: number;
  cumplida: boolean;
}

/** Mismos umbrales que MiAvanceService del backend. */
export const MIN_RESPUESTAS = 3;
export const UMBRAL_FORTALEZA = 70;
export const UMBRAL_DEBILIDAD = 60;
export const META_MIN = 5;
export const META_MAX = 300;
