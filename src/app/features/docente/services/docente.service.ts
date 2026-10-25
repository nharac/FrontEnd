import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Usuario } from '../../usuario/models/usuario.model';
import {
  PublicacionDetalle,
  PublicacionResumen,
  Respuesta,
  ResponderRequest
} from '../../foro/models/foro.model';

/**
 * Servicio del módulo docente.
 * Los endpoints /api/docente/** solo los puede usar un usuario con rol DOCENTE
 * (@PreAuthorize en DocenteController). El JWT lo agrega el jwtInterceptor.
 */
@Injectable({
  providedIn: 'root'
})
export class DocenteService {

  private readonly API = environment.apiUrl;

  private http = inject(HttpClient);

  /** Se cachea para que navbar e inicio no pidan el perfil dos veces. */
  private perfil$?: Observable<Usuario>;

  /**
   * Perfil del usuario autenticado (para mostrar su nombre).
   * GET /api/auth/perfil
   */
  obtenerPerfil(): Observable<Usuario> {
    this.perfil$ ??= this.http.get<Usuario>(`${this.API}/auth/perfil`).pipe(shareReplay(1));
    return this.perfil$;
  }

  /** Limpia el perfil cacheado (al cerrar sesión). */
  limpiarCache(): void {
    this.perfil$ = undefined;
  }

  /**
   * Publicaciones que aún no tienen respuesta oficial.
   * GET /api/docente/notificaciones
   */
  notificaciones(): Observable<PublicacionResumen[]> {
    return this.http.get<PublicacionResumen[]>(`${this.API}/docente/notificaciones`);
  }

  /**
   * Todas las publicaciones del foro.
   * GET /api/foro/publicaciones
   */
  listarPublicaciones(filtros: { tema?: string | null; page?: number; size?: number } = {}): Observable<PublicacionResumen[]> {
    let params = new HttpParams()
      .set('orden', 'reciente')
      .set('page', filtros.page ?? 0)
      .set('size', filtros.size ?? 50);
    if (filtros.tema) {
      params = params.set('tema', filtros.tema);
    }
    return this.http.get<PublicacionResumen[]>(`${this.API}/foro/publicaciones`, { params });
  }

  /**
   * Publicación con su árbol de respuestas.
   * GET /api/foro/publicaciones/{id}
   */
  detallePublicacion(id: number): Observable<PublicacionDetalle> {
    return this.http.get<PublicacionDetalle>(`${this.API}/foro/publicaciones/${id}`);
  }

  /**
   * Responde una publicación (o una respuesta, si se envía respuestaPadreId).
   * POST /api/foro/publicaciones/{id}/respuestas
   */
  responder(publicacionId: number, request: ResponderRequest): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.API}/foro/publicaciones/${publicacionId}/respuestas`, request);
  }

  /**
   * Marca una respuesta como oficial. El backend deja solo una oficial por publicación.
   * POST /api/docente/respuestas/{id}/oficial
   */
  marcarOficial(respuestaId: number): Observable<void> {
    return this.http.post<void>(`${this.API}/docente/respuestas/${respuestaId}/oficial`, {});
  }

  /**
   * Quita el estado oficial de una respuesta.
   * DELETE /api/docente/respuestas/{id}/oficial
   */
  quitarOficial(respuestaId: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/docente/respuestas/${respuestaId}/oficial`);
  }
}
