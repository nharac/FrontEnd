import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import {
  LoginRequest,
  RegistroRequest,
  AuthResponse
} from '../models';
import { TokenService } from '../../../core/services/token.service';
import { AuthMockData } from './mocks/auth-mock.data';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private tokenService: TokenService) {}


  login(request: LoginRequest): Observable<AuthResponse> {
    // ============ MOCK ============
    if (request.correo === AuthMockData.CORREOS_ERROR.login) {
      return throwError(() => AuthMockData.ERRORES.credencialesInvalidas)
        .pipe(delay(AuthMockData.DELAY_MS));
    }

    const response = AuthMockData.loginExitoso(request.correo);
    // ==============================

    return of(response).pipe(
      delay(AuthMockData.DELAY_MS),
      tap(res => this.tokenService.guardar(res.token))
    );
  }

  
  registro(request: RegistroRequest): Observable<AuthResponse> {
    // ============ MOCK ============
    if (request.correo === AuthMockData.CORREOS_ERROR.registro) {
      return throwError(() => AuthMockData.ERRORES.correoDuplicado)
        .pipe(delay(AuthMockData.DELAY_MS));
    }

    const response = AuthMockData.registroExitoso(
      request.nombre,
      request.correo
    );
    // ==============================

    return of(response).pipe(
      delay(AuthMockData.DELAY_MS),
      tap(res => this.tokenService.guardar(res.token))
    );
  }

  /** Cierra la sesión del usuario. */
  logout(): void {
    this.tokenService.eliminar();
  }
}