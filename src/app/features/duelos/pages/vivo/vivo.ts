import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { VivoService } from '../../services/duelos.service';
import { EstadoSala, RespuestaVivo } from '../../models/duelo.model';
import { SumiDice } from '../../../../shared/components/sumi-dice/sumi-dice';
import { Confeti } from '../../../../shared/components/confeti/confeti';
import { TextoRicoDirective } from '../../../../shared/directives/texto-rico.directive';
import { iniciales } from '../retos/retos';

/** Sala de reto en vivo. Pregunta el estado al servidor cada segundo mientras el juego no termine. */
@Component({
  selector: 'app-vivo',
  standalone: true,
  imports: [NgClass, RouterLink, MatIconModule, SumiDice, Confeti, TextoRicoDirective],
  templateUrl: './vivo.html',
})
export class Vivo implements OnInit, OnDestroy {
  private readonly servicio = inject(VivoService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly iniciales = iniciales;
  codigo = '';
  sala = signal<EstadoSala | null>(null);
  error = signal<string | null>(null);
  enviando = signal(false);
  copiado = signal(false);
  /** Respuesta que acabo de dar (se muestra hasta que cambie la pregunta). */
  respuesta = signal<RespuestaVivo | null>(null);
  private ultimaPregunta = -1;
  private timer?: ReturnType<typeof setInterval>;

  mia = computed(() => this.respuesta() ?? this.sala()?.miRespuesta ?? null);
  yo = computed(() => this.sala()?.jugadores.find(j => j.soyYo) ?? null);
  otro = computed(() => this.sala()?.jugadores.find(j => !j.soyYo) ?? null);
  puedoUnirme = computed(() => {
    const s = this.sala();
    return !!s && s.estado === 'ESPERANDO' && !s.soyAnfitrion;
  });
  progresoTiempo = computed(() => {
    const s = this.sala();
    return s?.segundosRestantes != null ? (s.segundosRestantes / s.segundosPorPregunta) * 100 : 0;
  });
  sumi = computed(() => {
    const s = this.sala();
    if (!s) return { estado: 'pensando' as const, titulo: 'Conectando…', texto: '' };
    if (s.estado === 'ESPERANDO') {
      return s.soyAnfitrion
        ? { estado: 'saludo' as const, titulo: 'Esperando a tu rival', texto: s.abierta ? 'Comparte el código para que entre.' : `Le avisé a ${s.rival}. Apenas entre, empezamos.` }
        : { estado: 'saludo' as const, titulo: '¡Te están esperando!', texto: 'Pulsa "Entrar al reto" cuando estés listo.' };
    }
    if (s.estado === 'CANCELADA') return { estado: 'pensando' as const, titulo: 'Sala cancelada', texto: 'Puedes crear otra desde la arena.' };
    if (s.cuentaRegresiva) return { estado: 'nervioso' as const, titulo: `¡Empieza en ${s.cuentaRegresiva}!`, texto: 'Prepárate…' };
    if (s.estado === 'TERMINADA') {
      if (s.resultado === 'GANASTE') return { estado: 'celebra' as const, titulo: '¡GANASTE EN VIVO!', texto: '¡Qué velocidad! Eres una máquina.' };
      if (s.resultado === 'EMPATE') return { estado: 'feliz' as const, titulo: '¡Empate!', texto: 'Mismos puntos. ¡Pidan la revancha!' };
      return { estado: 'animo' as const, titulo: 'Esta vez no fue', texto: 'Repasa el tema y vuelve por la revancha.' };
    }
    const m = this.mia();
    if (m) return m.correcta
      ? { estado: 'celebra' as const, titulo: `¡Correcto! +${m.puntos}`, texto: 'Espera la siguiente pregunta…' }
      : { estado: 'animo' as const, titulo: 'Uy, no era esa', texto: `La correcta era la ${m.letraCorrecta}. ¡Vamos con la siguiente!` };
    return { estado: 'pensando' as const, titulo: `Pregunta ${s.indice + 1} de ${s.total}`, texto: 'Mientras más rápido aciertes, más puntos.' };
  });

  ngOnInit(): void {
    this.codigo = (this.ruta.snapshot.paramMap.get('codigo') ?? '').toUpperCase();
    this.refrescar();
    this.timer = setInterval(() => this.refrescar(), 1000);
  }

  ngOnDestroy(): void {
    this.parar();
  }

  private parar(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  refrescar(): void {
    this.servicio.ver(this.codigo).subscribe({
      next: s => this.aplicar(s),
      error: (e: HttpErrorResponse) => {
        this.error.set(e.status === 404 ? 'Esta sala no existe o no es para ti.' : 'Se perdió la conexión. Reintentando…');
        if (e.status === 404) this.parar();
      },
    });
  }

  aplicar(s: EstadoSala): void {
    this.error.set(null);
    if (s.indice !== this.ultimaPregunta) {
      this.ultimaPregunta = s.indice;
      this.respuesta.set(null);
    }
    this.sala.set(s);
    if (s.estado === 'TERMINADA' || s.estado === 'CANCELADA') this.parar();
  }

  unirme(): void {
    this.enviando.set(true);
    this.servicio.unirse(this.codigo).subscribe({
      next: s => { this.aplicar(s); this.enviando.set(false); },
      error: (e: HttpErrorResponse) => { this.error.set(e.error?.mensaje ?? 'No pudiste entrar a la sala.'); this.enviando.set(false); },
    });
  }

  responder(letra: string): void {
    const s = this.sala();
    if (!s?.pregunta || this.mia() || this.enviando()) return;
    this.enviando.set(true);
    this.servicio.responder(this.codigo, s.pregunta.orden, letra).subscribe({
      next: r => { this.respuesta.set(r); this.enviando.set(false); },
      error: (e: HttpErrorResponse) => { this.error.set(e.error?.mensaje ?? 'No se pudo enviar.'); this.enviando.set(false); },
    });
  }

  cancelar(): void {
    this.servicio.cancelar(this.codigo).subscribe({ next: s => this.aplicar(s), error: () => {} });
  }

  copiar(): void {
    try {
      navigator.clipboard?.writeText(this.codigo);
      this.copiado.set(true);
    } catch { /* sin portapapeles */ }
  }

  volver(): void {
    this.router.navigateByUrl('/retos');
  }

  claseOpcion(letra: string): string {
    const m = this.mia();
    if (!m) return '';
    if (letra === m.letraCorrecta) return 'vv-opcion--correcta';
    if (letra === m.letra) return 'vv-opcion--mal';
    return 'vv-opcion--apagada';
  }
}
