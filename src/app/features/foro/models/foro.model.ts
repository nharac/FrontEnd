/**
 * Modelos del foro.
 * Reflejan los DTOs del backend (paquete foro.application.dto).
 * Los usan el módulo docente y el módulo foro.
 */

export type TemaForo = 'limites' | 'derivadas' | 'integrales';

/** Autor de una publicación o respuesta (AutorResponse). */
export interface Autor {
  id: number;
  nombre: string;
  /** Ej: "CP" para Carlos Pérez. */
  iniciales: string;
  rol: 'ESTUDIANTE' | 'DOCENTE' | string;
}

/** Publicación en listados (PublicacionResumenResponse). */
export interface PublicacionResumen {
  id: number;
  titulo: string;
  /** Primeros 150 caracteres del contenido. */
  contenidoPreview: string;
  tema: TemaForo;
  autor: Autor;
  fechaCreacion: string;
  respuestasCount: number;
}

/** Respuesta con sus respuestas hijas (RespuestaResponse). */
export interface Respuesta {
  id: number;
  autor: Autor;
  contenido: string;
  esOficial: boolean;
  fechaCreacion: string;
  /** Lista vacía si no tiene hijas. */
  respuestasHijas: Respuesta[];
}

/** Publicación completa con su árbol de respuestas (PublicacionDetalleResponse). */
export interface PublicacionDetalle {
  id: number;
  titulo: string;
  contenido: string;
  tema: TemaForo;
  autor: Autor;
  fechaCreacion: string;
  respuestas: Respuesta[];
}

/** Cuerpo de POST /api/foro/publicaciones/{id}/respuestas. */
export interface ResponderRequest {
  contenido: string;
  /** null = respuesta directa a la publicación. */
  respuestaPadreId?: number | null;
}

export const NOMBRES_TEMA: Record<string, string> = {
  limites: 'Límites',
  derivadas: 'Derivadas',
  integrales: 'Integrales',
};

/** Cuerpo de POST /api/foro/publicaciones (CrearPublicacionRequest). */
export interface CrearPublicacionRequest {
  /** Máximo 255 caracteres. */
  titulo: string;
  contenido: string;
  tema: TemaForo;
}

/** Orden del listado que acepta el backend. */
export type OrdenForo = 'reciente' | 'antiguo' | 'respuestas';
