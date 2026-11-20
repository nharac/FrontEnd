import { Component, computed, input } from '@angular/core';

export type Trozo = { texto: string } | { filas: string[][] };

/** Separa el texto en partes normales y matrices escritas como [a b; c d]. */
export function trocear(texto: string): Trozo[] {
  const res: Trozo[] = [];
  const re = /\[([^\[\]|]*;[^\[\]|]*)\]/g;
  let ultimo = 0;
  for (const m of texto.matchAll(re)) {
    const filas = m[1].split(';').map(f => f.trim().split(/\s+/));
    if (filas.some(f => f.length !== filas[0].length)) continue;
    if (m.index! > ultimo) res.push({ texto: texto.slice(ultimo, m.index) });
    res.push({ filas });
    ultimo = m.index! + m[0].length;
  }
  if (ultimo < texto.length) res.push({ texto: texto.slice(ultimo) });
  return res;
}

/** Muestra un texto dibujando las matrices como cuadrícula (filas y columnas alineadas). */
@Component({
  selector: 'app-texto-matriz',
  standalone: true,
  template: `@for (t of trozos(); track $index) {@if ('filas' in t) {<span class="tm" role="img" [attr.aria-label]="'Matriz ' + t.filas.length + ' por ' + t.filas[0].length + ': ' + aTexto(t.filas)"
      [style.grid-template-columns]="'repeat(' + t.filas[0].length + ', auto)'">@for (f of t.filas; track $index) {@for (v of f; track $index) {<span>{{ v }}</span>}}</span>} @else {{{ t.texto }}}}`,
  styles: [`
    :host { display: inline; }
    .tm { display: inline-grid; vertical-align: middle; gap: 2px 12px; padding: 4px 10px; margin: 2px 2px;
      border-left: 2px solid currentColor; border-right: 2px solid currentColor; border-radius: 6px;
      font-variant-numeric: tabular-nums; text-align: right; line-height: 1.35; }
  `],
})
export class TextoMatriz {
  readonly texto = input.required<string>();
  readonly trozos = computed(() => trocear(this.texto()));
  aTexto(filas: string[][]): string {
    return filas.map(f => f.join(', ')).join('; ');
  }
}
