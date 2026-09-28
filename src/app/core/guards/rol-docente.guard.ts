import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * Guard que permite el acceso SOLO a usuarios con rol DOCENTE.
 * Si es estudiante, lo redirige a /dashboard.
 */
export const rolDocenteGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.esDocente()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};