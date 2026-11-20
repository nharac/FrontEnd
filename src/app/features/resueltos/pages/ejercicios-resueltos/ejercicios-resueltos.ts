import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import {
  EJERCICIOS_RESUELTOS,
  EjercicioResuelto,
  TEMAS_RESUELTOS,
  TemaResuelto
} from '../../models/ejercicios-resueltos';
import { FORMULAS } from '../../models/formulas';
import { Graficas } from '../../components/graficas/graficas';
import { TextoMatriz } from '../../components/texto-matriz/texto-matriz';
import { CalculadoraPasos } from '../../components/calculadora-pasos/calculadora-pasos';

type Nivel = 'todos' | 'Básico' | 'Intermedio' | 'Avanzado';
const POR_PAGINA = 12;

type Vista = 'ejercicios' | 'formulas' | 'graficas' | 'calculadora';

/**
 * Biblioteca de ejercicios resueltos paso a paso.
 * El estudiante elige un tema y un ejercicio, y descubre los pasos uno a uno
 * (con el porqué de cada uno) o los ve todos de una vez.
 */
@Component({
  selector: 'app-ejercicios-resueltos',
  standalone: true,
  imports: [RouterLink, MatIconModule, Graficas, CalculadoraPasos, TextoMatriz],
  templateUrl: './ejercicios-resueltos.html',
  styleUrl: './ejercicios-resueltos.scss',
})
export class EjerciciosResueltos {
  readonly temas = TEMAS_RESUELTOS;

  /** Pestaña activa: ejercicios resueltos o fórmulas de consulta. */
  vista = signal<Vista>('ejercicios');
  tema = signal<TemaResuelto>('fundamentos');
  seleccionado = signal<EjercicioResuelto | null>(null);
  /** Cuántos pasos se están mostrando del ejercicio seleccionado. */
  visibles = signal(0);

  formulas = computed(() => FORMULAS[this.tema()]);
  readonly niveles: Nivel[] = ['todos', 'Básico', 'Intermedio', 'Avanzado'];
  nivel = signal<Nivel>('todos');
  busqueda = signal('');
  mostrar = signal(POR_PAGINA);

  /** Ejercicios del tema con el filtro de nivel y la búsqueda por título o enunciado. */
  ejercicios = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    return EJERCICIOS_RESUELTOS.filter(e => e.tema === this.tema()
      && (this.nivel() === 'todos' || e.nivel === this.nivel())
      && (!q || e.titulo.toLowerCase().includes(q) || e.enunciado.toLowerCase().includes(q)));
  });
  visiblesLista = computed(() => this.ejercicios().slice(0, this.mostrar()));
  totalTema = computed(() => EJERCICIOS_RESUELTOS.filter(e => e.tema === this.tema()).length);

  elegirNivel(n: Nivel): void {
    this.nivel.set(n);
    this.mostrar.set(POR_PAGINA);
  }

  buscar(texto: string): void {
    this.busqueda.set(texto);
    this.mostrar.set(POR_PAGINA);
  }

  verMas(): void {
    this.mostrar.update(m => m + POR_PAGINA);
  }
  pasosVisibles = computed(() => this.seleccionado()?.pasos.slice(0, this.visibles()) ?? []);
  terminado = computed(() => {
    const e = this.seleccionado();
    return !!e && this.visibles() >= e.pasos.length;
  });

  elegirTema(t: TemaResuelto): void {
    this.tema.set(t);
    this.seleccionado.set(null);
    this.mostrar.set(POR_PAGINA);
  }

  cambiarVista(v: Vista): void {
    this.vista.set(v);
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
