import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { DocenteLayout } from './layout/docente-layout/docente-layout';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { rolDocenteGuard } from './core/guards/rol-docente.guard';

export const routes: Routes = [

  // ============================================
  // RUTAS PÚBLICAS (sin navbar, sin login)
  // ============================================
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () =>
      import('./features/usuario/usuario.routes').then(m => m.USUARIO_ROUTES)
  },

  // ============================================
  // RUTAS DE ESTUDIANTE (con navbar del estudiante)
  // ============================================
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
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
  // RUTAS DE DOCENTE (con navbar del docente)
  // ============================================
  {
    path: 'docente',
    component: DocenteLayout,
    canActivate: [authGuard, rolDocenteGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/docente/pages/dashboard-docente/dashboard-docente')
            .then(m => m.DashboardDocente)
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