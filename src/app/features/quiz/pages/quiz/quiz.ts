import { Component, HostListener, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { QuizService } from '../../services/quiz.service';
import {
  CANTIDADES,
  DetalleQuiz,
  HistorialQuiz,
  OPCIONES_TEMA,
  QuizIniciado,
  ResultadoQuiz,
  SEGUNDOS_POR_PREGUNTA,
  TemaQuiz,
  duracion,
  nombreTemaQuiz,
  reloj,
  veredicto
} from '../../models/quiz.model';
import { Confeti } from '../../../../shared/components/confeti/confeti';
import { haceCuanto } from '../../../../shared/utils/tiempo';

type Etapa = 'inicio' | 'en-curso' | 'resultado';

/** Quiz en curso guardado en la pestaña, para no perderlo si se recarga la página. */
const CLAVE_EN_CURSO = 'saesu_quiz_en_curso';

interface EnCurso {
  quiz: QuizIniciado;
  /** Hora local (ms) en la que se acaba el tiempo. */
  fin: number;
  respuestas: Record<number, string>;
  actual: number;
}

/**
 * /quiz: evaluación cronometrada con preguntas al azar del banco.
 *  1. Inicio: elegir tema y cantidad; a un lado, los resultados anteriores.
 *  2. En curso: una pregunta a la vez, navegación libre, tiempo total y atajos de teclado (A-D, flechas).
 *  3. Resultado: puntaje y revisión de cada pregunta con la correcta y la pista.
 * La calificación la hace el backend: el navegador nunca recibe las respuestas antes de entregar.
 */
@Component({
  selector: 'app-quiz',
  imports: [RouterLink, MatIconModule, Confeti],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz implements OnInit, OnDestroy {

  private quizService = inject(QuizService);
  private snackBar = inject(MatSnackBar);

  readonly temas = OPCIONES_TEMA;
  readonly cantidades = CANTIDADES;
  readonly reloj = reloj;
  readonly duracion = duracion;
  readonly nombreTema = nombreTemaQuiz;
  readonly haceCuanto = haceCuanto;
  readonly letras = ['A', 'B', 'C', 'D'];

  etapa = signal<Etapa>('inicio');

  // ---------- Inicio ----------
  tema = signal<TemaQuiz>(null);
  cantidad = signal(10);
  historial = signal<HistorialQuiz | null>(null);
  empezando = signal(false);
  minutos = computed(() => Math.round(this.cantidad() * SEGUNDOS_POR_PREGUNTA / 60));

  // ---------- En curso ----------
  quiz = signal<QuizIniciado | null>(null);
  actual = signal(0);
  respuestas = signal<Record<number, string>>({});
  restante = signal(0);
  confirmando = signal(false);
  entregando = signal(false);
  private fin = 0;
  private timer: ReturnType<typeof setInterval> | undefined;

  pregunta = computed(() => this.quiz()?.preguntas[this.actual()] ?? null);
  respondidas = computed(() => Object.keys(this.respuestas()).length);
  sinResponder = computed(() => (this.quiz()?.cantidad ?? 0) - this.respondidas());
  esUltima = computed(() => this.actual() === (this.quiz()?.cantidad ?? 1) - 1);
  /** Fracción de tiempo restante (para la barra). */
  fraccionTiempo = computed(() => {
    const total = this.quiz()?.segundosLimite ?? 1;
    return Math.max(0, Math.min(1, this.restante() / total));
  });
  poco = computed(() => this.restante() <= 60);

  // ---------- Resultado ----------
  resultado = signal<ResultadoQuiz | null>(null);
  soloErrores = signal(false);
  mensaje = computed(() => veredicto(this.resultado()?.porcentaje ?? 0));
  detalleVisible = computed<DetalleQuiz[]>(() => {
    const d = this.resultado()?.detalle ?? [];
    return this.soloErrores() ? d.filter(x => !x.correcta) : d;
  });
  /** Aciertos por tema (útil en los mixtos). */
  porTema = computed(() => {
    const mapa = new Map<string, { tema: string; bien: number; total: number }>();
    for (const d of this.resultado()?.detalle ?? []) {
      const t = mapa.get(d.tema) ?? { tema: d.tema, bien: 0, total: 0 };
      t.total++;
      if (d.correcta) t.bien++;
      mapa.set(d.tema, t);
    }
    return [...mapa.values()];
  });
  celebrar = computed(() => {
    const r = this.resultado();
    return !!r && (r.porcentaje === 100 || r.mejorMarca);
  });
  /** Largo del arco del anillo de puntaje (circunferencia de r=52). */
  readonly circunferencia = 2 * Math.PI * 52;

  ngOnInit(): void {
    if (!this.reanudar()) {
      this.cargarHistorial();
    }
  }

  ngOnDestroy(): void {
    this.detenerReloj();
  }

  // =========================================================
  // Inicio
  // =========================================================

  cargarHistorial(): void {
    this.quizService.historial().subscribe({
      next: (h) => this.historial.set(h),
      error: () => this.historial.set({ intentos: 0, promedio: 0, mejor: 0, ultimos: [] })
    });
  }

  empezar(): void {
    if (this.empezando()) return;
    this.empezando.set(true);
    this.quizService.iniciar({ tema: this.tema(), cantidad: this.cantidad() }).subscribe({
      next: (q) => {
        this.empezando.set(false);
        this.comenzar({ quiz: q, fin: Date.now() + q.segundosLimite * 1000, respuestas: {}, actual: 0 });
      },
      error: (err) => {
        this.empezando.set(false);
        this.snackBar.open(err?.error?.mensaje ?? err?.error?.message ?? 'No se pudo empezar el quiz', 'Cerrar', { duration: 4000 });
      }
    });
  }

  /** Revisión de un quiz anterior (desde el historial). */
  verAnterior(id: number): void {
    this.quizService.resultado(id).subscribe({
      next: (r) => this.mostrarResultado(r),
      error: () => this.snackBar.open('No se pudo abrir ese quiz', 'Cerrar', { duration: 3500 })
    });
  }

  // =========================================================
  // En curso
  // =========================================================

  private comenzar(estado: EnCurso): void {
    this.quiz.set(estado.quiz);
    this.respuestas.set(estado.respuestas);
    this.actual.set(Math.min(estado.actual, estado.quiz.cantidad - 1));
    this.fin = estado.fin;
    this.confirmando.set(false);
    this.etapa.set('en-curso');
    this.guardar();
    this.tic();
    this.detenerReloj();
    this.timer = setInterval(() => this.tic(), 250);
    this.subir();
  }

  private tic(): void {
    const s = Math.ceil((this.fin - Date.now()) / 1000);
    this.restante.set(Math.max(0, s));
    if (s <= 0 && this.etapa() === 'en-curso' && !this.entregando()) {
      this.snackBar.open('Se acabó el tiempo: entregamos tus respuestas', 'Cerrar', { duration: 4000 });
      this.entregar();
    }
  }

  elegir(letra: string): void {
    const p = this.pregunta();
    if (!p || this.entregando()) return;
    this.respuestas.update(r => ({ ...r, [p.preguntaId]: letra }));
    this.confirmando.set(false);
    this.guardar();
  }

  ir(indice: number): void {
    const n = this.quiz()?.cantidad ?? 0;
    if (indice < 0 || indice >= n) return;
    this.actual.set(indice);
    this.confirmando.set(false);
    this.guardar();
    this.subir();
  }

  siguiente(): void {
    if (this.esUltima()) {
      this.pedirEntrega();
    } else {
      this.ir(this.actual() + 1);
    }
  }

  /** Si faltan preguntas se pide confirmación; si no, se entrega de una. */
  pedirEntrega(): void {
    if (this.sinResponder() > 0 && !this.confirmando()) {
      this.confirmando.set(true);
      return;
    }
    this.entregar();
  }

  /** Va a la primera pregunta sin responder. */
  irAPendiente(): void {
    const q = this.quiz();
    if (!q) return;
    const i = q.preguntas.findIndex(p => !this.respuestas()[p.preguntaId]);
    if (i >= 0) this.ir(i);
  }

  entregar(): void {
    const q = this.quiz();
    if (!q || this.entregando()) return;
    this.entregando.set(true);
    this.detenerReloj();
    const respuestas = q.preguntas.map(p => ({ preguntaId: p.preguntaId, letra: this.respuestas()[p.preguntaId] ?? null }));
    this.quizService.finalizar(q.intentoId, { respuestas }).subscribe({
      next: (r) => {
        this.entregando.set(false);
        this.olvidar();
        this.mostrarResultado(r);
      },
      error: (err) => {
        this.entregando.set(false);
        if (err?.status === 409 || err?.status === 404) {
          // Ya estaba entregado (otra pestaña): se muestra lo que quedó guardado
          this.olvidar();
          this.verAnterior(q.intentoId);
          return;
        }
        this.snackBar.open('No se pudo entregar. Revisa tu conexión e inténtalo otra vez.', 'Cerrar', { duration: 4500 });
        this.timer = setInterval(() => this.tic(), 250);
      }
    });
  }

  respondida(preguntaId: number): boolean {
    return !!this.respuestas()[preguntaId];
  }

  // =========================================================
  // Resultado
  // =========================================================

  private mostrarResultado(r: ResultadoQuiz): void {
    this.resultado.set(r);
    this.soloErrores.set(false);
    this.etapa.set('resultado');
    this.subir();
    this.cargarHistorial();
  }

  /** Otro quiz con la misma configuración. */
  repetir(): void {
    const r = this.resultado();
    if (r) {
      this.tema.set(r.tema ?? null);
      this.cantidad.set(CANTIDADES.includes(r.total) ? r.total : this.cantidad());
    }
    this.empezar();
  }

  volverAlInicio(): void {
    this.resultado.set(null);
    this.quiz.set(null);
    this.etapa.set('inicio');
    this.subir();
  }

  claseOpcion(d: DetalleQuiz, letra: string): string {
    if (letra === d.letraCorrecta) return 'qz-rev__op--bien';
    if (letra === d.letraElegida) return 'qz-rev__op--mal';
    return '';
  }

  textoDe(d: DetalleQuiz, letra: string | null): string {
    return d.opciones.find(o => o.letra === letra)?.texto ?? '';
  }

  // =========================================================
  // Teclado y salida
  // =========================================================

  @HostListener('document:keydown', ['$event'])
  teclado(e: KeyboardEvent): void {
    if (this.etapa() !== 'en-curso' || e.ctrlKey || e.metaKey || e.altKey) return;
    const destino = e.target as HTMLElement | null;
    if (destino && /^(INPUT|TEXTAREA|SELECT)$/.test(destino.tagName)) return;
    const tecla = e.key.toUpperCase();
    const p = this.pregunta();
    const porNumero = ['1', '2', '3', '4'].indexOf(tecla);
    if (p && (this.letras.includes(tecla) || porNumero >= 0)) {
      const letra = porNumero >= 0 ? this.letras[porNumero] : tecla;
      if (p.opciones.some(o => o.letra === letra)) {
        e.preventDefault();
        this.elegir(letra);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.ir(this.actual() + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.ir(this.actual() - 1);
    }
  }

  /** Avisa antes de cerrar la pestaña con un quiz a medias (igual queda guardado para seguir). */
  @HostListener('window:beforeunload', ['$event'])
  antesDeSalir(e: BeforeUnloadEvent): void {
    if (this.etapa() === 'en-curso' && !this.entregando()) {
      e.preventDefault();
    }
  }

  private detenerReloj(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private subir(): void {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { /* sin ventana (pruebas) */ }
  }

  // ---------- Guardado en la pestaña (sessionStorage) ----------

  private guardar(): void {
    const q = this.quiz();
    if (!q) return;
    const estado: EnCurso = { quiz: q, fin: this.fin, respuestas: this.respuestas(), actual: this.actual() };
    try { sessionStorage.setItem(CLAVE_EN_CURSO, JSON.stringify(estado)); } catch { /* sin almacenamiento */ }
  }

  private olvidar(): void {
    try { sessionStorage.removeItem(CLAVE_EN_CURSO); } catch { /* sin almacenamiento */ }
  }

  /** Si se recargó la página con un quiz a medias, se sigue donde iba (o se entrega si ya se acabó el tiempo). */
  private reanudar(): boolean {
    let estado: EnCurso | null = null;
    try {
      const crudo = sessionStorage.getItem(CLAVE_EN_CURSO);
      estado = crudo ? JSON.parse(crudo) as EnCurso : null;
    } catch {
      estado = null;
    }
    if (!estado?.quiz?.preguntas?.length) return false;
    this.comenzar(estado);
    return true;
  }
}
