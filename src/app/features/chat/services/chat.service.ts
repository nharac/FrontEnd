import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { EnviarMensajeRequest, HistorialChat, RespuestaChat } from '../models/chat.model';

/**
 * Servicio del chat con el tutor IA (Gemini).
 * Todos los endpoints requieren JWT (lo agrega el jwtInterceptor).
 */
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly API = `${environment.apiUrl}/chat`;

  private http = inject(HttpClient);

  /**
   * Envía un mensaje al tutor IA.
   * Si preguntaId es null/undefined es chat libre; si tiene valor, chat contextual.
   * POST /api/chat/mensaje
   */
  enviarMensaje(request: EnviarMensajeRequest): Observable<RespuestaChat> {
    return this.http.post<RespuestaChat>(`${this.API}/mensaje`, request);
  }

  /**
   * Historial del chat libre (en orden cronológico).
   * GET /api/chat/historial
   */
  historialLibre(): Observable<HistorialChat> {
    return this.http.get<HistorialChat>(`${this.API}/historial`);
  }

  /**
   * Historial del chat contextual de una pregunta.
   * GET /api/chat/historial/pregunta/{preguntaId}
   */
  historialPorPregunta(preguntaId: number): Observable<HistorialChat> {
    return this.http.get<HistorialChat>(`${this.API}/historial/pregunta/${preguntaId}`);
  }

  /**
   * Borra el historial del chat libre.
   * DELETE /api/chat/historial
   */
  limpiarHistorialLibre(): Observable<void> {
    return this.http.delete<void>(`${this.API}/historial`);
  }
}
