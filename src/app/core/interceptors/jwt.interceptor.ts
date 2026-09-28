import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

/**
 * Interceptor que agrega el JWT a cada petición HTTP.
 * Si no hay token, no agrega nada.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService).obtener();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};