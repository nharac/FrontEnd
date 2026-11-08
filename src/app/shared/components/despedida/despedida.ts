import { Component, inject } from '@angular/core';

import { DespedidaService } from '../../../core/services/despedida.service';
import { Mascota } from '../mascota/mascota';

/**
 * Cortina de despedida al cerrar sesión (va una sola vez en app.html).
 * Estilos en src/despedida.scss.
 */
@Component({
  selector: 'app-despedida',
  imports: [Mascota],
  template: `
    @if (servicio.actual(); as d) {
      <div class="despedida" [class.despedida--saliendo]="d.fase === 'saliendo'" role="status" aria-live="polite">
        <span class="despedida__burbuja despedida__burbuja--1" aria-hidden="true"></span>
        <span class="despedida__burbuja despedida__burbuja--2" aria-hidden="true"></span>
        <div class="despedida__centro">
          <app-mascota class="despedida__sumi" estado="saludo" [tamano]="150" />
          <h2>¡Hasta pronto{{ d.nombre ? ', ' + d.nombre : '' }}!</h2>
          <p>Cerrando tu sesión de forma segura…</p>
          <span class="despedida__barra" aria-hidden="true"><i></i></span>
        </div>
      </div>
    }
  `,
})
export class DespedidaComponent {
  readonly servicio = inject(DespedidaService);
}
