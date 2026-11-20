import { NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import {
  EJERCICIOS_RESUELTOS,
  EjercicioResuelto,
  TEMAS_RESUELTOS,
  TemaResuelto
} from '../../models/ejercicios-resueltos';
import { FORMULAS } from '../../models/formulas';
import { Graficas } from '../../components/graficas/graficas';
import { SumiDice } from '../../../../shared/components/sumi-dice/sumi-dice';
import { sumiListaResueltos, sumiPasoResuelto } from '../../../../shared/components/sumi-dice/dialogos';
import { TextoMatriz } from '../../components/texto-matriz/texto-matriz';
import { CalculadoraPasos } from '../../components/calculadora-pasos/calculadora-pasos';

type Nivel = 'todos' | 'Básico' | 'Intermedio' | 'Avanzado';
const POR_PAGINA = 12;
const CLAVE_VISTOS = 'saesu_resueltos_vistos';

function leerVistos(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(CLAVE_VISTOS) ?? '[]')); } catch { return new Set(); }
}

type Vista = 'ejercicios' | 'formulas' | 'graficas' | 'calculadora';

/**
 * Biblioteca de ejercicios resueltos paso a paso.
 * El estudiante elige un tema y un ejercicio, y descubre los pasos uno a uno
 * (con el porqué de cada uno) o los ve todos de una vez.
 */
@Component({
  selector: 'app-ejercicios-resueltos',
  standalone: true,
  imports: [NgClass, RouterLink, MatIconModule, Graficas, CalculadoraPasos, TextoMatriz, SumiDice],
  templateUrl: './ejercicios-resueltos.html',
  styleUrl: './ejercicios-resueltos.scss',
})
export class EjerciciosResueltos implements OnInit {
  private readonly ruta = inject(ActivatedRoute, { optional: true });

  /** /resueltos?tema=derivadas&ejercicio=g-der-3 abre directo ese ejercicio (viene de la práctica). */
  ngOnInit(): void {
    const q = this.ruta?.snapshot.queryParamMap;
    const tema = q?.get('tema');
    if (tema && this.temas.some(t => t.id === tema)) this.tema.set(tema as TemaResuelto);
    const id = q?.get('ejercicio');
    const e = id ? EJERCICIOS_RESUELTOS.find(x => x.id === id) : undefined;
    if (e) { this.tema.set(e.tema); this.abrir(e); }
  }

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

  /** Ejercicios que el estudiante ya terminó de ver (se guardan en este navegador). */
  vistos = signal<Set<string>>(leerVistos());
  readonly totalGeneral = EJERCICIOS_RESUELTOS.length;
  conteoPorTema = computed(() => {
    const m: Record<string, number> = {};
    for (const e of EJERCICIOS_RESUELTOS) m[e.tema] = (m[e.tema] ?? 0) + 1;
    return m;
  });
  vistosDelTema = computed(() => EJERCICIOS_RESUELTOS.filter(e => e.tema === this.tema() && this.vistos().has(e.id)).length);
  avanceTema = computed(() => Math.round((this.vistosDelTema() / Math.max(1, this.totalTema())) * 100));
  nombreTema = computed(() => this.temas.find(t => t.id === this.tema())?.nombre ?? '');
  avancePasos = computed(() => {
    const e = this.seleccionado();
    return e ? Math.round((this.visibles() / e.pasos.length) * 100) : 0;
  });
  private indiceActual = computed(() => {
    const e = this.seleccionado();
    return e ? this.ejercicios().findIndex(x => x.id === e.id) : -1;
  });
  anterior = computed(() => (this.indiceActual() > 0 ? this.ejercicios()[this.indiceActual() - 1] : null));
  siguiente = computed(() => {
    const i = this.indiceActual();
    return i >= 0 && i < this.ejercicios().length - 1 ? this.ejercicios()[i + 1] : null;
  });

  /** Lo que dice Sumi en la lista y dentro de cada ejercicio. */
  sumiLista = computed(() => sumiListaResueltos(this.tema(), this.nombreTema(), this.vistosDelTema(), this.totalTema()));
  sumiPaso = computed(() => {
    const e = this.seleccionado();
    return sumiPasoResuelto(this.visibles(), e?.pasos.length ?? 0, e?.nivel ?? 'Básico');
  });

  visto(e: EjercicioResuelto): boolean {
    return this.vistos().has(e.id);
  }

  private marcarVisto(): void {
    const e = this.seleccionado();
    if (!e || !this.terminado() || this.vistos().has(e.id)) return;
    const nuevo = new Set(this.vistos()).add(e.id);
    this.vistos.set(nuevo);
    try { localStorage.setItem(CLAVE_VISTOS, JSON.stringify([...nuevo])); } catch { /* modo privado */ }
  }

  claseNivel(n: string): string {
    return n === 'Básico' ? 'basico' : n === 'Intermedio' ? 'intermedio' : 'avanzado';
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
    this.marcarVisto();
  }

  verTodo(): void {
    const e = this.seleccionado();
    if (e) this.visibles.set(e.pasos.length);
    this.marcarVisto();
  }

  reiniciar(): void {
    this.visibles.set(0);
  }
}
