import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

import { PracticaService } from '../../services/practica.service';
import { Pregunta, TEMAS, Tema } from '../../models/practica.model';

/** Preguntas básicas por tema en el diagnóstico. */
export const POR_TEMA = 2;
/** Clave local donde se recuerda el último resultado. */
export const CLAVE_DIAGNOSTICO = 'saesu_diagnostico';

export interface ResultadoTema { tema: Tema; nombre: string; aciertos: number; total: number; }

/** Primer tema (en orden de aprendizaje) en el que no acertó todo; si acertó todo, el último. */
export function temaRecomendado(resultados: ResultadoTema[]): ResultadoTema | null {
  if (!resultados.length) return null;
  return resultados.find(r => r.aciertos < r.total) ?? resultados[resultados.length - 1];
}

type Etapa = 'inicio' | 'cargando' | 'preguntas' | 'resultado' | 'error';

/**
 * Diagnóstico inicial: 2 preguntas básicas de cada tema para saber qué bases le faltan
 * al estudiante y recomendarle por dónde empezar su ruta.
 */
@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './diagnostico.html',
  styleUrl: './diagnostico.scss',
})
export class Diagnostico {
  private readonly practica = inject(PracticaService);

  etapa = signal<Etapa>('inicio');
  preguntas = signal<Pregunta[]>([]);
  actual = signal(0);
  elegida = signal<number | null>(null);
  enviando = signal(false);
  aciertos = signal<Record<number, boolean>>({});

  pregunta = computed(() => this.preguntas()[this.actual()] ?? null);
  nombreTema = computed(() => TEMAS.find(t => t.id === this.pregunta()?.tema)?.nombre ?? '');

  resultados = computed<ResultadoTema[]>(() => TEMAS.map(t => {
    const del = this.preguntas().filter(p => p.tema === t.id);
    return { tema: t.id, nombre: t.nombre, total: del.length, aciertos: del.filter(p => this.aciertos()[p.id]).length };
  }).filter(r => r.total > 0));

  recomendado = computed(() => temaRecomendado(this.resultados()));

  empezar(): void {
    this.etapa.set('cargando');
    forkJoin(TEMAS.map(t => this.practica.sesion({ tema: t.id, dificultad: 'basico', size: POR_TEMA }))).subscribe({
      next: listas => {
        const todas = listas.flatMap(l => l.slice(0, POR_TEMA));
        if (!todas.length) { this.etapa.set('error'); return; }
        this.preguntas.set(todas);
        this.actual.set(0);
        this.aciertos.set({});
        this.elegida.set(null);
        this.etapa.set('preguntas');
      },
      error: () => this.etapa.set('error'),
    });
  }

  responder(): void {
    const p = this.pregunta();
    const opcion = this.elegida();
    if (!p || opcion === null || this.enviando()) return;
    this.enviando.set(true);
    this.practica.responder(p.id, opcion).subscribe({
      next: v => { this.aciertos.update(a => ({ ...a, [p.id]: v.esCorrecta })); this.avanzar(); },
      error: () => { this.aciertos.update(a => ({ ...a, [p.id]: false })); this.avanzar(); },
    });
  }

  /** "No sé": cuenta como no acertada, sin adivinar. */
  noSe(): void {
    const p = this.pregunta();
    if (!p) return;
    this.aciertos.update(a => ({ ...a, [p.id]: false }));
    this.avanzar();
  }

  private avanzar(): void {
    this.enviando.set(false);
    this.elegida.set(null);
    if (this.actual() + 1 < this.preguntas().length) {
      this.actual.update(i => i + 1);
    } else {
      this.etapa.set('resultado');
      this.guardar();
    }
  }

  private guardar(): void {
    try {
      localStorage.setItem(CLAVE_DIAGNOSTICO, JSON.stringify({ fecha: new Date().toISOString(), recomendado: this.recomendado()?.tema }));
    } catch {
      // sin almacenamiento local solo no se recuerda; el resultado ya se mostró
    }
  }
}
