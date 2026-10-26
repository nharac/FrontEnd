import { Component, input } from '@angular/core';

/**
 * Ícono de SAESU: símbolo de integral con una chispa (la IA).
 * SVG en línea para que se vea nítido en cualquier tamaño y no dependa de archivos externos.
 * Uso: <app-logo [size]="36" />
 */
@Component({
  selector: 'app-logo',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 200 200"
         role="img" aria-label="SAESU">
      <rect width="200" height="200" rx="44" fill="#1F3247" />
      <path d="M128 38 C104 30 92 46 92 70 L92 130 C92 154 80 170 56 162"
            fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" />
      <g transform="translate(142 58)">
        <path class="chispa" d="M0,-24 C3,-7 7,-3 24,0 C7,3 3,7 0,24 C-3,7 -7,3 -24,0 C-7,-3 -3,-7 0,-24 Z"
              fill="#2EB872" />
      </g>
    </svg>
  `,
  styles: `
    :host { display: inline-flex; flex: none; line-height: 0; }
    svg { display: block; }
    @media (prefers-reduced-motion: no-preference) {
      .chispa { transform-box: fill-box; transform-origin: center; animation: chispa 3.2s ease-in-out infinite; }
      :host(:hover) .chispa { animation-duration: 0.9s; }
    }
    @keyframes chispa {
      0%, 70%, 100% { transform: scale(1) rotate(0deg); }
      80% { transform: scale(1.25) rotate(45deg); }
      90% { transform: scale(0.9) rotate(90deg); }
    }
  `,
})
export class Logo {
  size = input(36);
}
