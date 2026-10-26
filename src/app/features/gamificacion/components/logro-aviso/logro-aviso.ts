import { Component, OnDestroy, effect, input, signal, untracked } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Logro } from '../../models/logro.model';
import { Confeti } from '../../../../shared/components/confeti/confeti';

/**
 * Aviso flotante "¡Logro desbloqueado!" que aparece unos segundos
 * cuando el backend devuelve nuevosLogros.
 */
@Component({
  selector: 'app-logro-aviso',
  imports: [MatIconModule, Confeti],
  template: `
    @if (visible(); as l) {
      <div class="aviso" role="status" aria-live="polite">
        <app-confeti [cantidad]="24" [alcance]="180" />
        <span class="aviso__icono"><mat-icon>{{ l.icono }}</mat-icon></span>
        <div>
          <small>¡Logro desbloqueado!</small>
          <strong>{{ l.nombre }}</strong>
          <span>{{ l.descripcion }}</span>
        </div>
      </div>
    }
  `,
  styles: `
    .aviso {
      position: fixed;
      left: 50%;
      bottom: 28px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 14px;
      max-width: calc(100vw - 32px);
      padding: 14px 22px 14px 14px;
      border-radius: 18px;
      background: #1f2937;
      color: #fff;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
      transform: translateX(-50%);
      animation: entrar 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
    }
    .aviso div { display: flex; flex-direction: column; line-height: 1.25; }
    small { color: #fbbf24; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
    strong { font-size: 16px; }
    span { font-size: 13px; color: #d1d5db; }
    .aviso__icono {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #f97316);
      animation: girar 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards;
    }
    @keyframes entrar {
      from { opacity: 0; transform: translate(-50%, 40px) scale(0.9); }
      to { opacity: 1; transform: translate(-50%, 0) scale(1); }
    }
    @keyframes girar {
      from { transform: rotate(-180deg) scale(0.3); }
      to { transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .aviso, .aviso__icono { animation: none; }
    }
  `,
})
export class LogroAviso implements OnDestroy {
  /** Logros recién desbloqueados; se muestran uno tras otro. */
  logros = input<Logro[]>([]);

  visible = signal<Logro | null>(null);
  private cola: Logro[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const nuevos = this.logros();
      untracked(() => {
        if (!nuevos?.length) return;
        this.cola.push(...nuevos);
        if (!this.visible()) this.siguiente();
      });
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  private siguiente(): void {
    const l = this.cola.shift() ?? null;
    this.visible.set(l);
    if (l) {
      this.timer = setTimeout(() => this.siguiente(), 4000);
    }
  }
}
