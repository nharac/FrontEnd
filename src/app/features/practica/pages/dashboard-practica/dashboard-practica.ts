import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PracticaService } from '../../services/practica.service';
import { PreguntaCard } from '../../components/pregunta-card/pregunta-card';
import { Confeti } from '../../../../shared/components/confeti/confeti';
import { ContadorDirective } from '../../../../shared/directives/contador.directive';
import {
  DIFICULTADES,
  Dificultad,
  InfoTema,
  Pregunta,
  Progreso,
  ProgresoTema,
  TEMAS,
  Tema
} from '../../models/practica.model';

type Vista = 'seleccion' | 'cargando' | 'sesion' | 'resumen';

/** Cantidad de preguntas por sesión de práctica. */
const PREGUNTAS_POR_SESION = 10;

/**
 * Página /practica.
 * 1. El estudiante elige tema (y opcionalmente dificultad) y ve su progreso.
 * 2. Responde las preguntas una por una (PreguntaCard).
 * 3. Al final ve un resumen de la sesión.
 */
@Component({
  imports: [DecimalPipe, MatIconModule, MatSnackBarModule, PreguntaCard, Confeti, ContadorDirective],
  selector: 'app-dashboard-practica',
  styleUrl: './dashboard-practica.scss',
  templateUrl: './dashboard-practica.html',
})
export class DashboardPractica implements OnInit {

  private practicaService = inject(PracticaService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);

  readonly temas = TEMAS;
  readonly dificultades = DIFICULTADES;

  vista = signal<Vista>('seleccion');
  progreso = signal<Progreso | null>(null);

  temaElegido = signal<Tema | null>(null);
  dificultadElegida = signal<Dificultad | null>(null);

  preguntas = signal<Pregunta[]>([]);
  indice = signal(0);
  aciertosPrimerIntento = signal(0);
  /** Puntos ganados en esta sesión (los da el backend al acertar). */
  puntosSesion = signal(0);
  sinPreguntas = signal(false);

  preguntaActual = computed(() => this.preguntas()[this.indice()] ?? null);
  infoTema = computed(() => this.temas.find(t => t.id === this.temaElegido()) ?? null);
  porcentajeSesion = computed(() => {
    const total = this.preguntas().length;
    return total ? Math.round((this.aciertosPrimerIntento() / total) * 100) : 0;
  });

  ngOnInit(): void {
    this.cargarProgreso();
    // Desde el inicio se puede llegar con un tema recomendado: /practica?tema=derivadas
    const tema = this.route.snapshot.queryParamMap.get('tema');
    if (this.temas.some(t => t.id === tema)) {
      this.elegirTema(tema as Tema);
    }
  }

  progresoDe(tema: InfoTema): ProgresoTema | null {
    return this.progreso()?.[tema.id] ?? null;
  }

  elegirTema(tema: Tema): void {
    this.temaElegido.set(tema);
    this.sinPreguntas.set(false);
  }

  elegirDificultad(dificultad: Dificultad | null): void {
    this.dificultadElegida.set(dificultad);
    this.sinPreguntas.set(false);
  }

  empezar(): void {
    const tema = this.temaElegido();
    if (!tema) {
      return;
    }

    this.vista.set('cargando');
    this.practicaService.listarPreguntas({
      tema,
      dificultad: this.dificultadElegida(),
      size: PREGUNTAS_POR_SESION
    }).subscribe({
      next: (preguntas) => {
        if (preguntas.length === 0) {
          this.sinPreguntas.set(true);
          this.vista.set('seleccion');
          return;
        }
        this.preguntas.set(preguntas);
        this.indice.set(0);
        this.aciertosPrimerIntento.set(0);
        this.puntosSesion.set(0);
        this.vista.set('sesion');
      },
      error: (err) => {
        this.vista.set('seleccion');
        this.snackBar.open(err?.message || 'No se pudieron cargar las preguntas', 'Cerrar', { duration: 3500 });
      }
    });
  }

  alAcertar(evento: { primerIntento: boolean; puntos: number }): void {
    this.puntosSesion.update(n => n + evento.puntos);
    if (evento.primerIntento) {
      this.aciertosPrimerIntento.update(n => n + 1);
    }
  }

  siguiente(): void {
    if (this.indice() < this.preguntas().length - 1) {
      this.indice.update(i => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.vista.set('resumen');
      this.cargarProgreso();
    }
  }

  volverASeleccion(): void {
    this.vista.set('seleccion');
    this.cargarProgreso();
  }

  private cargarProgreso(): void {
    this.practicaService.obtenerProgreso().subscribe({
      next: (p) => this.progreso.set(p),
      // El progreso es informativo: si falla, la práctica sigue funcionando
      error: () => this.progreso.set(null)
    });
  }
}
