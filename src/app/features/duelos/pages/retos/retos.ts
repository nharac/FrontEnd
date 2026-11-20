import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { DuelosService } from '../../services/duelos.service';
import { Companero, Duelo, PreguntaDuelo } from '../../models/duelo.model';
import { TEMAS } from '../../../practica/models/practica.model';
import { TextoRicoDirective } from '../../../../shared/directives/texto-rico.directive';

/** Retos entre compañeros: retar, jugar y ver resultados. */
@Component({
  selector: 'app-retos',
  standalone: true,
  imports: [MatIconModule, TextoRicoDirective],
  templateUrl: './retos.html',
  styleUrl: './retos.scss',
})
export class Retos implements OnInit, OnDestroy {
  private readonly servicio = inject(DuelosService);

  readonly temas = TEMAS;

  duelos = signal<Duelo[]>([]);
  companeros = signal<Companero[]>([]);
  rivalId = signal<number | null>(null);
  tema = signal<string>('fundamentos');
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);
  enviando = signal(false);

  // Juego en curso
  jugando = signal<Duelo | null>(null);
  preguntas = signal<PreguntaDuelo[]>([]);
  respuestas = signal<Record<number, string>>({});
  segundos = signal(0);
  resultado = signal<Duelo | null>(null);
  private reloj?: ReturnType<typeof setInterval>;

  porJugar = computed(() => this.duelos().filter(d => d.estado === 'POR_JUGAR'));
  otros = computed(() => this.duelos().filter(d => d.estado !== 'POR_JUGAR'));
  ganados = computed(() => this.duelos().filter(d => d.resultado === 'GANASTE').length);
  contestadas = computed(() => Object.keys(this.respuestas()).length);

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
    this.servicio.retar(rival, this.tema()).subscribe({
      next: d => {
        this.duelos.update(l => [d, ...l]);
        this.mensaje.set(`¡Retaste a ${d.rival}! Juega tu parte cuando quieras.`);
        this.enviando.set(false);
      },
      error: e => this.falla(e, 'No se pudo crear el reto.'),
    });
  }

  jugar(d: Duelo): void {
    this.error.set(null);
    this.resultado.set(null);
    this.servicio.preguntas(d.id).subscribe({
      next: p => {
        this.preguntas.set(p);
        this.respuestas.set({});
        this.segundos.set(0);
        this.jugando.set(d);
        this.pararReloj();
        this.reloj = setInterval(() => this.segundos.update(s => s + 1), 1000);
      },
      error: e => this.falla(e, 'No se pudo abrir el reto.'),
    });
  }

  elegir(preguntaId: number, letra: string): void {
    this.respuestas.update(r => ({ ...r, [preguntaId]: letra }));
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

  private pararReloj(): void {
    if (this.reloj) clearInterval(this.reloj);
    this.reloj = undefined;
  }

  textoResultado(d: Duelo): string {
    if (d.estado === 'ESPERANDO') return `Esperando a ${d.rival}`;
    if (d.resultado === 'GANASTE') return '¡Ganaste!';
    if (d.resultado === 'PERDISTE') return 'Perdiste';
    return 'Empate';
  }
}
