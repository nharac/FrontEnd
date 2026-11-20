import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import {
  EJERCICIOS_RESUELTOS,
  EjercicioResuelto,
  TEMAS_RESUELTOS,
  TemaResuelto
} from '../../models/ejercicios-resueltos';

/**
 * Biblioteca de ejercicios resueltos paso a paso.
 * El estudiante elige un tema y un ejercicio, y descubre los pasos uno a uno
 * (con el porqué de cada uno) o los ve todos de una vez.
 */
@Component({
  selector: 'app-ejercicios-resueltos',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './ejercicios-resueltos.html',
  styleUrl: './ejercicios-resueltos.scss',
})
export class EjerciciosResueltos {
  readonly temas = TEMAS_RESUELTOS;

  tema = signal<TemaResuelto>('fundamentos');
  seleccionado = signal<EjercicioResuelto | null>(null);
  /** Cuántos pasos se están mostrando del ejercicio seleccionado. */
  visibles = signal(0);

  ejercicios = computed(() => EJERCICIOS_RESUELTOS.filter(e => e.tema === this.tema()));
  pasosVisibles = computed(() => this.seleccionado()?.pasos.slice(0, this.visibles()) ?? []);
  terminado = computed(() => {
    const e = this.seleccionado();
    return !!e && this.visibles() >= e.pasos.length;
  });

  elegirTema(t: TemaResuelto): void {
    this.tema.set(t);
    this.seleccionado.set(null);
  }

  abrir(e: EjercicioResuelto): void {
    this.seleccionado.set(e);
    this.visibles.set(0);
  }

  volver(): void {
    this.seleccionado.set(null);
  }

  siguientePaso(): void {
    const e = this.seleccionado();
    if (e && this.visibles() < e.pasos.length) this.visibles.update(v => v + 1);
  }

  verTodo(): void {
    const e = this.seleccionado();
    if (e) this.visibles.set(e.pasos.length);
  }

  reiniciar(): void {
    this.visibles.set(0);
  }
}
