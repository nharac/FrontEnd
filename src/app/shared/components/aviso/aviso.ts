import { Component, computed, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { DatosAviso, TipoAviso, inferirTipo, saludoSegunHora } from './aviso.model';

const ICONOS: Record<TipoAviso, string> = {
  exito: 'check_circle',
  error: 'error',
  info: 'info',
  bienvenida: 'waving_hand',
};

/**
 * Aviso flotante de SAESU (reemplaza la barra negra por defecto de Angular Material).
 * Lo abre SaesuSnackBar para todos los snackBar.open(...) de la app,
 * y el login lo usa directamente para la bienvenida.
 */
@Component({
  selector: 'app-aviso',
  imports: [MatIconModule],
  templateUrl: './aviso.html',
  styleUrl: './aviso.scss',
  host: {
    '[class]': "'aviso aviso--' + tipo()",
    'role': 'status',
  },
})
export class Aviso {

  private ref = inject<MatSnackBarRef<Aviso>>(MatSnackBarRef);
  readonly datos = inject<DatosAviso>(MAT_SNACK_BAR_DATA);

  tipo = computed<TipoAviso>(() => this.datos.tipo ?? inferirTipo(this.datos.mensaje));
  icono = computed(() => ICONOS[this.tipo()]);

  /** "Cerrar" se muestra como ✕; otras acciones (ej. "Deshacer") como botón de texto. */
  accionTexto = computed(() => {
    const a = (this.datos.accion ?? '').trim();
    return a && a.toLowerCase() !== 'cerrar' ? a : '';
  });

  /** Duración del aviso, para la barrita que se va vaciando. */
  readonly duracionMs = this.ref.containerInstance.snackBarConfig.duration ?? 0;

  // Bienvenida
  readonly saludo = saludoSegunHora();
  readonly primerNombre = (this.datos.nombre ?? '').trim().split(/\s+/)[0] || '';
  readonly iniciales = (() => {
    const p = (this.datos.nombre ?? '?').trim().split(/\s+/);
    return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  })();

  accion(): void {
    this.ref.dismissWithAction();
  }

  cerrar(): void {
    this.ref.dismiss();
  }
}
