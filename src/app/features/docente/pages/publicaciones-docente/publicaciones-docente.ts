import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DocenteService } from '../../services/docente.service';
import { NOMBRES_TEMA, PublicacionResumen } from '../../../foro/models/foro.model';
import { diasDesde, haceCuanto } from '../../../../shared/utils/tiempo';

type Modo = 'pendientes' | 'todas';
type Estado = 'sin-respuestas' | 'sin-oficial' | 'oficial';

/**
 * Lista de publicaciones para el docente. La misma página sirve dos rutas:
 * - /docente/notificaciones → solo las que no tienen respuesta oficial,
 *   de la más antigua a la más reciente (las que más llevan esperando primero).
 * - /docente/foro → todas las publicaciones, con su estado.
 */
@Component({
  selector: 'app-publicaciones-docente',
  imports: [MatIconModule],
  templateUrl: './publicaciones-docente.html',
  styleUrl: './publicaciones-docente.scss',
})
export class PublicacionesDocente implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private docenteService = inject(DocenteService);
  private snackBar = inject(MatSnackBar);

  modo = signal<Modo>('pendientes');
  publicaciones = signal<PublicacionResumen[]>([]);
  /** Ids de publicaciones sin respuesta oficial. */
  pendientes = signal<Set<number>>(new Set());
  cargando = signal(true);
  tema = signal<string | null>(null);

  readonly temas = [
    { id: null, nombre: 'Todos' },
    { id: 'limites', nombre: 'Límites' },
    { id: 'derivadas', nombre: 'Derivadas' },
    { id: 'integrales', nombre: 'Integrales' },
  ];
  readonly nombresTema = NOMBRES_TEMA;
  readonly haceCuanto = haceCuanto;
  readonly diasDesde = diasDesde;

  filtradas = computed(() => {
    const t = this.tema();
    return t ? this.publicaciones().filter(p => p.tema === t) : this.publicaciones();
  });

  ngOnInit(): void {
    this.modo.set(this.route.snapshot.data['modo'] === 'todas' ? 'todas' : 'pendientes');
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);

    if (this.modo() === 'pendientes') {
      this.docenteService.notificaciones().subscribe({
        next: (lista) => {
          // Más antiguas primero: son las que más llevan esperando respuesta
          const ordenadas = [...lista].sort(
            (a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
          );
          this.publicaciones.set(ordenadas);
          this.pendientes.set(new Set(lista.map(p => p.id)));
          this.cargando.set(false);
        },
        error: (err) => this.fallo(err)
      });
    } else {
      forkJoin({
        todas: this.docenteService.listarPublicaciones(),
        sinOficial: this.docenteService.notificaciones()
      }).subscribe({
        next: ({ todas, sinOficial }) => {
          this.publicaciones.set(todas);
          this.pendientes.set(new Set(sinOficial.map(p => p.id)));
          this.cargando.set(false);
        },
        error: (err) => this.fallo(err)
      });
    }
  }

  estado(p: PublicacionResumen): Estado {
    if (!this.pendientes().has(p.id)) return 'oficial';
    return p.respuestasCount === 0 ? 'sin-respuestas' : 'sin-oficial';
  }

  abrir(p: PublicacionResumen): void {
    this.router.navigate(['/docente/publicaciones', p.id]);
  }

  private fallo(err: { status?: number; message?: string }): void {
    this.cargando.set(false);
    this.snackBar.open(
      err?.status === 403 ? 'Esta sección es solo para docentes' : err?.message || 'No se pudieron cargar las publicaciones',
      'Cerrar',
      { duration: 3500 }
    );
  }
}
