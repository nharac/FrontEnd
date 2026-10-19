/**
 * Modelos del módulo Chat IA.
 * Reflejan los DTOs del backend (paquete practica.application.dto).
 */

/** Quién escribió el mensaje. */
export type RolEmisor = 'usuario' | 'ia';

/** Un mensaje del chat (ChatMensajeResponse). */
export interface ChatMensaje {
  id: number;
  rolEmisor: RolEmisor;
  mensaje: string;
  /** null en el chat libre; id de la pregunta en el chat contextual. */
  preguntaId: number | null;
  fechaHora: string;
}

/** Cuerpo de POST /api/chat/mensaje (EnviarMensajeRequest). */
export interface EnviarMensajeRequest {
  mensaje: string;
  /** Omitir o null para chat libre. */
  preguntaId?: number | null;
}

/** Respuesta de POST /api/chat/mensaje (RespuestaChatResponse). */
export interface RespuestaChat {
  mensajeUsuario: ChatMensaje;
  respuestaIa: ChatMensaje;
  mensajesRestantesHoy: number;
}

/** Respuesta de GET /api/chat/historial y /historial/pregunta/{id}. */
export interface HistorialChat {
  preguntaId: number | null;
  mensajes: ChatMensaje[];
}
