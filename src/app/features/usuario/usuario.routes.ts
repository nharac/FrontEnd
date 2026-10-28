import { Routes } from '@angular/router';

export const USUARIO_ROUTES: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./pages/auth/auth').then(m => m.Auth)
  },
  {
    // "¿Olvidaste tu contraseña?" → /auth/recuperar
    path: 'recuperar',
    loadComponent: () =>
      import('./pages/recuperar-password/recuperar-password').then(m => m.RecuperarPassword)
  },
  {
    // Doble verificación al crear la cuenta → /auth/verificar?correo=...
    path: 'verificar',
    loadComponent: () =>
      import('./pages/verificar-correo/verificar-correo').then(m => m.VerificarCorreo)
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  }
];