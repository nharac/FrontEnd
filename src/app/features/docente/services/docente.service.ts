import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Usuario } from '../../usuario/models/usuario.model';
import {
  ContenidoOculto,
  EstadisticasGrupo,
  EstadoFiltro,
  EstudianteDetalle,
  EstudianteResumen,
  PreguntaDocente,
  PreguntaDocenteRequest
} from '../models/docente.model';
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

  /** Consultas sin respuesta oficial (contador de la navbar). null = todavía no se sabe. */
  readonly pendientes = signal<number | null>(null);

  /** Vuelve a contar las consultas pendientes (la navbar lo hace cada minuto y al navegar). */
  refrescarPendientes(): void {
    this.notificaciones().subscribe({
      next: (lista) => this.pendientes.set(lista.length),
      error: () => { /* sin conexión: se deja el último valor */ }
    });
  }

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
    this.pendientes.set(null);
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

  // ============================================
  // Estadísticas y estudiantes
  // ============================================

  /** GET /api/docente/estadisticas */
  estadisticas(): Observable<EstadisticasGrupo> {
    return this.http.get<EstadisticasGrupo>(`${this.API}/docente/estadisticas`);
  }

  /** GET /api/docente/estudiantes */
  estudiantes(): Observable<EstudianteResumen[]> {
    return this.http.get<EstudianteResumen[]>(`${this.API}/docente/estudiantes`);
  }

  /** GET /api/docente/estudiantes/{id} */
  estudiante(id: number): Observable<EstudianteDetalle> {
    return this.http.get<EstudianteDetalle>(`${this.API}/docente/estudiantes/${id}`);
  }

  /**
   * GET /api/docente/estudiantes/exportar
   * Se pide como Blob (y no con un enlace normal) porque necesita el JWT.
   */
  exportarEstudiantes(): Observable<Blob> {
    return this.http.get(`${this.API}/docente/estudiantes/exportar`, { responseType: 'blob' });
  }

  // ============================================
  // Banco de preguntas
  // ============================================

  /** GET /api/docente/preguntas */
  preguntas(filtros: { tema?: string | null; dificultad?: string | null; busqueda?: string | null; estado?: EstadoFiltro } = {}): Observable<PreguntaDocente[]> {
    let params = new HttpParams().set('estado', filtros.estado ?? 'todas');
    if (filtros.tema) params = params.set('tema', filtros.tema);
    if (filtros.dificultad) params = params.set('dificultad', filtros.dificultad);
    if (filtros.busqueda?.trim()) params = params.set('busqueda', filtros.busqueda.trim());
    return this.http.get<PreguntaDocente[]>(`${this.API}/docente/preguntas`, { params });
  }

  /** GET /api/docente/preguntas/{id} */
  pregunta(id: number): Observable<PreguntaDocente> {
    return this.http.get<PreguntaDocente>(`${this.API}/docente/preguntas/${id}`);
  }

  /** POST /api/docente/preguntas */
  crearPregunta(request: PreguntaDocenteRequest): Observable<PreguntaDocente> {
    return this.http.post<PreguntaDocente>(`${this.API}/docente/preguntas`, request);
  }

  /** PUT /api/docente/preguntas/{id} */
  actualizarPregunta(id: number, request: PreguntaDocenteRequest): Observable<PreguntaDocente> {
    return this.http.put<PreguntaDocente>(`${this.API}/docente/preguntas/${id}`, request);
  }

  /** PATCH /api/docente/preguntas/{id}/estado */
  cambiarEstadoPregunta(id: number, activa: boolean): Observable<PreguntaDocente> {
    return this.http.patch<PreguntaDocente>(`${this.API}/docente/preguntas/${id}/estado`, { activa });
  }

  // ============================================
  // Moderación del foro
  // ============================================

  /** GET /api/docente/moderacion */
  contenidoOculto(): Observable<ContenidoOculto[]> {
    return this.http.get<ContenidoOculto[]>(`${this.API}/docente/moderacion`);
  }

  /** POST /api/docente/respuestas/{id}/ocultar */
  ocultarRespuesta(id: number): Observable<void> {
    return this.http.post<void>(`${this.API}/docente/respuestas/${id}/ocultar`, {});
  }

  /** DELETE /api/docente/respuestas/{id}/ocultar */
  restaurarRespuesta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/docente/respuestas/${id}/ocultar`);
  }

  /** POST /api/docente/publicaciones/{id}/ocultar */
  ocultarPublicacion(id: number): Observable<void> {
    return this.http.post<void>(`${this.API}/docente/publicaciones/${id}/ocultar`, {});
  }

  /** DELETE /api/docente/publicaciones/{id}/ocultar */
  restaurarPublicacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/docente/publicaciones/${id}/ocultar`);
  }
}
