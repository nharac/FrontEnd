import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [

  // ============================================
  // RUTAS PÚBLICAS (sin navbar)
  // ============================================
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/usuario/usuario.routes').then(m => m.USUARIO_ROUTES)
  },

  // ============================================
  // RUTAS CON NAVBAR (layout principal)
  // ============================================
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/practica/pages/dashboard-estudiante/dashboard-estudiante')
            .then(m => m.DashboardEstudiante)
      },
      {
        path: 'practica',
        loadComponent: () =>
          import('./features/practica/pages/dashboard-practica/dashboard-practica')
            .then(m => m.DashboardPractica)
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./features/chat/pages/chat-tutor/chat-tutor')
            .then(m => m.ChatTutor)
      },
      {
        path: 'foro',
        loadComponent: () =>
          import('./features/foro/pages/lista-publicaciones/lista-publicaciones')
            .then(m => m.ListaPublicaciones)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/usuario/pages/perfil/perfil')
            .then(m => m.Perfil)
      }
    ]
  },

  // ============================================
  // REDIRECCIONES
  // ============================================
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];