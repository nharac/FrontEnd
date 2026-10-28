import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  FinalizarQuizRequest,
  HistorialQuiz,
  IniciarQuizRequest,
  QuizIniciado,
  ResultadoQuiz
} from '../models/quiz.model';

/** Quiz cronometrado. Requiere JWT. */
@Injectable({
  providedIn: 'root'
})
export class QuizService {

  private readonly API = `${environment.apiUrl}/quiz`;

  private http = inject(HttpClient);

  /** POST /api/quiz/iniciar: elige las preguntas y arranca el tiempo. */
  iniciar(request: IniciarQuizRequest): Observable<QuizIniciado> {
    return this.http.post<QuizIniciado>(`${this.API}/iniciar`, request);
  }

  /** POST /api/quiz/{id}/finalizar: califica (solo se puede una vez). */
  finalizar(intentoId: number, request: FinalizarQuizRequest): Observable<ResultadoQuiz> {
    return this.http.post<ResultadoQuiz>(`${this.API}/${intentoId}/finalizar`, request);
  }

  /** GET /api/quiz/{id}: revisión de un quiz ya entregado. */
  resultado(intentoId: number): Observable<ResultadoQuiz> {
    return this.http.get<ResultadoQuiz>(`${this.API}/${intentoId}`);
  }

  /** GET /api/quiz/historial: promedio, mejor y últimos 10. */
  historial(): Observable<HistorialQuiz> {
    return this.http.get<HistorialQuiz>(`${this.API}/historial`);
  }
}
