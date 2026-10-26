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
        path: 'foro/nueva',
        loadComponent: () =>
          import('./features/foro/pages/nueva-publicacion/nueva-publicacion')
            .then(m => m.NuevaPublicacion)
      },
      {
        path: 'foro/:id',
        loadComponent: () =>
          import('./features/foro/pages/ver-publicacion/ver-publicacion')
            .then(m => m.VerPublicacion)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/usuario/pages/perfil/perfil')
            .then(m => m.Perfil)
      },
      {
        path: 'ranking',
        loadComponent: () =>
          import('./features/gamificacion/pages/ranking/ranking')
            .then(m => m.Ranking)
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
      },
      {
        path: 'notificaciones',
        data: { modo: 'pendientes' },
        loadComponent: () =>
          import('./features/docente/pages/publicaciones-docente/publicaciones-docente')
            .then(m => m.PublicacionesDocente)
      },
      {
        path: 'foro',
        data: { modo: 'todas' },
        loadComponent: () =>
          import('./features/docente/pages/publicaciones-docente/publicaciones-docente')
            .then(m => m.PublicacionesDocente)
      },
      {
        path: 'publicaciones/:id',
        loadComponent: () =>
          import('./features/docente/pages/publicacion-detalle/publicacion-detalle')
            .then(m => m.PublicacionDetallePage)
      },
      {
        path: 'estadisticas',
        loadComponent: () =>
          import('./features/docente/pages/estadisticas-docente/estadisticas-docente')
            .then(m => m.EstadisticasDocente)
      },
      {
        path: 'estudiantes',
        loadComponent: () =>
          import('./features/docente/pages/estudiantes-docente/estudiantes-docente')
            .then(m => m.EstudiantesDocente)
      },
      {
        path: 'estudiantes/:id',
        loadComponent: () =>
          import('./features/docente/pages/estudiante-detalle/estudiante-detalle')
            .then(m => m.EstudianteDetallePage)
      },
      {
        path: 'preguntas',
        loadComponent: () =>
          import('./features/docente/pages/banco-preguntas/banco-preguntas')
            .then(m => m.BancoPreguntas)
      },
      {
        // "nueva" y ":id" usan el mismo formulario (crear / editar)
        path: 'preguntas/nueva',
        loadComponent: () =>
          import('./features/docente/pages/pregunta-form/pregunta-form')
            .then(m => m.PreguntaForm)
      },
      {
        path: 'preguntas/:id',
        loadComponent: () =>
          import('./features/docente/pages/pregunta-form/pregunta-form')
            .then(m => m.PreguntaForm)
      },
      {
        path: 'moderacion',
        loadComponent: () =>
          import('./features/docente/pages/moderacion-docente/moderacion-docente')
            .then(m => m.ModeracionDocente)
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