import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { DuelosService } from '../../services/duelos.service';
import { Companero, Duelo, MODOS, ModoDuelo, PreguntaDuelo } from '../../models/duelo.model';
import { TEMAS } from '../../../practica/models/practica.model';
import { TextoRicoDirective } from '../../../../shared/directives/texto-rico.directive';
import { SumiDice } from '../../../../shared/components/sumi-dice/sumi-dice';
import { Confeti } from '../../../../shared/components/confeti/confeti';
import { sumiJugando, sumiResultadoReto, sumiRetos } from '../../../../shared/components/sumi-dice/dialogos';

/** Iniciales para el avatar (máximo dos letras). */
export function iniciales(nombre: string): string {
  return nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
}

/** Retos entre compañeros: retar, jugar una pregunta a la vez y ver el marcador. */
@Component({
  selector: 'app-retos',
  standalone: true,
  imports: [NgClass, MatIconModule, TextoRicoDirective, SumiDice, Confeti],
  templateUrl: './retos.html',
  styleUrl: './retos.scss',
})
export class Retos implements OnInit, OnDestroy {
  private readonly servicio = inject(DuelosService);

  readonly temas = TEMAS;
  readonly modos = MODOS;
  modo = signal<ModoDuelo>('CLASICO');
  readonly iniciales = iniciales;
  readonly letras = ['A', 'B', 'C', 'D', 'E'];

  duelos = signal<Duelo[]>([]);
  companeros = signal<Companero[]>([]);
  filtroRival = signal('');
  rivalId = signal<number | null>(null);
  tema = signal<string>('fundamentos');
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);
  enviando = signal(false);

  // Juego en curso
  jugando = signal<Duelo | null>(null);
  preguntas = signal<PreguntaDuelo[]>([]);
  actual = signal(0);
  respuestas = signal<Record<number, string>>({});
  segundos = signal(0);
  resultado = signal<Duelo | null>(null);
  private reloj?: ReturnType<typeof setInterval>;

  porJugar = computed(() => this.duelos().filter(d => d.estado === 'POR_JUGAR'));
  esperando = computed(() => this.duelos().filter(d => d.estado === 'ESPERANDO'));
  terminados = computed(() => this.duelos().filter(d => d.estado === 'TERMINADO'));
  otros = computed(() => this.duelos().filter(d => d.estado !== 'POR_JUGAR'));
  ganados = computed(() => this.terminados().filter(d => d.resultado === 'GANASTE').length);
  perdidos = computed(() => this.terminados().filter(d => d.resultado === 'PERDISTE').length);
  empates = computed(() => this.terminados().filter(d => d.resultado === 'EMPATE').length);
  contestadas = computed(() => Object.keys(this.respuestas()).length);
  preguntaActual = computed(() => this.preguntas()[this.actual()] ?? null);
  rivalElegido = computed(() => this.companeros().find(c => c.id === this.rivalId()) ?? null);
  companerosFiltrados = computed(() => {
    const q = this.filtroRival().trim().toLowerCase();
    return q ? this.companeros().filter(c => c.nombre.toLowerCase().includes(q)) : this.companeros();
  });
  nombreModo = computed(() => this.modos.find(m => m.id === this.modo())?.nombre ?? '');
  /** Segundos que quedan en el modo relámpago (null en los demás). */
  restantes = computed(() => {
    const l = this.jugando()?.limiteSegundos;
    return l ? Math.max(0, l - this.segundos()) : null;
  });
  private urgente = computed(() => (this.restantes() ?? 99) <= 10);
  nombreTema = computed(() => this.temas.find(t => t.id === this.tema())?.nombre ?? '');

  // Lo que dice Sumi en cada momento
  sumiPortada = computed(() => sumiRetos(this.porJugar().length, this.ganados(), this.terminados().length, this.companeros().length > 0));
  /** Solo cambia una vez (a los 2 minutos), así Sumi no se reinicia con cada segundo del reloj. */
  private lento = computed(() => this.segundos() > 120);
  sumiJuego = computed(() => sumiJugando(this.contestadas(), this.preguntas().length, this.lento() ? 121 : 0,
    this.jugando()?.modo ?? 'CLASICO', this.urgente() ? 10 : null));
  sumiFinal = computed(() => {
    const r = this.resultado();
    return r ? sumiResultadoReto(r.resultado, r.estado, r.rival) : null;
  });

  ngOnInit(): void {
    this.cargar();
    this.servicio.companeros().subscribe({ next: c => this.companeros.set(c), error: () => this.companeros.set([]) });
  }

  ngOnDestroy(): void {
    this.pararReloj();
  }

  private cargar(): void {
    this.servicio.misDuelos().subscribe({ next: d => this.duelos.set(d), error: () => this.error.set('No se pudieron cargar tus retos.') });
  }

  private falla(e: HttpErrorResponse, porDefecto: string): void {
    this.error.set(e.error?.mensaje ?? porDefecto);
    this.enviando.set(false);
  }

  retar(): void {
    const rival = this.rivalId();
    if (!rival || this.enviando()) return;
    this.enviando.set(true);
    this.error.set(null);
    this.servicio.retar(rival, this.tema(), this.modo()).subscribe({
      next: d => {
        this.duelos.update(l => [d, ...l]);
        this.mensaje.set(`¡Retaste a ${d.rival} (${d.modoNombre})! Juega tu parte cuando quieras.`);
        this.rivalId.set(null);
        this.enviando.set(false);
      },
      error: e => this.falla(e, 'No se pudo crear el reto.'),
    });
  }

  /** Revancha: mismo rival y mismo tema. */
  revancha(d: Duelo): void {
    const c = this.companeros().find(x => x.nombre === d.rival);
    if (!c) return;
    this.resultado.set(null);
    this.rivalId.set(c.id);
    this.tema.set(d.tema);
    this.modo.set(d.modo ?? 'CLASICO');
    this.retar();
  }

  jugar(d: Duelo): void {
    this.error.set(null);
    this.resultado.set(null);
    this.servicio.preguntas(d.id).subscribe({
      next: p => {
        this.preguntas.set(p);
        this.respuestas.set({});
        this.actual.set(0);
        this.segundos.set(0);
        this.jugando.set(d);
        this.pararReloj();
        this.reloj = setInterval(() => this.tic(), 1000);
      },
      error: e => this.falla(e, 'No se pudo abrir el reto.'),
    });
  }

  /** Avanza el reloj; en relámpago entrega solo al llegar a cero. */
  tic(): void {
    this.segundos.update(s => s + 1);
    if (this.restantes() === 0) this.entregar();
  }

  elegir(preguntaId: number, letra: string): void {
    this.respuestas.update(r => ({ ...r, [preguntaId]: letra }));
  }

  irA(i: number): void {
    if (i >= 0 && i < this.preguntas().length) this.actual.set(i);
  }

  entregar(): void {
    const d = this.jugando();
    if (!d || this.enviando()) return;
    this.enviando.set(true);
    this.pararReloj();
    const r = this.respuestas();
    const lista = this.preguntas().map(p => ({ preguntaId: p.id, letra: r[p.id] ?? null }));
    this.servicio.entregar(d.id, lista, this.segundos()).subscribe({
      next: res => {
        this.resultado.set(res);
        this.jugando.set(null);
        this.duelos.update(l => l.map(x => (x.id === res.id ? res : x)));
        this.enviando.set(false);
      },
      error: e => this.falla(e, 'No se pudo entregar el reto.'),
    });
  }

  cancelar(): void {
    this.pararReloj();
    this.jugando.set(null);
  }

  cerrarResultado(): void {
    this.resultado.set(null);
  }

  private pararReloj(): void {
    if (this.reloj) clearInterval(this.reloj);
    this.reloj = undefined;
  }

  reloj$(s: number): string {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  textoResultado(d: Duelo): string {
    if (d.estado === 'ESPERANDO') return `Esperando a ${d.rival}`;
    if (d.resultado === 'GANASTE') return '¡Ganaste!';
    if (d.resultado === 'PERDISTE') return 'Perdiste';
    return 'Empate';
  }

  iconoModo(id: string | undefined): string {
    return this.modos.find(m => m.id === id)?.icono ?? 'sports_kabaddi';
  }

  /** Cómo se llama el puntaje en cada modo. */
  unidad(modo: string | undefined): string {
    return modo === 'PUNTOS' ? 'pts' : modo === 'MUERTE_SUBITA' ? 'racha' : 'aciertos';
  }

  iconoTema(id: string): string {
    return this.temas.find(t => t.id === id)?.icono ?? 'functions';
  }
}
