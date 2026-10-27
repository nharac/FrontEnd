import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import {
  LoginRequest,
  RegistroRequest,
  AuthResponse
} from '../models';
import { TokenService } from '../../../core/services/token.service';

/**
 * Servicio de autenticación. Llama a los endpoints del backend.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API = `${environment.apiUrl}/auth`;

  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  /**
   * Inicia sesión.
   * POST /api/auth/login
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/login`, request)
      .pipe(
        tap(res => {
          this.tokenService.guardar(res.token);
          this.tokenService.guardarRol(res.usuario.rol);
        })
      );
  }

  /**
   * Registra un nuevo estudiante.
   * POST /api/auth/registro
   */
  registro(request: RegistroRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/registro`, request)
      .pipe(
        tap(res => {
          this.tokenService.guardar(res.token);
          this.tokenService.guardarRol(res.usuario.rol);
        })
      );
  }

  /** Cierra la sesión. */
  logout(): void {
    this.tokenService.eliminar();
  }

  /**
   * Paso 1 de "¿Olvidaste tu contraseña?": envía un código de 6 dígitos al correo.
   * POST /api/auth/recuperar  (responde igual exista o no la cuenta)
   */
  solicitarRecuperacion(correo: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.API}/recuperar`, { correo });
  }

  /**
   * Paso 2: cambia la contraseña con el código recibido.
   * POST /api/auth/restablecer
   */
  restablecerPassword(datos: { correo: string; codigo: string; passwordNueva: string }): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.API}/restablecer`, datos);
  }
}
