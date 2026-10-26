import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Logro } from '../models/logro.model';

/** Logros del estudiante. Requiere JWT. */
@Injectable({
  providedIn: 'root'
})
export class LogrosService {

  private readonly API = `${environment.apiUrl}/logros`;

  private http = inject(HttpClient);

  /**
   * Los 11 logros con su estado. El backend evalúa antes si se desbloqueó alguno.
   * GET /api/logros
   */
  listar(): Observable<Logro[]> {
    return this.http.get<Logro[]>(this.API);
  }
}
