import { Component, booleanAttribute, computed, input } from '@angular/core';
import { Mascota } from '../mascota/mascota';

/** Nombre visible de la moneda del juego. */
export const PUNTOS_SUMI = 'Puntos Sumi';

let siguienteId = 0;

/**
 * Moneda dorada con Sumi completa adentro (como su foto de perfil en el chat):
 * el ícono de los Puntos Sumi. Es decorativa (aria-hidden) salvo que se le dé una etiqueta.
 */
@Component({
  selector: 'app-moneda-sumi',
  imports: [Mascota],
  template: `
    <span class="m" [style.--m.px]="tamano()"
          [attr.role]="etiqueta() ? 'img' : null" [attr.aria-label]="etiqueta() || null"
          [attr.aria-hidden]="etiqueta() ? null : 'true'">
      <svg class="m__fondo" viewBox="0 0 64 64" focusable="false">
        <defs>
          <radialGradient [attr.id]="id + 'o'" cx="38%" cy="30%" r="78%">
            <stop offset="0" stop-color="#fff7cc" />
            <stop offset="0.5" stop-color="#fcd34d" />
            <stop offset="1" stop-color="#e08a0b" />
          </radialGradient>
          <linearGradient [attr.id]="id + 'b'" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#fde68a" />
            <stop offset="1" stop-color="#b45309" />
          </linearGradient>
        </defs>
        <!-- Canto estriado y cara de la moneda -->
        <circle cx="32" cy="32" r="31.5" [attr.fill]="'url(#' + id + 'b)'" />
        <circle cx="32" cy="32" r="30" fill="none" stroke="#92400e" stroke-width="2.4"
                stroke-dasharray="1.6 1.6" opacity="0.4" />
        <circle cx="32" cy="32" r="27" [attr.fill]="'url(#' + id + 'o)'" />
        <circle cx="32" cy="32" r="26.2" fill="none" stroke="#b45309" stroke-width="1" opacity="0.5" />
      </svg>
      <!-- Sumi completa, como en su foto de perfil -->
      <span class="m__ventana">
        <app-mascota [tamano]="tamanoSumi()" [animada]="gira()" [estado]="gira() ? 'celebra' : 'feliz'" />
      </span>
      <svg class="m__brillo" viewBox="0 0 64 64" focusable="false">
        <path d="M11 24 A22 22 0 0 1 23 9" fill="none" stroke="#fff" stroke-width="2.6"
              stroke-linecap="round" opacity="0.8" />
      </svg>
    </span>
  `,
  host: { class: 'moneda-sumi', '[class.moneda-sumi--gira]': 'gira()' },
  styles: `
    :host { display: inline-flex; vertical-align: -0.22em; line-height: 0; flex: none; }
    .m {
      position: relative; display: block; width: var(--m); height: var(--m);
      filter: drop-shadow(0 1px 1.5px rgba(146, 64, 14, 0.35));
    }
    .m__fondo, .m__brillo { position: absolute; inset: 0; width: 100%; height: 100%; }
    .m__brillo { pointer-events: none; }
    .m__ventana {
      position: absolute; inset: 9%; border-radius: 50%; overflow: hidden;
      display: flex; align-items: flex-end; justify-content: center;
    }
    .m__ventana app-mascota { margin-bottom: -4%; }
    @media (prefers-reduced-motion: no-preference) {
      :host(.moneda-sumi--gira) .m { animation: girar 3.2s ease-in-out infinite; }
      :host(:hover) .m { animation: saltar 0.6s ease; }
    }
    @keyframes girar {
      0%, 70%, 100% { transform: rotateY(0); }
      85% { transform: rotateY(360deg) scale(1.06); }
    }
    @keyframes saltar {
      0%, 100% { transform: translateY(0) rotate(0); }
      40% { transform: translateY(-25%) rotate(-12deg); }
    }
  `,
})
export class MonedaSumi {
  /** Tamaño en píxeles. */
  readonly tamano = input(18);
  /** Texto para lectores de pantalla; si se deja vacío la moneda es decorativa. */
  readonly etiqueta = input('');
  /** Gira de vez en cuando y Sumi se mueve (para los lugares destacados). */
  readonly gira = input(false, { transform: booleanAttribute });

  /** Sumi ocupa casi todo el círculo interior, como en el avatar del tutor. */
  protected readonly tamanoSumi = computed(() => Math.round(this.tamano() * 0.8));
  protected readonly id = `moneda-sumi-${++siguienteId}-`;
}
