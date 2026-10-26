import { Component, computed, input } from '@angular/core';

const COLORES = ['#4f46e5', '#f59e0b', '#10b981', '#ec4899', '#0ea5e9', '#f97316'];

/**
 * Lluvia de confeti decorativa (solo CSS). Se dibuja una vez al aparecer.
 * Uso: <app-confeti [cantidad]="24" /> dentro de un contenedor con position: relative.
 */
@Component({
  selector: 'app-confeti',
  template: `
    @for (p of piezas(); track $index) {
      <span class="pieza"
            [style.left.%]="p.x"
            [style.background]="p.color"
            [style.width.px]="p.ancho"
            [style.height.px]="p.alto"
            [style.border-radius]="p.redondo ? '50%' : '2px'"
            [style.animation-delay.ms]="p.retraso"
            [style.--dx]="p.dx + 'px'"
            [style.--dy]="p.dy + 'px'"
            [style.--giro]="p.giro + 'deg'"></span>
    }
  `,
  host: { class: 'saesu-confeti', 'aria-hidden': 'true' },
  styles: `
    :host {
      position: absolute;
      inset: 0;
      overflow: visible;
      pointer-events: none;
      z-index: 2;
    }
    .pieza {
      position: absolute;
      top: 30%;
      opacity: 0;
      animation: saesu-confeti 1.6s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
    }
  `,
})
export class Confeti {
  cantidad = input(24);
  /** Qué tan lejos salen disparadas las piezas (px). */
  alcance = input(160);

  piezas = computed(() => Array.from({ length: this.cantidad() }, (_, i) => {
    const angulo = Math.random() * Math.PI * 2;
    const fuerza = this.alcance() * (0.45 + Math.random() * 0.55);
    return {
      x: 35 + Math.random() * 30,
      color: COLORES[i % COLORES.length],
      ancho: 6 + Math.random() * 6,
      alto: 8 + Math.random() * 8,
      redondo: Math.random() > 0.6,
      retraso: Math.random() * 250,
      dx: Math.round(Math.cos(angulo) * fuerza),
      // hacia arriba primero y luego cae: sesgo positivo en Y
      dy: Math.round(Math.sin(angulo) * fuerza * 0.6 + fuerza * 0.7),
      giro: Math.round((Math.random() - 0.5) * 720),
    };
  }));
}
