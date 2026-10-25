import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Usuario } from '../../features/usuario/models/usuario.model';

/** Cuerpo de PUT /api/auth/perfil (ActualizarPerfilRequest). */
export interface ActualizarPerfilRequest {
  nombre: string;
  /** Solo si se cambia la contraseña. */
  passwordActual?: string;
  /** Omitir para no cambiar la contraseña (el backend rechaza cadenas vacías). */
  passwordNueva?: string;
}

/**
 * Perfil del usuario autenticado, compartido por toda la app
 * (barra de navegación, inicio y página de perfil).
 */
@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private readonly API = `${environment.apiUrl}/auth/perfil`;

  private http = inject(HttpClient);

  /** Usuario actual; null mientras no se ha cargado. */
  readonly usuario = signal<Usuario | null>(null);

  /** Primer nombre, para saludos ("Hola, Juan"). */
  readonly primerNombre = computed(() => this.usuario()?.nombre.trim().split(/\s+/)[0] ?? '');

  /** Iniciales para avatares ("JL" para Juan Lozano). */
  readonly iniciales = computed(() => {
    const partes = this.usuario()?.nombre.trim().split(/\s+/) ?? [];
    if (!partes.length) return '';
    return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  });

  /**
   * Carga el perfil una sola vez (si ya está cargado no vuelve a pedirlo).
   * GET /api/auth/perfil
   */
  cargar(forzar = false): void {
    if (this.usuario() && !forzar) {
      return;
    }
    this.http.get<Usuario>(this.API).subscribe({
      next: (u) => this.usuario.set(u),
      error: () => this.usuario.set(null)
    });
  }

  /**
   * Actualiza nombre y, opcionalmente, contraseña.
   * PUT /api/auth/perfil
   */
  actualizar(request: ActualizarPerfilRequest): Observable<Usuario> {
    return this.http.put<Usuario>(this.API, request).pipe(
      tap(u => this.usuario.set(u))
    );
  }

  /** Al cerrar sesión. */
  limpiar(): void {
    this.usuario.set(null);
  }
}
