import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { environment } from '../../../../environments/environment';

/** GET /api/foro/publicaciones/{id}/utiles */
export interface UtilesPublicacion {
  conteos: Record<string, number>;
  mias: number[];
}

/** POST /api/foro/respuestas/{id}/util */
export interface UtilRespuesta {
  respuestaId: number;
  utiles: number;
  marcada: boolean;
}

/**
 * "Me sirvió" de las respuestas de la publicación abierta.
 * La página carga los datos y cada respuesta (app-respuesta-item, que es recursiva) los lee de aquí.
 */
@Injectable({ providedIn: 'root' })
export class UtilesService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/foro`;

  readonly conteos = signal<Record<number, number>>({});
  readonly mias = signal<Set<number>>(new Set());
  readonly procesando = signal<number | null>(null);

  cargar(publicacionId: number): void {
    this.conteos.set({});
    this.mias.set(new Set());
    this.http.get<UtilesPublicacion>(`${this.API}/publicaciones/${publicacionId}/utiles`).subscribe({
      next: (r) => {
        this.conteos.set(Object.fromEntries(Object.entries(r?.conteos ?? {}).map(([k, v]) => [Number(k), v])));
        this.mias.set(new Set(r?.mias ?? []));
      },
      error: () => { /* es complementario: sin datos, el botón queda en cero */ }
    });
  }

  alternar(respuestaId: number): void {
    if (this.procesando() !== null) return;
    this.procesando.set(respuestaId);
    this.http.post<UtilRespuesta>(`${this.API}/respuestas/${respuestaId}/util`, {}).subscribe({
      next: (r) => {
        this.procesando.set(null);
        this.conteos.update(c => ({ ...c, [respuestaId]: r.utiles }));
        this.mias.update(m => {
          const nuevo = new Set(m);
          if (r.marcada) nuevo.add(respuestaId); else nuevo.delete(respuestaId);
          return nuevo;
        });
      },
      error: () => this.procesando.set(null)
    });
  }
}
