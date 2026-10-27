import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

import { Aviso } from '../../shared/components/aviso/aviso';
import { DatosAviso } from '../../shared/components/aviso/aviso.model';

/**
 * Reemplaza a MatSnackBar en toda la app (ver app.config.ts):
 * cada snackBar.open(mensaje, accion, config) se muestra con el componente Aviso
 * (tarjeta blanca con ícono y color según el tipo) en vez de la barra negra por defecto.
 * El tipo (éxito / error / info) se deduce del texto, así no hubo que cambiar cada llamada.
 */
@Injectable()
export class SaesuSnackBar extends MatSnackBar {

  override open(message: string, action = '', config?: MatSnackBarConfig): MatSnackBarRef<TextOnlySnackBar> {
    const datos: DatosAviso = { mensaje: message, accion: action, ...(config?.data ?? {}) };
    const ref = this.openFromComponent(Aviso, { ...config, data: datos, panelClass: unir(config?.panelClass) });
    // Quien llama solo usa onAction()/dismiss(), que existen igual en cualquier MatSnackBarRef
    return ref as unknown as MatSnackBarRef<TextOnlySnackBar>;
  }

  override openFromComponent<T, D = unknown>(component: import('@angular/cdk/portal').ComponentType<T>, config?: MatSnackBarConfig<D>): MatSnackBarRef<T> {
    return super.openFromComponent(component, {
      ...config,
      panelClass: component === (Aviso as unknown) ? unir(config?.panelClass) : config?.panelClass,
    });
  }
}

function unir(panelClass?: string | string[]): string[] {
  const actual = Array.isArray(panelClass) ? panelClass : panelClass ? [panelClass] : [];
  return actual.includes('saesu-aviso') ? actual : [...actual, 'saesu-aviso'];
}
