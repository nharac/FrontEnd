/**
 * Modelos del módulo de quiz.
 * Reflejan los DTOs del backend (paquete quiz.application.dto).
 */

/** null = mixto (los tres temas). */
export type TemaQuiz = 'limites' | 'derivadas' | 'integrales' | null;

/** Cuerpo de POST /api/quiz/iniciar. */
export interface IniciarQuizRequest {
  tema: TemaQuiz;
  /** De 5 a 20. */
  cantidad: number;
}

/** Opción sin marcar cuál es la correcta. */
export interface OpcionQuiz {
  letra: string;
  texto: string;
}

export interface PreguntaQuiz {
  orden: number;
  preguntaId: number;
  tema: string;
  dificultad: string;
  enunciado: string;
  opciones: OpcionQuiz[];
}

/** Respuesta de POST /api/quiz/iniciar (QuizIniciadoResponse). */
export interface QuizIniciado {
  intentoId: number;
  tema: TemaQuiz;
  cantidad: number;
  segundosLimite: number;
  limiteEn: string;
  preguntas: PreguntaQuiz[];
}

/** Cuerpo de POST /api/quiz/{id}/finalizar. */
export interface FinalizarQuizRequest {
  respuestas: { preguntaId: number; letra: string | null }[];
}

export interface DetalleQuiz {
  orden: number;
  preguntaId: number;
  tema: string;
  enunciado: string;
  opciones: OpcionQuiz[];
  /** null = la dejó sin responder. */
  letraElegida: string | null;
  letraCorrecta: string | null;
  correcta: boolean;
  pista: string | null;
}

/** Calificación (QuizResultadoResponse). */
export interface ResultadoQuiz {
  intentoId: number;
  tema: TemaQuiz;
  correctas: number;
  total: number;
  porcentaje: number;
  duracionSegundos: number;
  fueraDeTiempo: boolean;
  finalizadoEn: string;
  /** Superó su mejor resultado anterior. */
  mejorMarca: boolean;
  detalle: DetalleQuiz[];
}

export interface IntentoHistorial {
  id: number;
  tema: TemaQuiz;
  correctas: number;
  total: number;
  porcentaje: number;
  duracionSegundos: number;
  fueraDeTiempo: boolean;
  fecha: string;
}

/** GET /api/quiz/historial (QuizHistorialResponse). */
export interface HistorialQuiz {
  intentos: number;
  promedio: number;
  mejor: number;
  ultimos: IntentoHistorial[];
}

export const OPCIONES_TEMA: { id: TemaQuiz; nombre: string; icono: string }[] = [
  { id: null, nombre: 'Mixto', icono: 'shuffle' },
  { id: 'limites', nombre: 'Límites', icono: 'trending_flat' },
  { id: 'derivadas', nombre: 'Derivadas', icono: 'show_chart' },
  { id: 'integrales', nombre: 'Integrales', icono: 'functions' },
];

export const CANTIDADES = [5, 10, 15, 20];

/** Debe coincidir con QuizService.SEGUNDOS_POR_PREGUNTA en el backend. */
export const SEGUNDOS_POR_PREGUNTA = 90;

export function nombreTemaQuiz(tema: TemaQuiz | string): string {
  return OPCIONES_TEMA.find(t => t.id === (tema ?? null))?.nombre ?? String(tema);
}

/** 95 → "1:35"; 3600 → "60:00". */
export function reloj(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Duración legible: "45 s", "3 min 20 s". */
export function duracion(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} min ${r} s` : `${m} min`;
}

/** Mensaje según el puntaje. */
export function veredicto(porcentaje: number): { titulo: string; texto: string } {
  if (porcentaje === 100) return { titulo: '¡Perfecto!', texto: 'Respondiste todo bien. Prueba con más preguntas o con otro tema.' };
  if (porcentaje >= 80) return { titulo: '¡Muy bien!', texto: 'Dominas casi todo. Revisa los errores para cerrar los huecos.' };
  if (porcentaje >= 60) return { titulo: 'Vas por buen camino', texto: 'Aprobaste. Mira las pistas de las que fallaste y vuelve a intentarlo.' };
  if (porcentaje >= 40) return { titulo: 'Casi', texto: 'Te falta un poco. Repasa las pistas y practica ese tema antes del siguiente quiz.' };
  return { titulo: 'A seguir practicando', texto: 'No pasa nada: revisa cada pregunta con su pista y usa la práctica o el tutor IA.' };
}
