import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { Notificacion, NotificacionesService } from '../../../core/services/notificaciones.service';

const ICONOS: Record<string, string> = {
  RETO: 'sports_kabaddi', RETO_RESULTADO: 'emoji_events', TAREA: 'assignment', LOGRO: 'military_tech', FORO: 'forum',
  EN_VIVO: 'bolt', TORNEO: 'workspace_premium', RECORDATORIO: 'alarm',
};

/** Hace cuánto pasó, en palabras cortas. */
export function haceCuanto(fecha: string, ahora = Date.now()): string {
  const min = Math.max(0, Math.round((ahora - new Date(fecha).getTime()) / 60000));
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'ayer' : `hace ${d} días`;
}

/** Campanita de notificaciones (barra de navegación). Revisa cada minuto si hay nuevas. */
@Component({
  selector: 'app-campanita',
  standalone: true,
  imports: [MatIconModule, MatMenuModule],
  template: `
    <button type="button" class="cp-boton" [matMenuTriggerFor]="panel" (menuOpened)="abrir()"
            [attr.aria-label]="'Notificaciones' + (servicio.noLeidas() ? ': ' + servicio.noLeidas() + ' sin leer' : '')">
      <mat-icon>notifications</mat-icon>
      @if (servicio.noLeidas()) { <b class="cp-globo">{{ servicio.noLeidas() > 9 ? '9+' : servicio.noLeidas() }}</b> }
    </button>
    <mat-menu #panel="matMenu" xPosition="before" class="cp-menu">
      <div class="cp-panel" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()" role="presentation">
        <div class="cp-cabeza">
          <strong>Notificaciones</strong>
          @if (servicio.noLeidas()) { <button type="button" class="cp-todas" (click)="leerTodas()">Marcar todas como leídas</button> }
        </div>
        @if (cargando()) {
          <p class="cp-vacio">Cargando…</p>
        } @else if (!lista().length) {
          <p class="cp-vacio"><mat-icon>notifications_off</mat-icon> No tienes notificaciones todavía.</p>
        } @else {
          <ul class="cp-lista">
            @for (n of lista(); track n.id) {
              <li>
                <button type="button" class="cp-item" [class.cp-item--nueva]="!n.leida" (click)="ir(n)">
                  <span class="cp-icono" [attr.data-tipo]="n.tipo"><mat-icon>{{ icono(n.tipo) }}</mat-icon></span>
                  <span class="cp-texto">
                    <strong>{{ n.titulo }}</strong>
                    @if (n.mensaje) { <small>{{ n.mensaje }}</small> }
                    <em>{{ hace(n.creadaEn) }}</em>
                  </span>
                </button>
              </li>
            }
          </ul>
        }
      </div>
    </mat-menu>
  `,
  styles: [`
    :host { display: inline-flex; }
    .cp-boton { position: relative; width: 40px; height: 40px; display: grid; place-items: center; border: 0; border-radius: 50%;
      background: #eef2ff; color: #4f46e5; cursor: pointer; }
    .cp-boton:hover { background: #e0e7ff; }
    .cp-globo { position: absolute; top: -2px; right: -2px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 999px; display: grid; place-items: center;
      font-size: 11px; color: #fff; background: #e11d48; border: 2px solid #fff; }
  `],
})
export class Campanita implements OnInit {
  readonly servicio = inject(NotificacionesService);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);

  lista = signal<Notificacion[]>([]);
  cargando = signal(false);

  ngOnInit(): void {
    this.revisar();
    const t = setInterval(() => this.revisar(), 60_000);
    this.destroy.onDestroy(() => clearInterval(t));
  }

  private revisar(): void {
    this.servicio.contar().subscribe({ error: () => { /* sin conexión: se intenta en el siguiente minuto */ } });
  }

  abrir(): void {
    this.cargando.set(true);
    this.servicio.bandeja().subscribe({
      next: b => { this.lista.set(b.notificaciones); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  ir(n: Notificacion): void {
    if (!n.leida) {
      this.lista.update(l => l.map(x => (x.id === n.id ? { ...x, leida: true } : x)));
      this.servicio.marcarLeida(n.id).subscribe({ error: () => {} });
    }
    if (n.enlace) this.router.navigateByUrl(n.enlace);
  }

  leerTodas(): void {
    this.lista.update(l => l.map(x => ({ ...x, leida: true })));
    this.servicio.marcarTodas().subscribe({ error: () => {} });
  }

  icono(tipo: string): string {
    return ICONOS[tipo] ?? 'notifications';
  }

  hace(fecha: string): string {
    return haceCuanto(fecha);
  }
}
