/**
 * Modelos del módulo de práctica.
 * Reflejan los DTOs del backend (paquete practica.application.dto).
 */

export type Tema = 'limites' | 'derivadas' | 'integrales';
export type Dificultad = 'basico' | 'intermedio' | 'avanzado';

/** Opción de respuesta (OpcionResponse). No incluye cuál es la correcta. */
export interface Opcion {
  id: number;
  letra: string;
  texto: string;
}

/** Pregunta tipo ICFES (PreguntaResponse). */
export interface Pregunta {
  id: number;
  tema: Tema;
  enunciado: string;
  dificultad: Dificultad;
  opciones: Opcion[];
}

/** Cuerpo de POST /api/practica/preguntas/{id}/responder. */
export interface ResponderRequest {
  opcionId: number;
}

/** Resultado de responder (ValidacionResponse). */
export interface Validacion {
  esCorrecta: boolean;
  /** Solo viene cuando acierta. */
  opcionCorrectaId: number | null;
  /** Solo viene cuando falla. */
  pista: string | null;
  mensaje: string;
  habilitarSiguiente: boolean;
  chatIaHabilitado: boolean;
  /** Puntos ganados con este intento (0 si falló o la pregunta ya estaba resuelta). */
  puntosGanados?: number | null;
  /** Lo que vale acertar en el siguiente intento: 20, 15, 10... mínimo 5. */
  puntosEnJuego?: number | null;
}

/** GET /api/practica/preguntas/{id}/pista (PistaResponse). */
export interface Pista {
  preguntaId: number;
  pista: string | null;
  mensaje: string | null;
}

/** Progreso de un tema (ProgresoResponse.ProgresoTema). */
export interface ProgresoTema {
  respondidas: number;
  correctas: number;
  porcentaje: number;
}

/** GET /api/practica/progreso (ProgresoResponse). */
export interface Progreso {
  limites: ProgresoTema;
  derivadas: ProgresoTema;
  integrales: ProgresoTema;
}

/** Datos de presentación de cada tema. */
export interface InfoTema {
  id: Tema;
  nombre: string;
  descripcion: string;
  icono: string;
}

export const TEMAS: InfoTema[] = [
  { id: 'limites', nombre: 'Límites', descripcion: 'Sustitución, indeterminaciones y límites al infinito', icono: 'trending_flat' },
  { id: 'derivadas', nombre: 'Derivadas', descripcion: 'Reglas de derivación, cadena y aplicaciones', icono: 'show_chart' },
  { id: 'integrales', nombre: 'Integrales', descripcion: 'Integrales inmediatas, sustitución y por partes', icono: 'functions' },
];

export const DIFICULTADES: { id: Dificultad | null; nombre: string }[] = [
  { id: null, nombre: 'Todas' },
  { id: 'basico', nombre: 'Básico' },
  { id: 'intermedio', nombre: 'Intermedio' },
  { id: 'avanzado', nombre: 'Avanzado' },
];
