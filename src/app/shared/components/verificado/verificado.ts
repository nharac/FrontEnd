import { Component, input } from '@angular/core';

/**
 * Chulito azul de cuenta verificada para los docentes (como en YouTube o Instagram).
 * Uso: <app-verificado />  ·  <app-verificado [tam]="20" />
 */
@Component({
  selector: 'app-verificado',
  host: {
    class: 'verificado',
    role: 'img',
    'aria-label': 'Docente verificado',
    title: 'Docente verificado de la Universidad de Cundinamarca',
    '[style.--tam.px]': 'tam()',
  },
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <polygon class="verificado__sello" stroke-width="1.6" stroke-linejoin="round"
        points="12.00,1.00 14.48,2.73 17.50,2.47 18.79,5.21 21.53,6.50 21.27,9.52 23.00,12.00 21.27,14.48 21.53,17.50 18.79,18.79 17.50,21.53 14.48,21.27 12.00,23.00 9.52,21.27 6.50,21.53 5.21,18.79 2.47,17.50 2.73,14.48 1.00,12.00 2.73,9.52 2.47,6.50 5.21,5.21 6.50,2.47 9.52,2.73" />
      <path class="verificado__check" d="M7.4 12.4l3 3 6.2-6.6" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
})
export class Verificado {
  /** Tamaño en píxeles (por defecto 16, crece con el texto en títulos). */
  readonly tam = input(16);
}
