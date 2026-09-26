import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/usuario/usuario.routes').then(m => m.USUARIO_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];