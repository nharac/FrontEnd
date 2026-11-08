import { Injectable, signal } from '@angular/core';

/** Datos para la bienvenida animada de Sumi al entrar a SAESU. */
export interface Bienvenida {
  nombre: string;
  /** true = acaba de crear la cuenta (primera vez); false = vuelve a entrar. */
  nuevo: boolean;
  esDocente: boolean;
  racha?: number | null;
  puntos?: number | null;
}

/**
 * El login y la verificación del correo piden la bienvenida y el componente BienvenidaSumi
 * (en la raíz de la app) la muestra encima de la pantalla a la que se navega.
 */
@Injectable({ providedIn: 'root' })
export class BienvenidaService {
  readonly actual = signal<Bienvenida | null>(null);

  mostrar(datos: Bienvenida): void {
    this.actual.set(datos);
  }

  cerrar(): void {
    this.actual.set(null);
  }
}
