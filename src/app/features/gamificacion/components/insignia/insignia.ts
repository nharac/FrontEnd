import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Logro, avanceDe } from '../../models/logro.model';
import { SumiDev } from '../../../../shared/components/sumi-dev/sumi-dev';

/**
 * Dibujo de una insignia. Los logros normales son un escudo hexagonal con el color de su rareza;
 * los retos (insignias especiales) son un medallón estrellado con cinta.
 * Sin obtener se ve en gris con un anillo que marca el avance.
 * La exclusiva de los desarrolladores es Sumi vestida de developer con aro RGB (app-sumi-dev).
 */
@Component({
  selector: 'app-insignia',
  imports: [MatIconModule, SumiDev],
  template: `
    @if (rareza() === 'exclusivo') {
      <app-sumi-dev [tamano]="tamano()" />
    } @else {
    <span class="ins" [class]="'ins ins--' + rareza()" [class.ins--especial]="especial()"
          [class.ins--bloqueada]="!logro().obtenido" [style.--t.px]="tamano()" aria-hidden="true">
      @if (!logro().obtenido) {
        <svg class="ins__anillo" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" pathLength="100" class="ins__pista" />
          <circle cx="50" cy="50" r="46" pathLength="100" class="ins__avance"
                  [attr.stroke-dasharray]="avance() + ' 100'" />
        </svg>
      }
      @if (especial()) {
        <svg class="ins__forma" viewBox="0 0 100 100">
          <path class="ins__cinta" d="M30 62 L20 96 L34 88 L42 98 L50 66 Z M70 62 L80 96 L66 88 L58 98 L50 66 Z" />
          <path class="ins__fondo" [attr.d]="estrella" />
          <circle class="ins__centro" cx="50" cy="46" r="27" />
        </svg>
      } @else {
        <svg class="ins__forma" viewBox="0 0 100 100">
          <path class="ins__fondo" d="M50 4 L90 27 L90 73 L50 96 L10 73 L10 27 Z" />
          <path class="ins__centro" d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z" />
        </svg>
      }
      <mat-icon class="ins__icono" [class.ins__icono--especial]="especial()">{{ logro().obtenido ? logro().icono : (logro().secreto ? 'question_mark' : 'lock') }}</mat-icon>
      @if (logro().obtenido) { <span class="ins__brillo"></span> }
    </span>
    }
  `,
  styleUrl: './insignia.scss',
})
export class Insignia {
  readonly logro = input.required<Logro>();
  readonly tamano = input(64);

  readonly rareza = computed(() => (this.logro().rareza ?? 'COMUN').toLowerCase());
  readonly especial = computed(() => this.logro().categoria === 'RETOS');
  readonly avance = computed(() => avanceDe(this.logro()));

  /** Estrella de 12 puntas (contorno del medallón). */
  protected readonly estrella = (() => {
    const puntos: string[] = [];
    for (let i = 0; i < 24; i++) {
      const r = i % 2 === 0 ? 44 : 37;
      const a = (Math.PI * 2 * i) / 24 - Math.PI / 2;
      puntos.push(`${(50 + r * Math.cos(a)).toFixed(1)} ${(46 + r * Math.sin(a)).toFixed(1)}`);
    }
    return `M${puntos.join(' L')} Z`;
  })();
}
