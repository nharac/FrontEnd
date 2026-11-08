import { Injectable, signal } from '@angular/core';

const CLAVE = 'saesu-tema';

/**
 * Modo claro / oscuro. Se guarda en este navegador y pone la clase `tema-oscuro` en <html>
 * (los colores oscuros están en src/tema-oscuro.scss).
 * La primera vez sigue la preferencia del sistema operativo.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly oscuro = signal(false);

  constructor() {
    this.aplicar(this.leer());
  }

  alternar(): void {
    this.aplicar(!this.oscuro());
    try { localStorage.setItem(CLAVE, this.oscuro() ? 'oscuro' : 'claro'); } catch { /* modo privado */ }
  }

  private leer(): boolean {
    try {
      const guardado = localStorage.getItem(CLAVE);
      if (guardado) return guardado === 'oscuro';
    } catch { /* sin almacenamiento */ }
    return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private aplicar(oscuro: boolean): void {
    this.oscuro.set(oscuro);
    document.documentElement.classList.toggle('tema-oscuro', oscuro);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', oscuro ? '#0f172a' : '#1F3247');
  }
}
