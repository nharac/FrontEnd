import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MiPosicion, PeriodoRanking, PosicionRanking } from '../models/ranking.model';

/** Gamificación: ranking de estudiantes por puntos. Requiere JWT. */
@Injectable({
  providedIn: 'root'
})
export class RankingService {

  private readonly API = `${environment.apiUrl}/ranking`;

  private http = inject(HttpClient);

  /** Último top 10 recibido (lo comparten la barra, el perfil y el inicio). */
  readonly top = signal<PosicionRanking[]>([]);
  private cargado = false;

  /**
   * Top 10 de estudiantes con más puntos en el periodo, ya ordenado.
   * GET /api/ranking?periodo=total|semana|mes
   * Solo el histórico actualiza `top` (de ahí salen las medallas de la barra y el perfil).
   */
  obtenerTop(periodo: PeriodoRanking = 'total'): Observable<PosicionRanking[]> {
    return this.http.get<PosicionRanking[]>(this.API, { params: { periodo } }).pipe(
      tap(lista => {
        if (periodo === 'total') {
          this.top.set(lista ?? []);
          this.cargado = true;
        }
      })
    );
  }

  /**
   * Posición del estudiante actual aunque no esté en el top 10.
   * GET /api/ranking/yo?periodo=
   */
  miPosicion(periodo: PeriodoRanking = 'total'): Observable<MiPosicion> {
    return this.http.get<MiPosicion>(`${this.API}/yo`, { params: { periodo } });
  }

  /** Carga el top una sola vez (para mostrar medallas sin repetir la petición). */
  cargarTop(): void {
    if (this.cargado) return;
    this.cargado = true;
    this.obtenerTop().subscribe({ error: () => (this.cargado = false) });
  }

  /** Puesto (1–10) de un usuario en el top, o null si no está. */
  lugarDe(usuarioId: number | null | undefined): number | null {
    if (usuarioId == null) return null;
    const i = this.top().findIndex(p => p.usuarioId === usuarioId);
    return i >= 0 ? i + 1 : null;
  }
}
