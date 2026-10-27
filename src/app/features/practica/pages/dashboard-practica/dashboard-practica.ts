import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PracticaService } from '../../services/practica.service';
import { PreguntaCard } from '../../components/pregunta-card/pregunta-card';
import { Confeti } from '../../../../shared/components/confeti/confeti';
import { ContadorDirective } from '../../../../shared/directives/contador.directive';
import { LogroAviso } from '../../../gamificacion/components/logro-aviso/logro-aviso';
import { Logro } from '../../../gamificacion/models/logro.model';
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

/** Cómo terminó cada pregunta de la sesión: al primer intento, después de fallar, o aún sin resolver. */
export type ResultadoPregunta = 'primer' | 'reintento' | null;

/** Cantidad de preguntas por sesión de práctica. */
const PREGUNTAS_POR_SESION = 10;

/**
 * Página /practica.
 * 1. El estudiante elige tema (y opcionalmente dificultad) y ve su progreso.
 * 2. Responde las preguntas una por una (PreguntaCard).
 * 3. Al final ve un resumen de la sesión.
 */
@Component({
  imports: [DecimalPipe, RouterLink, MatIconModule, PreguntaCard, Confeti, ContadorDirective, LogroAviso],
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
  readonly descripcionDificultad: Record<string, string> = {
    todas: 'Mezcla de niveles, como en el examen',
    basico: 'Para calentar y repasar lo esencial',
    intermedio: 'Ejercicios tipo ICFES',
    avanzado: 'Retos para subir de nivel'
  };
  /** Perímetro del anillo de progreso (r = 26). */
  readonly perimetro = 2 * Math.PI * 26;

  vista = signal<Vista>('seleccion');
  progreso = signal<Progreso | null>(null);

  temaElegido = signal<Tema | null>(null);
  dificultadElegida = signal<Dificultad | null>(null);

  preguntas = signal<Pregunta[]>([]);
  indice = signal(0);
  aciertosPrimerIntento = signal(0);
  /** Puntos ganados en esta sesión (los da el backend al acertar). */
  puntosSesion = signal(0);
  /** Logros recién desbloqueados (se muestran como aviso flotante). */
  logrosNuevos = signal<Logro[]>([]);
  sinPreguntas = signal(false);
  /** Resultado de cada pregunta de la sesión (puntos de colores de la barra superior). */
  resultados = signal<ResultadoPregunta[]>([]);

  preguntaActual = computed(() => this.preguntas()[this.indice()] ?? null);
  infoTema = computed(() => this.temas.find(t => t.id === this.temaElegido()) ?? null);
  reintentos = computed(() => this.resultados().filter(r => r === 'reintento').length);

  /** Tema sugerido: el que nunca ha practicado o el de menor porcentaje de aciertos. */
  recomendado = computed<Tema | null>(() => {
    const p = this.progreso();
    if (!p) {
      return null;
    }
    const orden = [...this.temas].sort((a, b) =>
      (p[a.id].respondidas === 0 ? -1 : p[a.id].porcentaje) - (p[b.id].respondidas === 0 ? -1 : p[b.id].porcentaje));
    const primero = orden[0];
    // Si ya domina todos los temas no hay nada que recomendar
    return primero && (p[primero.id].respondidas === 0 || p[primero.id].porcentaje < 100) ? primero.id : null;
  });

  /** Totales de todos los temas para la cabecera. */
  totalGeneral = computed(() => {
    const p = this.progreso();
    if (!p) {
      return null;
    }
    const respondidas = this.temas.reduce((n, t) => n + p[t.id].respondidas, 0);
    const correctas = this.temas.reduce((n, t) => n + p[t.id].correctas, 0);
    return { respondidas, correctas, porcentaje: respondidas ? Math.round((correctas / respondidas) * 100) : 0 };
  });

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

  /** Trazo del anillo para un porcentaje (stroke-dashoffset). */
  trazo(porcentaje: number): number {
    return this.perimetro * (1 - Math.min(Math.max(porcentaje, 0), 100) / 100);
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
        this.resultados.set(preguntas.map(() => null));
        this.vista.set('sesion');
      },
      error: (err) => {
        this.vista.set('seleccion');
        this.snackBar.open(err?.message || 'No se pudieron cargar las preguntas', 'Cerrar', { duration: 3500 });
      }
    });
  }

  alAcertar(evento: { primerIntento: boolean; puntos: number; logros: Logro[] }): void {
    this.puntosSesion.update(n => n + evento.puntos);
    if (evento.logros.length) {
      this.logrosNuevos.set(evento.logros);
    }
    if (evento.primerIntento) {
      this.aciertosPrimerIntento.update(n => n + 1);
    }
    const i = this.indice();
    this.resultados.update(lista => lista.map((r, j) => j === i ? (evento.primerIntento ? 'primer' : 'reintento') : r));
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
