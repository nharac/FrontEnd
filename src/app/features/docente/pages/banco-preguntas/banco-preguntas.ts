import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DocenteService } from '../../services/docente.service';
import { EstadoFiltro, NOMBRES_DIFICULTAD, PreguntaDocente } from '../../models/docente.model';
import { NOMBRES_TEMA } from '../../../foro/models/foro.model';
import { colorPorcentaje } from '../../utils/colores';

/**
 * /docente/preguntas
 * Banco de preguntas de práctica. El docente crea, edita y activa o desactiva preguntas.
 * Desactivar (en vez de borrar) conserva los intentos y el progreso de los estudiantes.
 */
@Component({
  selector: 'app-banco-preguntas',
  imports: [RouterLink, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './banco-preguntas.html',
  styleUrl: './banco-preguntas.scss',
})
export class BancoPreguntas implements OnInit {

  private docenteService = inject(DocenteService);
  private snackBar = inject(MatSnackBar);

  preguntas = signal<PreguntaDocente[]>([]);
  cargando = signal(true);
  error = signal(false);
  procesandoId = signal<number | null>(null);
  abiertaId = signal<number | null>(null);

  tema = signal('');
  dificultad = signal('');
  busqueda = signal('');
  estado = signal<EstadoFiltro>('todas');

  readonly nombresTema = NOMBRES_TEMA;
  readonly nombresDificultad = NOMBRES_DIFICULTAD;
  readonly color = colorPorcentaje;

  activas = computed(() => this.preguntas().filter(p => p.activa).length);

  private buscar$ = new Subject<void>();

  constructor() {
    this.buscar$.pipe(debounceTime(300), takeUntilDestroyed()).subscribe(() => this.cargar());
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.docenteService.preguntas({
      tema: this.tema() || null,
      dificultad: this.dificultad() || null,
      busqueda: this.busqueda() || null,
      estado: this.estado()
    }).subscribe({
      next: (lista) => {
        this.preguntas.set(lista);
        this.cargando.set(false);
        this.error.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      }
    });
  }

  buscarConPausa(texto: string): void {
    this.busqueda.set(texto);
    this.buscar$.next();
  }

  cambiarEstadoFiltro(e: EstadoFiltro): void {
    this.estado.set(e);
    this.cargar();
  }

  alternarDetalle(id: number): void {
    this.abiertaId.update(actual => actual === id ? null : id);
  }

  alternarActiva(p: PreguntaDocente, evento: Event): void {
    evento.stopPropagation();
    this.procesandoId.set(p.id);
    this.docenteService.cambiarEstadoPregunta(p.id, !p.activa).subscribe({
      next: (actualizada) => {
        this.procesandoId.set(null);
        const filtroOculta = (this.estado() === 'activas' && !actualizada.activa)
          || (this.estado() === 'inactivas' && actualizada.activa);
        this.preguntas.update(lista => filtroOculta
          ? lista.filter(x => x.id !== p.id)
          : lista.map(x => x.id === p.id ? actualizada : x));
        const ref = this.snackBar.open(
          actualizada.activa ? 'Pregunta activada: ya aparece en la práctica' : 'Pregunta desactivada: ya no aparece en la práctica',
          'Deshacer', { duration: 5000 });
        ref.onAction().subscribe(() => this.alternarActiva(actualizada, new Event('deshacer')));
      },
      error: (err) => {
        this.procesandoId.set(null);
        this.snackBar.open(err?.message || 'No se pudo cambiar el estado', 'Cerrar', { duration: 3500 });
      }
    });
  }
}
