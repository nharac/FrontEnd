import { Component, computed, input } from '@angular/core';

const NOMBRES = ['', 'oro', 'plata', 'bronce'];

/**
 * Insignia del top 3 del ranking (oro, plata, bronce) que se pone
 * sobre la esquina de un avatar. Si el lugar no es 1, 2 o 3 no muestra nada.
 * El contenedor del avatar debe tener position: relative.
 */
@Component({
  selector: 'app-medalla',
  template: `
    @if (visible()) {
      <span class="medalla medalla--{{ lugar() }} medalla--{{ tamano() }}"
            role="img" [attr.aria-label]="'Top ' + lugar() + ' del ranking (' + nombre() + ')'"
            [attr.title]="'Top ' + lugar() + ' del ranking'">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 2h4l1 4-3 3-3-5zM13 2h4l1 2-3 5-3-3z" class="cinta" />
          <circle cx="12" cy="15" r="7" class="disco" />
          <text x="12" y="18.6" text-anchor="middle">{{ lugar() }}</text>
        </svg>
      </span>
    }
  `,
  host: { '[class.oculta]': '!visible()' },
  styles: `
    :host {
      position: absolute;
      top: -6px;
      right: -6px;
      z-index: 2;
      pointer-events: auto;
      line-height: 0;
    }
    :host(.oculta) { display: none; }
    .medalla {
      display: inline-grid;
      place-items: center;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
    }
    .medalla--sm { width: 20px; height: 20px; }
    .medalla--md { width: 26px; height: 26px; }
    .medalla--lg { width: 34px; height: 34px; }
    svg { width: 88%; height: 88%; overflow: visible; }
    text { font: 800 9px 'Poppins', system-ui, sans-serif; fill: #fff; }
    .cinta { fill: #4f46e5; }
    .medalla--1 .disco { fill: #f59e0b; stroke: #fcd34d; stroke-width: 1.5; }
    .medalla--2 .disco { fill: #94a3b8; stroke: #e2e8f0; stroke-width: 1.5; }
    .medalla--3 .disco { fill: #c2773e; stroke: #f5b17a; stroke-width: 1.5; }
    .medalla--2 .cinta { fill: #6366f1; }
    .medalla--3 .cinta { fill: #818cf8; }
    @media (prefers-reduced-motion: no-preference) {
      .medalla { animation: aparecer 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s backwards; }
      .medalla--1 { animation: aparecer 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s backwards, brillar 2.4s ease-in-out 1.6s infinite; }
      .medalla:hover { animation: girar 0.6s ease; }
    }
    @keyframes aparecer {
      from { opacity: 0; transform: scale(0) rotate(-120deg); }
      to { opacity: 1; transform: none; }
    }
    @keyframes brillar {
      0%, 100% { box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18); }
      50% { box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.35), 0 3px 14px rgba(245, 158, 11, 0.5); }
    }
    @keyframes girar {
      from { transform: rotateY(0); }
      to { transform: rotateY(360deg); }
    }
  `,
})
export class Medalla {
  /** Puesto en el ranking (1, 2, 3...). null o > 3 = sin medalla. */
  lugar = input<number | null>(null);
  tamano = input<'sm' | 'md' | 'lg'>('md');

  visible = computed(() => {
    const l = this.lugar();
    return l !== null && l >= 1 && l <= 3;
  });
  nombre = computed(() => NOMBRES[this.lugar() ?? 0] ?? '');
}
