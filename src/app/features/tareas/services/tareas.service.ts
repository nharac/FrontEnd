import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { TareaDocente, TareaEstudiante, TareaRequest } from '../models/tarea.model';

@Injectable({ providedIn: 'root' })
export class TareasService {
  private readonly API = environment.apiUrl;
  private http = inject(HttpClient);

  /** GET /api/tareas: las tareas del estudiante con su avance. */
  misTareas(): Observable<TareaEstudiante[]> {
    return this.http.get<TareaEstudiante[]>(`${this.API}/tareas`);
  }

  /** GET /api/docente/tareas */
  delDocente(): Observable<TareaDocente[]> {
    return this.http.get<TareaDocente[]>(`${this.API}/docente/tareas`);
  }

  /** POST /api/docente/tareas */
  crear(tarea: TareaRequest): Observable<TareaDocente> {
    return this.http.post<TareaDocente>(`${this.API}/docente/tareas`, tarea);
  }

  /** DELETE /api/docente/tareas/{id} */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/docente/tareas/${id}`);
  }
}
