import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { TemaService } from '../../../core/services/tema.service';

/** Botón sol / luna para cambiar entre modo claro y oscuro (va en las barras de navegación). */
@Component({
  selector: 'app-boton-tema',
  imports: [MatIconModule],
  template: `
    <button type="button" class="boton-tema" (click)="tema.alternar()"
            [attr.aria-label]="tema.oscuro() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            [attr.title]="tema.oscuro() ? 'Modo claro' : 'Modo oscuro'" [attr.aria-pressed]="tema.oscuro()">
      <mat-icon>{{ tema.oscuro() ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `,
  styles: [`
    .boton-tema {
      width: 40px; height: 40px; display: grid; place-items: center; flex: none;
      border: 0; border-radius: 50%; background: #eef2ff; color: #4f46e5; cursor: pointer;
      transition: background 0.2s, transform 0.3s;
    }
    .boton-tema:hover { background: #e0e7ff; transform: rotate(-20deg); }
    .boton-tema:focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; }
  `],
})
export class BotonTema {
  readonly tema = inject(TemaService);
}
