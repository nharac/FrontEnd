import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { FUNCIONES, RANGO, area, trazo } from './funciones';

/**
 * Gráficas interactivas: el estudiante elige una función, mueve un punto para ver
 * la recta tangente (la derivada) y marca un intervalo para ver el área (la integral).
 */
@Component({
  selector: 'app-graficas',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './graficas.html',
  styleUrl: './graficas.scss',
})
export class Graficas {
  readonly lado = 320;
  readonly rango = RANGO;
  readonly funciones = FUNCIONES;
  readonly marcas = [-4, -3, -2, -1, 1, 2, 3, 4];

  funcionId = signal(FUNCIONES[0].id);
  x0 = signal(1);
  verDerivada = signal(false);
  verArea = signal(false);
  a = signal(0);
  b = signal(2);

  funcion = computed(() => FUNCIONES.find(f => f.id === this.funcionId()) ?? FUNCIONES[0]);
  curva = computed(() => trazo(this.funcion().f, this.lado));
  curvaDerivada = computed(() => trazo(this.funcion().df, this.lado));

  /** Punto de tangencia y pendiente en x0. */
  y0 = computed(() => this.funcion().f(this.x0()));
  pendiente = computed(() => this.funcion().df(this.x0()));
  tangente = computed(() => {
    const x0 = this.x0(), y0 = this.y0(), m = this.pendiente();
    return trazo(x => y0 + m * (x - x0), this.lado);
  });

  desde = computed(() => Math.min(this.a(), this.b()));
  hasta = computed(() => Math.max(this.a(), this.b()));
  region = computed(() => area(this.funcion().f, this.desde(), this.hasta(), this.lado));
  integral = computed(() => this.funcion().F(this.hasta()) - this.funcion().F(this.desde()));

  /** Pasa una coordenada del plano a píxeles del lienzo. */
  px(v: number): number {
    return (v + RANGO) * (this.lado / (2 * RANGO));
  }
  py(v: number): number {
    return (RANGO - v) * (this.lado / (2 * RANGO));
  }

  numero(e: Event): number {
    return Number((e.target as HTMLInputElement).value);
  }
}
