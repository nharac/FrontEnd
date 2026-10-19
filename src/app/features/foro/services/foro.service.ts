import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Usuario } from '../../usuario/models/usuario.model';
import {
  CrearPublicacionRequest,
  OrdenForo,
  PublicacionDetalle,
  PublicacionResumen,
  Respuesta,
  ResponderRequest
} from '../models/foro.model';

/**
 * Servicio del foro colaborativo.
 * Todos los endpoints requieren JWT (lo agrega el jwtInterceptor).
 */
@Injectable({
  providedIn: 'root'
})
export class ForoService {

  private readonly API = `${environment.apiUrl}/foro`;

  private http = inject(HttpClient);

  private perfil$?: Observable<Usuario>;

  /**
   * Usuario autenticado (para saber si es el autor de una publicación).
   * GET /api/auth/perfil
   */
  obtenerPerfil(): Observable<Usuario> {
    this.perfil$ ??= this.http.get<Usuario>(`${environment.apiUrl}/auth/perfil`).pipe(shareReplay(1));
    return this.perfil$;
  }

  /**
   * Lista publicaciones con filtros y paginación.
   * GET /api/foro/publicaciones?tema=&busqueda=&orden=&page=&size=
   */
  listar(filtros: {
    tema?: string | null;
    busqueda?: string | null;
    orden?: OrdenForo;
    page?: number;
    size?: number;
  } = {}): Observable<PublicacionResumen[]> {
    let params = new HttpParams()
      .set('orden', filtros.orden ?? 'reciente')
      .set('page', filtros.page ?? 0)
      .set('size', filtros.size ?? 10);

    if (filtros.tema) {
      params = params.set('tema', filtros.tema);
    }
    if (filtros.busqueda?.trim()) {
      params = params.set('busqueda', filtros.busqueda.trim());
    }

    return this.http.get<PublicacionResumen[]>(`${this.API}/publicaciones`, { params });
  }

  /**
   * Crea una publicación.
   * POST /api/foro/publicaciones
   */
  crear(request: CrearPublicacionRequest): Observable<PublicacionDetalle> {
    return this.http.post<PublicacionDetalle>(`${this.API}/publicaciones`, request);
  }

  /**
   * Publicación con su árbol de respuestas.
   * GET /api/foro/publicaciones/{id}
   */
  detalle(id: number): Observable<PublicacionDetalle> {
    return this.http.get<PublicacionDetalle>(`${this.API}/publicaciones/${id}`);
  }

  /**
   * Responde una publicación, o una respuesta directa si se envía respuestaPadreId
   * (el backend solo permite 1 nivel de anidamiento).
   * POST /api/foro/publicaciones/{id}/respuestas
   */
  responder(publicacionId: number, request: ResponderRequest): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.API}/publicaciones/${publicacionId}/respuestas`, request);
  }

  /**
   * Elimina una publicación (solo el autor o un docente).
   * DELETE /api/foro/publicaciones/{id}
   */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/publicaciones/${id}`);
  }
}
