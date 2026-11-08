import { Injectable, signal } from '@angular/core';

/** Lo que muestra la pantalla de despedida. */
export interface Despedida {
  nombre: string;
  /** 'entrando' = cubre la pantalla; 'saliendo' = se desvanece sobre el login. */
  fase: 'entrando' | 'saliendo';
}

/** Duración de la animación antes de cerrar la sesión (ms). */
export const DURACION_DESPEDIDA = 1600;
const DURACION_SALIDA = 450;

/**
 * Animación al cerrar sesión: Sumi se despide, y mientras cubre la pantalla se cierra la sesión
 * y se va al login; luego la cortina se desvanece.
 * Con movimiento reducido (o en pruebas, sin matchMedia) se cierra la sesión de inmediato.
 */
@Injectable({ providedIn: 'root' })
export class DespedidaService {
  readonly actual = signal<Despedida | null>(null);
  private timers: ReturnType<typeof setTimeout>[] = [];

  cerrarSesion(nombre: string, cerrar: () => void): void {
    if (this.actual()) return; // doble clic
    const quieto = typeof matchMedia !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (quieto) {
      cerrar();
      return;
    }
    this.actual.set({ nombre: (nombre || '').trim().split(/\s+/)[0], fase: 'entrando' });
    this.timers.push(setTimeout(() => {
      cerrar();
      this.actual.update(d => (d ? { ...d, fase: 'saliendo' } : d));
      this.timers.push(setTimeout(() => this.actual.set(null), DURACION_SALIDA));
    }, DURACION_DESPEDIDA));
  }

  /** Para pruebas: corta la animación. */
  cancelar(): void {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    this.actual.set(null);
  }
}
