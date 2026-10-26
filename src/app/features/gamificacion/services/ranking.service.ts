import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PosicionRanking } from '../models/ranking.model';

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
   * Top 10 de estudiantes con más puntos, ya ordenado.
   * GET /api/ranking
   */
  obtenerTop(): Observable<PosicionRanking[]> {
    return this.http.get<PosicionRanking[]>(this.API).pipe(
      tap(lista => {
        this.top.set(lista ?? []);
        this.cargado = true;
      })
    );
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
