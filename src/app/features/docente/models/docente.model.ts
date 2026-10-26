/**
 * Modelos del panel docente (estadísticas, estudiantes, banco de preguntas y moderación).
 * Reflejan los DTOs del backend (paquete docente.application.dto).
 */
import { TemaForo } from '../../foro/models/foro.model';

export type Dificultad = 'basico' | 'intermedio' | 'avanzado';

export const NOMBRES_DIFICULTAD: Record<string, string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado'
};

// ============================================
// Estadísticas del grupo  (GET /api/docente/estadisticas)
// ============================================

export interface TemaEstadistica {
  tema: TemaForo;
  intentos: number;
  correctas: number;
  porcentaje: number;
  estudiantes: number;
  preguntasActivas: number;
}

export interface PreguntaDificil {
  id: number;
  enunciado: string;
  tema: TemaForo;
  dificultad: Dificultad;
  intentos: number;
  fallos: number;
  porcentajeFallo: number;
  /** Texto de la opción incorrecta que más eligen. */
  errorFrecuente: string | null;
}

export interface ActividadDia {
  /** yyyy-MM-dd */
  fecha: string;
  intentos: number;
  estudiantes: number;
}

export interface EstadisticasGrupo {
  totalEstudiantes: number;
  activosSemana: number;
  intentosSemana: number;
  porcentajeAciertoGeneral: number;
  estudiantesEnRiesgo: number;
  preguntasActivas: number;
  porTema: TemaEstadistica[];
  preguntasDificiles: PreguntaDificil[];
  actividad: ActividadDia[];
}

// ============================================
// Estudiantes  (GET /api/docente/estudiantes[/{id}])
// ============================================

export interface TemaProgreso {
  tema: TemaForo;
  intentos: number;
  correctas: number;
  porcentaje: number;
  /** Preguntas distintas del tema que ya acertó. */
  resueltas: number;
  totalPreguntas: number;
}

export interface EstudianteResumen {
  id: number;
  nombre: string;
  correo: string;
  fotoPerfilUrl: string | null;
  puntos: number;
  racha: number;
  intentos: number;
  correctas: number;
  porcentaje: number;
  ultimaActividad: string | null;
  enRiesgo: boolean;
  motivosRiesgo: string[];
  porTema: TemaProgreso[];
}

export interface IntentoReciente {
  preguntaId: number;
  enunciado: string;
  tema: TemaForo;
  opcionElegida: string;
  correcta: boolean;
  fecha: string;
}

export interface PreguntaConFallos {
  preguntaId: number;
  enunciado: string;
  tema: TemaForo;
  fallos: number;
  resuelta: boolean;
}

export interface EstudianteDetalle {
  resumen: EstudianteResumen;
  fechaRegistro: string;
  logrosObtenidos: number;
  publicaciones: number;
  respuestasForo: number;
  respuestasOficiales: number;
  ultimosIntentos: IntentoReciente[];
  preguntasConMasFallos: PreguntaConFallos[];
  actividad: ActividadDia[];
}

// ============================================
// Banco de preguntas  (/api/docente/preguntas)
// ============================================

export type Letra = 'A' | 'B' | 'C' | 'D';
export const LETRAS: Letra[] = ['A', 'B', 'C', 'D'];

export interface OpcionDocente {
  id?: number;
  letra: Letra;
  texto: string;
  esCorrecta: boolean;
}

export interface PreguntaDocente {
  id: number;
  tema: TemaForo;
  enunciado: string;
  dificultad: Dificultad;
  pista: string | null;
  activa: boolean;
  intentos: number;
  porcentajeAcierto: number;
  fechaActualizacion: string;
  opciones: OpcionDocente[];
}

export interface PreguntaDocenteRequest {
  tema: TemaForo;
  enunciado: string;
  dificultad: Dificultad;
  pista: string | null;
  opciones: OpcionDocente[];
}

export type EstadoFiltro = 'todas' | 'activas' | 'inactivas';

// ============================================
// Moderación  (GET /api/docente/moderacion)
// ============================================

export interface ContenidoOculto {
  tipo: 'PUBLICACION' | 'RESPUESTA';
  id: number;
  publicacionId: number;
  tituloPublicacion: string;
  contenido: string;
  autor: string;
  fechaCreacion: string;
  ocultadoPor: string | null;
  fechaOculta: string | null;
}
