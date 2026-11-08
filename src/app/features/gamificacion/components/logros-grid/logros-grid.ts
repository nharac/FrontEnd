import { Component, computed, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { CATEGORIAS, CategoriaLogro, Logro, RAREZAS, Rareza, avanceDe } from '../../models/logro.model';
import { Insignia } from '../insignia/insignia';

export type FiltroEstado = 'todos' | 'obtenidos' | 'pendientes';

/**
 * Logros del estudiante: resumen por rareza, vitrina de insignias especiales (retos)
 * y el resto de logros por categoría, con filtros y el avance de cada uno.
 * Los datos los trae la página (perfil) para no pedirlos dos veces.
 */
@Component({
  selector: 'app-logros-grid',
  imports: [DatePipe, DecimalPipe, MatIconModule, Insignia],
  templateUrl: './logros-grid.html',
  styleUrl: './logros-grid.scss',
})
export class LogrosGrid {

  readonly logros = input<Logro[]>([]);
  readonly cargando = input(false);
  readonly error = input(false);

  readonly categorias = CATEGORIAS;
  readonly rarezas = Object.keys(RAREZAS) as Rareza[];
  readonly nombreRareza = (r: Rareza) => RAREZAS[r].nombre;
  readonly avance = avanceDe;

  categoria = signal<CategoriaLogro | 'TODOS'>('TODOS');
  estado = signal<FiltroEstado>('todos');

  /** Los que se ganan jugando (la exclusiva no cuenta para el total). */
  private ganables = computed(() => this.logros().filter(l => l.rareza !== 'EXCLUSIVO'));
  total = computed(() => this.ganables().length);
  obtenidos = computed(() => this.ganables().filter(l => l.obtenido).length);
  porcentaje = computed(() => this.total() ? Math.round(this.obtenidos() / this.total() * 100) : 0);

  /** Insignias especiales: la exclusiva primero, luego las obtenidas y después por avance. */
  retos = computed(() => this.ordenar(this.logros().filter(l => l.categoria === 'RETOS'))
    .sort((a, b) => Number(b.rareza === 'EXCLUSIVO') - Number(a.rareza === 'EXCLUSIVO')));

  /** Por rareza: cuántos tiene de cuántos hay (sin la exclusiva, que no se gana jugando). */
  porRareza = computed(() => this.rarezas.filter(r => r !== 'EXCLUSIVO').map(r => {
    const deEsta = this.logros().filter(l => l.rareza === r);
    return { rareza: r, nombre: RAREZAS[r].nombre, tiene: deEsta.filter(l => l.obtenido).length, total: deEsta.length };
  }));

  /** Cuántos logros (sin retos) hay por categoría, para las pestañas. */
  conteo = computed(() => {
    const c: Record<string, { tiene: number; total: number }> = { TODOS: { tiene: 0, total: 0 } };
    for (const l of this.logros()) {
      if (l.categoria === 'RETOS') continue;
      for (const k of [l.categoria, 'TODOS']) {
        c[k] ??= { tiene: 0, total: 0 };
        c[k].total++;
        if (l.obtenido) c[k].tiene++;
      }
    }
    return c;
  });

  visibles = computed(() => {
    const cat = this.categoria();
    const est = this.estado();
    return this.ordenar(this.logros().filter(l =>
      l.categoria !== 'RETOS'
      && (cat === 'TODOS' || l.categoria === cat)
      && (est === 'todos' || (est === 'obtenidos') === l.obtenido)));
  });

  /** Obtenidos primero (el más reciente arriba); después los pendientes con más avance. */
  private ordenar(lista: Logro[]): Logro[] {
    return [...lista].sort((a, b) => {
      if (a.obtenido !== b.obtenido) return a.obtenido ? -1 : 1;
      if (a.obtenido) return (b.fechaObtenido ?? '').localeCompare(a.fechaObtenido ?? '');
      return avanceDe(b) - avanceDe(a);
    });
  }

  etiqueta(l: Logro): string {
    const estado = l.obtenido ? 'obtenido' : `pendiente, ${l.progreso} de ${l.meta}`;
    return `${l.nombre}, ${RAREZAS[l.rareza].nombre}, ${estado}: ${l.descripcion}`;
  }
}
