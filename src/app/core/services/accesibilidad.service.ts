import { Injectable, signal } from '@angular/core';

const CLAVE = 'saesu-accesibilidad';

export type OpcionAccesibilidad = 'textoGrande' | 'altoContraste' | 'sinAnimaciones';

const CLASES: Record<OpcionAccesibilidad, string> = {
  textoGrande: 'texto-grande',
  altoContraste: 'alto-contraste',
  sinAnimaciones: 'sin-animaciones',
};

/**
 * Preferencias de accesibilidad de este navegador: texto más grande, alto contraste y sin animaciones.
 * Cada una pone una clase en <html> (los estilos están en src/tema-oscuro.scss).
 * "Sin animaciones" arranca activado si el sistema pide reducir el movimiento.
 */
@Injectable({ providedIn: 'root' })
export class AccesibilidadService {
  readonly textoGrande = signal(false);
  readonly altoContraste = signal(false);
  readonly sinAnimaciones = signal(false);

  constructor() {
    const guardado = this.leer();
    const reducir = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.poner('textoGrande', !!guardado?.textoGrande);
    this.poner('altoContraste', !!guardado?.altoContraste);
    this.poner('sinAnimaciones', guardado?.sinAnimaciones ?? reducir);
  }

  alternar(opcion: OpcionAccesibilidad): void {
    this.poner(opcion, !this[opcion]());
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        textoGrande: this.textoGrande(), altoContraste: this.altoContraste(), sinAnimaciones: this.sinAnimaciones(),
      }));
    } catch { /* modo privado */ }
  }

  private poner(opcion: OpcionAccesibilidad, valor: boolean): void {
    this[opcion].set(valor);
    document.documentElement.classList.toggle(CLASES[opcion], valor);
  }

  private leer(): Partial<Record<OpcionAccesibilidad, boolean>> | null {
    try {
      const v = localStorage.getItem(CLAVE);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  }
}
