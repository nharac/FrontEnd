import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * Guard que protege rutas que requieren autenticación.
 * Si no hay token, redirige a /auth.
 */
export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.hayToken()) {
    return true;
  }

  return router.createUrlTree(['/auth']);
};