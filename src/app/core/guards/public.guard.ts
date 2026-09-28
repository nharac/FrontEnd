import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * Guard para rutas públicas (login/registro).
 * Si el usuario YA está logueado, lo redirige a su dashboard.
 * Si no, permite el acceso.
 */
export const publicGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!tokenService.hayToken()) {
    return true;
  }

  if (tokenService.esDocente()) {
    return router.createUrlTree(['/docente']);
  }
  return router.createUrlTree(['/dashboard']);
};