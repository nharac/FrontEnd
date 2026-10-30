import { Component, OnDestroy, booleanAttribute, computed, effect, input, signal, untracked } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { azar } from '../../utils/azar';

import { AccesorioMascota, EstadoMascota, Mascota } from '../mascota/mascota';

/** Color del globo según lo que dice Sumi. */
export type TonoSumi = 'normal' | 'exito' | 'alerta' | 'info';

/**
 * Sumi hablando: la mascota con un globo de texto al lado.
 * Si recibe varios mensajes muestra uno al azar y deja pedir "otro consejo".
 * Antes de cada mensaje aparecen unos puntitos de "escribiendo" (se omiten con movimiento reducido).
 *
 * Uso:
 *   <app-sumi-dice estado="feliz" accesorio="lupa" titulo="¡Hola!" [mensajes]="['Texto 1', 'Texto 2']" />
 *   Lo que se ponga dentro (botones, enlaces) va al final del globo.
 */
@Component({
  selector: 'app-sumi-dice',
  imports: [Mascota, MatIconModule],
  templateUrl: './sumi-dice.html',
  host: {
    '[class]': 'clases()',
  },
})
export class SumiDice implements OnDestroy {
  estado = input<EstadoMascota>('feliz');
  accesorio = input<AccesorioMascota>('ninguno');
  tamano = input(92);
  titulo = input('');
  /** Un texto o una lista (se elige uno al azar). */
  mensajes = input<string | string[]>('');
  tono = input<TonoSumi>('normal');
  /** Sumi a la izquierda (por defecto) o a la derecha del globo. */
  lado = input<'izquierda' | 'derecha'>('izquierda');
  /** Versión más pequeña para encabezados y tarjetas. */
  compacto = input(false, { transform: booleanAttribute });
  animada = input(true);
  /** false = empieza siempre por el primer mensaje (útil cuando el primero es el más importante). */
  aleatorio = input(true, { transform: booleanAttribute });

  private indice = signal(0);
  escribiendo = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  lista = computed(() => {
    const m = this.mensajes();
    return (Array.isArray(m) ? m : [m]).filter(t => !!t);
  });
  texto = computed(() => this.lista()[this.indice() % Math.max(1, this.lista().length)] ?? '');

  clases = computed(() =>
    `sd sd--${this.tono()} sd--${this.lado()}${this.compacto() ? ' sd--compacto' : ''}`);

  constructor() {
    // Cada vez que cambian los mensajes: uno al azar y los puntitos de "escribiendo"
    effect(() => {
      const n = this.lista().length;
      untracked(() => {
        this.indice.set(n > 1 && this.aleatorio() ? Math.floor(azar() * n) : 0);
        this.escribir();
      });
    });
  }

  otro(): void {
    const n = this.lista().length;
    if (n < 2) return;
    let siguiente = Math.floor(azar() * (n - 1));
    if (siguiente >= this.indice() % n) siguiente++;
    this.indice.set(siguiente);
    this.escribir();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  private escribir(): void {
    clearTimeout(this.timer);
    const quieto = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (quieto || !this.animada()) {
      this.escribiendo.set(false);
      return;
    }
    this.escribiendo.set(true);
    this.timer = setTimeout(() => this.escribiendo.set(false), 650);
  }
}
