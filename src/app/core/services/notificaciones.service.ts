import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string | null;
  enlace: string | null;
  leida: boolean;
  creadaEn: string;
}

export interface Bandeja {
  noLeidas: number;
  notificaciones: Notificacion[];
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly API = `${environment.apiUrl}/notificaciones`;
  private http = inject(HttpClient);

  /** Número para el globito de la campanita. */
  readonly noLeidas = signal(0);

  contar(): Observable<{ noLeidas: number }> {
    return this.http.get<{ noLeidas: number }>(`${this.API}/no-leidas`).pipe(tap(r => this.noLeidas.set(r.noLeidas)));
  }

  bandeja(): Observable<Bandeja> {
    return this.http.get<Bandeja>(this.API).pipe(tap(b => this.noLeidas.set(b.noLeidas)));
  }

  marcarLeida(id: number): Observable<void> {
    this.noLeidas.update(n => Math.max(0, n - 1));
    return this.http.patch<void>(`${this.API}/${id}/leida`, {});
  }

  marcarTodas(): Observable<{ marcadas: number }> {
    this.noLeidas.set(0);
    return this.http.post<{ marcadas: number }>(`${this.API}/leer-todas`, {});
  }
}
