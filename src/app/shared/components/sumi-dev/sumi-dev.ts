import { Component, input } from '@angular/core';

import { Mascota } from '../mascota/mascota';

/**
 * Insignia exclusiva de los desarrolladores de SAESU: Sumi vestida de developer
 * (gafas, audífonos y portátil) dentro de un aro RGB que gira. Sin texto visible;
 * el nombre va en el title y para lectores de pantalla.
 * La capa del atuendo usa el mismo viewBox que la mascota (160 x 180) para que encaje encima.
 */
@Component({
  selector: 'app-sumi-dev',
  imports: [Mascota],
  template: `
    <span class="dev" [style.--t.px]="tamano()" role="img" aria-label="Insignia exclusiva: Desarrollador de SAESU"
          title="Desarrollador de SAESU">
      <span class="dev__aro" aria-hidden="true"></span>
      <span class="dev__fondo" aria-hidden="true">
        <span class="dev__sumi">
          <app-mascota estado="feliz" accesorio="gafas" [tamano]="tamano() * 0.86" [animada]="false" />
          <svg class="dev__atuendo" viewBox="0 0 160 180">
            <defs>
              <linearGradient id="dev-rgb" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#ff004c" /><stop offset="0.33" stop-color="#00ff88" />
                <stop offset="0.66" stop-color="#00b3ff" /><stop offset="1" stop-color="#d400ff" />
              </linearGradient>
            </defs>
            <!-- Audífonos -->
            <path class="dev__diadema" d="M36 112 C 32 46, 128 46, 124 112" />
            <rect class="dev__auricular" x="26" y="98" width="16" height="28" rx="7" />
            <rect class="dev__auricular" x="118" y="98" width="16" height="28" rx="7" />
            <rect class="dev__luz" x="29" y="104" width="4" height="16" rx="2" />
            <rect class="dev__luz" x="127" y="104" width="4" height="16" rx="2" />
            <!-- Portátil (se ve la tapa por detrás, con el logo </>) -->
            <rect class="dev__tapa" x="48" y="128" width="64" height="38" rx="5" />
            <path class="dev__logo" d="M72 140 L64 147 L72 154 M88 140 L96 147 L88 154 M83 138 L77 156" />
            <rect class="dev__base" x="40" y="164" width="80" height="6" rx="3" />
          </svg>
        </span>
      </span>
    </span>
  `,
  styles: `
    :host { display: inline-flex; flex: none; line-height: 0; vertical-align: middle; }

    .dev {
      position: relative;
      display: block;
      width: var(--t);
      height: var(--t);
      border-radius: 50%;
    }

    /* Aro RGB que gira, con resplandor */
    .dev__aro {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: conic-gradient(from var(--sumi-dev-giro), #ff004c, #ff8a00, #ffe600, #00ff88, #00e1ff, #3d5bff, #d400ff, #ff004c);
      filter: drop-shadow(0 0 calc(var(--t) * 0.08) rgba(212, 0, 255, 0.6));
    }
    .dev__aro::after {
      content: '';
      position: absolute;
      inset: -6%;
      border-radius: 50%;
      background: inherit;
      filter: blur(calc(var(--t) * 0.12));
      opacity: 0.55;
      z-index: -1;
    }

    .dev__fondo {
      position: absolute;
      inset: 7%;
      overflow: hidden;
      border-radius: 50%;
      background: radial-gradient(circle at 50% 35%, #1e293b, #020617 75%);
      box-shadow: inset 0 0 calc(var(--t) * 0.12) rgba(0, 255, 136, 0.35);
    }

    .dev__sumi {
      position: absolute;
      left: 50%;
      bottom: -6%;
      width: calc(var(--t) * 0.86);
      transform: translateX(-50%);
    }
    .dev__atuendo { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }

    .dev__diadema { fill: none; stroke: #111827; stroke-width: 7; stroke-linecap: round; }
    .dev__auricular { fill: #111827; stroke: url(#dev-rgb); stroke-width: 2.5; }
    .dev__luz { fill: url(#dev-rgb); }
    .dev__tapa { fill: #334155; stroke: #0f172a; stroke-width: 2; }
    .dev__logo { fill: none; stroke: url(#dev-rgb); stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round; }
    .dev__base { fill: #94a3b8; }

    @property --sumi-dev-giro { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

    @media (prefers-reduced-motion: no-preference) {
      .dev__aro { animation: girar 3s linear infinite; }
      .dev__luz, .dev__logo { animation: rgb 3s linear infinite; }
      :host(:hover) .dev__sumi { animation: saltito 0.5s ease; }
    }
    @keyframes girar { to { --sumi-dev-giro: 360deg; } }
    @keyframes rgb { to { filter: hue-rotate(360deg); } }
    @keyframes saltito { 50% { transform: translateX(-50%) translateY(-8%); } }
  `,
})
export class SumiDev {
  /** Diámetro en píxeles. */
  readonly tamano = input(40);
}
