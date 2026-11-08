import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { reglasPassword } from '../../utils/password';

/** Nombre y color de cada nivel (0 a 5 reglas cumplidas). */
const NIVELES = [
  { nombre: 'Muy débil', clase: 'n0' },
  { nombre: 'Muy débil', clase: 'n1' },
  { nombre: 'Débil', clase: 'n2' },
  { nombre: 'Regular', clase: 'n3' },
  { nombre: 'Casi lista', clase: 'n4' },
  { nombre: 'Segura', clase: 'n5' },
];

/**
 * Barra de seguridad de la contraseña y los requisitos que faltan, en vivo.
 * Uso: <app-fuerza-password [password]="valor" />
 * Estilos en src/auth-sumi.scss.
 */
@Component({
  selector: 'app-fuerza-password',
  imports: [MatIconModule],
  template: `
    <div class="fp__barra" role="meter" aria-label="Seguridad de la contraseña"
         aria-valuemin="0" aria-valuemax="5" [attr.aria-valuenow]="cumplidas()" [attr.aria-valuetext]="nivel().nombre">
      @for (i of segmentos; track i) { <span [class.on]="i < cumplidas()"></span> }
      <b>{{ nivel().nombre }}</b>
    </div>
    <ul class="fp__reglas" aria-label="Requisitos de la contraseña">
      @for (r of reglas(); track r.texto) {
        <li [class.ok]="r.ok" [attr.title]="r.texto">
          <mat-icon aria-hidden="true">{{ r.ok ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>{{ r.corto }}
        </li>
      }
    </ul>
  `,
  host: { '[class]': '"fp fp--" + nivel().clase' },
})
export class FuerzaPassword {
  password = input('');

  readonly segmentos = [0, 1, 2, 3, 4];
  reglas = computed(() => reglasPassword(this.password() ?? ''));
  cumplidas = computed(() => this.reglas().filter(r => r.ok).length);
  nivel = computed(() => NIVELES[this.cumplidas()]);
}
