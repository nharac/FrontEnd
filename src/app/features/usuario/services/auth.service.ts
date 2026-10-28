import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import {
  LoginRequest,
  RegistroRequest,
  AuthResponse,
  RegistroResponse
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
   * Registra un nuevo estudiante. La cuenta queda pendiente: llega un código de 6 dígitos al correo
   * y la sesión se abre al verificarlo (doble verificación).
   * POST /api/auth/registro
   */
  registro(request: RegistroRequest): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(`${this.API}/registro`, request);
  }

  /**
   * Activa la cuenta con el código del correo y abre la sesión (igual que el login).
   * POST /api/auth/verificar-correo
   */
  verificarCorreo(correo: string, codigo: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/verificar-correo`, { correo, codigo })
      .pipe(
        tap(res => {
          this.tokenService.guardar(res.token);
          this.tokenService.guardarRol(res.usuario.rol);
        })
      );
  }

  /**
   * Pide otro código de verificación (máximo uno por minuto; responde igual exista o no la cuenta).
   * POST /api/auth/reenviar-verificacion
   */
  reenviarVerificacion(correo: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.API}/reenviar-verificacion`, { correo });
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
   * Paso 2: comprueba el código sin gastarlo (un código malo cuenta como intento).
   * POST /api/auth/recuperar/validar
   */
  validarCodigoRecuperacion(correo: string, codigo: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.API}/recuperar/validar`, { correo, codigo });
  }

  /**
   * Paso 3: cambia la contraseña con el código ya validado (el backend lo vuelve a comprobar).
   * POST /api/auth/restablecer
   */
  restablecerPassword(datos: { correo: string; codigo: string; passwordNueva: string }): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.API}/restablecer`, datos);
  }
}
