import { Component, booleanAttribute, computed, input } from '@angular/core';
import { Mascota } from '../mascota/mascota';

/** Nombre visible de los puntos del juego. */
export const PUNTOS_SUMI = 'Puntos Sumi';

/**
 * Ícono de los Puntos Sumi: Sumi completa en su burbuja (como su foto de perfil
 * en el chat del tutor) con una estrellita dorada de puntos en la esquina.
 * Es decorativo (aria-hidden) salvo que se le dé una etiqueta.
 */
@Component({
  selector: 'app-puntos-sumi',
  imports: [Mascota],
  template: `
    <span class="p" [style.--p.px]="tamano()"
          [attr.role]="etiqueta() ? 'img' : null" [attr.aria-label]="etiqueta() || null"
          [attr.aria-hidden]="etiqueta() ? null : 'true'">
      <span class="p__burbuja">
        <app-mascota clasica [tamano]="tamanoSumi()" [animada]="destacado()" [estado]="destacado() ? 'celebra' : 'feliz'" />
      </span>
      <svg class="p__estrella" viewBox="0 0 24 24" focusable="false">
        <path d="M12 1.8l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 16.6l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
      </svg>
    </span>
  `,
  host: { class: 'puntos-sumi', '[class.puntos-sumi--destacado]': 'destacado()' },
  styles: `
    :host { display: inline-flex; vertical-align: -0.22em; line-height: 0; flex: none; }
    .p { position: relative; display: block; width: var(--p); height: var(--p); }
    .p__burbuja {
      position: absolute; inset: 0; border-radius: 50%; overflow: hidden;
      display: flex; align-items: flex-end; justify-content: center;
      background: radial-gradient(circle at 35% 30%, #ffffff, #e0e7ff 70%);
      box-shadow: inset 0 0 0 1.5px #c7d2fe, 0 1px 3px rgba(79, 70, 229, 0.25);
    }
    .p__burbuja app-mascota { margin-bottom: -6%; }
    .p__estrella {
      position: absolute; right: -10%; bottom: -8%; width: 44%; height: 44%;
      fill: #fbbf24; stroke: #fff; stroke-width: 2.2; stroke-linejoin: round;
      filter: drop-shadow(0 1px 1px rgba(180, 83, 9, 0.45));
    }
    @media (prefers-reduced-motion: no-preference) {
      :host(.puntos-sumi--destacado) .p__estrella { animation: titilar 2.2s ease-in-out infinite; }
      :host(:hover) .p { animation: saltar 0.6s ease; }
    }
    @keyframes titilar {
      0%, 100% { transform: scale(1) rotate(0); }
      50% { transform: scale(1.25) rotate(18deg); }
    }
    @keyframes saltar {
      0%, 100% { transform: translateY(0); }
      40% { transform: translateY(-22%); }
    }
  `,
})
export class PuntosSumi {
  /** Tamaño en píxeles. */
  readonly tamano = input(18);
  /** Texto para lectores de pantalla; si se deja vacío el ícono es decorativo. */
  readonly etiqueta = input('');
  /** Sumi celebra y la estrellita titila (para los lugares destacados). */
  readonly destacado = input(false, { transform: booleanAttribute });

  /** Sumi llena la burbuja, como en el avatar del tutor. */
  protected readonly tamanoSumi = computed(() => Math.round(this.tamano() * 0.92));
}
