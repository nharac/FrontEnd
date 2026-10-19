import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Dificultad, Pista, Pregunta, Progreso, Tema, Validacion } from '../models/practica.model';

/**
 * Servicio del módulo de práctica.
 * Todos los endpoints requieren JWT (lo agrega el jwtInterceptor).
 */
@Injectable({
  providedIn: 'root'
})
export class PracticaService {

  private readonly API = `${environment.apiUrl}/practica`;

  private http = inject(HttpClient);

  /**
   * Lista preguntas con filtros opcionales.
   * GET /api/practica/preguntas?tema=&dificultad=&page=&size=
   */
  listarPreguntas(filtros: {
    tema?: Tema | null;
    dificultad?: Dificultad | null;
    page?: number;
    size?: number;
  } = {}): Observable<Pregunta[]> {
    let params = new HttpParams()
      .set('page', filtros.page ?? 0)
      .set('size', filtros.size ?? 10);

    if (filtros.tema) {
      params = params.set('tema', filtros.tema);
    }
    if (filtros.dificultad) {
      params = params.set('dificultad', filtros.dificultad);
    }

    return this.http.get<Pregunta[]>(`${this.API}/preguntas`, { params });
  }

  /**
   * Valida la opción elegida.
   * POST /api/practica/preguntas/{id}/responder
   */
  responder(preguntaId: number, opcionId: number): Observable<Validacion> {
    return this.http.post<Validacion>(`${this.API}/preguntas/${preguntaId}/responder`, { opcionId });
  }

  /**
   * Pista de la pregunta (sin revelar la respuesta).
   * GET /api/practica/preguntas/{id}/pista
   */
  obtenerPista(preguntaId: number): Observable<Pista> {
    return this.http.get<Pista>(`${this.API}/preguntas/${preguntaId}/pista`);
  }

  /**
   * Progreso del estudiante por tema.
   * GET /api/practica/progreso
   */
  obtenerProgreso(): Observable<Progreso> {
    return this.http.get<Progreso>(`${this.API}/progreso`);
  }
}
