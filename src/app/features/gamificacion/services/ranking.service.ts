import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PosicionRanking } from '../models/ranking.model';

/** Gamificación: ranking de estudiantes por puntos. Requiere JWT. */
@Injectable({
  providedIn: 'root'
})
export class RankingService {

  private readonly API = `${environment.apiUrl}/ranking`;

  private http = inject(HttpClient);

  /**
   * Top 10 de estudiantes con más puntos, ya ordenado.
   * GET /api/ranking
   */
  obtenerTop(): Observable<PosicionRanking[]> {
    return this.http.get<PosicionRanking[]>(this.API);
  }
}
