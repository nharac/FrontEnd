import { Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Elementos que muestran la "onda" al hacer clic. */
const CON_ONDA = 'button:not(.mat-mdc-menu-item):not(.mat-mdc-button-base), a.btn, .acceso-card, .acceso';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'SAESU';

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const alPresionar = (e: PointerEvent) => this.onda(e);
      document.addEventListener('pointerdown', alPresionar, { passive: true });
      destroyRef.onDestroy(() => document.removeEventListener('pointerdown', alPresionar));
    });
  }

  /** Dibuja un círculo que se expande desde el punto donde se hizo clic. */
  private onda(e: PointerEvent): void {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(CON_ONDA);
    if (!el || (el as HTMLButtonElement).disabled) return;
    const caja = el.getBoundingClientRect();
    const tam = Math.max(caja.width, caja.height) * 2;
    const onda = document.createElement('span');
    onda.className = 'saesu-onda';
    onda.style.width = onda.style.height = `${tam}px`;
    onda.style.left = `${e.clientX - caja.left - tam / 2}px`;
    onda.style.top = `${e.clientY - caja.top - tam / 2}px`;
    el.classList.add('saesu-onda-host');
    el.appendChild(onda);
    onda.addEventListener('animationend', () => onda.remove(), { once: true });
  }
}
