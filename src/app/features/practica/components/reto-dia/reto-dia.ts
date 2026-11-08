import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { PracticaService } from '../../services/practica.service';
import { Pregunta } from '../../models/practica.model';
import { PreguntaCard } from '../pregunta-card/pregunta-card';
import { Mascota } from '../../../../shared/components/mascota/mascota';
import { Confeti } from '../../../../shared/components/confeti/confeti';

/** Tamaño del banco que se recorre con el reto (si hay menos preguntas, se vuelve a la primera). */
const BANCO = 200;

/** Día del año (1–366), en la hora del navegador: el reto cambia a medianoche. */
export function diaDelAnio(d: Date): number {
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 86_400_000);
}

/** "2026-11-07" */
export function claveDia(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Reto del día: una pregunta del banco que cambia cada día (la misma para todos ese día).
 * Se resuelve aquí mismo; al acertarla queda marcado como superado en este navegador hasta mañana.
 */
@Component({
  selector: 'app-reto-dia',
  imports: [MatIconModule, PreguntaCard, Mascota, Confeti],
  template: `
    @if (pregunta(); as p) {
      <section class="reto" [class.reto--hecho]="superado()">
        @if (celebrar()) { <app-confeti [cantidad]="30" [alcance]="200" /> }
        <header class="reto__cabecera">
          <app-mascota [estado]="superado() ? 'celebra' : 'pensando'" [accesorio]="superado() ? 'trofeo' : 'lapiz'" [tamano]="58" />
          <div>
            <span class="reto__etiqueta"><mat-icon>local_fire_department</mat-icon> Reto del día</span>
            <h2>{{ superado() ? '¡Reto superado! Vuelve mañana por otro' : 'Una pregunta nueva cada día. ¿La resuelves?' }}</h2>
            <small>{{ nombreTema() }} · {{ nivel() }}</small>
          </div>
          @if (!abierto() && !superado()) {
            <button type="button" class="reto__btn" (click)="abierto.set(true)"><mat-icon>play_arrow</mat-icon> Aceptar reto</button>
          }
        </header>
        @if (abierto() && !superado()) {
          <app-pregunta-card [pregunta]="p" [numero]="1" [total]="1" (acertada)="alAcertar()" (siguiente)="abierto.set(false)" />
        }
      </section>
    }
  `,
})
export class RetoDia implements OnInit {
  private practica = inject(PracticaService);
  private readonly hoy = claveDia(new Date());

  pregunta = signal<Pregunta | null>(null);
  abierto = signal(false);
  superado = signal(this.leerSuperado());
  celebrar = signal(false);

  nombreTema = computed(() => ({ limites: 'Límites', derivadas: 'Derivadas', integrales: 'Integrales' } as Record<string, string>)[this.pregunta()?.tema ?? ''] ?? '');

  nivel = computed(() => ({ basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' } as Record<string, string>)[this.pregunta()?.dificultad ?? ''] ?? '');

  ngOnInit(): void {
    const pagina = diaDelAnio(new Date()) % BANCO;
    this.practica.listarPreguntas({ page: pagina, size: 1 }).subscribe({
      next: (l) => {
        if (l?.length) { this.pregunta.set(l[0]); return; }
        // El banco tiene menos preguntas: se usa la primera
        this.practica.listarPreguntas({ page: 0, size: 1 }).subscribe({ next: (r) => this.pregunta.set(r?.[0] ?? null), error: () => {} });
      },
      error: () => this.pregunta.set(null)
    });
  }

  alAcertar(): void {
    this.superado.set(true);
    this.celebrar.set(true);
    try { localStorage.setItem('saesu-reto', this.hoy); } catch { /* sin almacenamiento */ }
  }

  private leerSuperado(): boolean {
    try { return localStorage.getItem('saesu-reto') === this.hoy; } catch { return false; }
  }
}
