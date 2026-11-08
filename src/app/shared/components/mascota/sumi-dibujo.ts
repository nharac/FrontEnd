import { Directive, ElementRef, effect, inject, input } from '@angular/core';

const SVG_NS = 'http://www.w3.org/2000/svg';
/** Cada dibujo se interpreta una sola vez y luego se clona (hay varias Sumi en pantalla). */
const cache = new Map<string, DocumentFragment>();

function fragmento(svg: string): DocumentFragment {
  let f = cache.get(svg);
  if (!f) {
    const doc = new DOMParser().parseFromString(`<svg xmlns="${SVG_NS}">${svg}</svg>`, 'image/svg+xml');
    f = document.createDocumentFragment();
    for (const nodo of Array.from(doc.documentElement.childNodes)) {
      f.appendChild(document.importNode(nodo, true));
    }
    cache.set(svg, f);
  }
  return f.cloneNode(true) as DocumentFragment;
}

/**
 * Pinta dentro de un <g> del SVG de Sumi solo la prenda que lleva puesta.
 * Los dibujos son constantes del propio proyecto (sumi-prendas.ts), nunca texto de usuarios.
 * Uso: <g [sumiDibujo]="dibujoSombrero()" />
 */
@Directive({ selector: '[sumiDibujo]' })
export class SumiDibujo {
  readonly sumiDibujo = input('');
  private readonly g = inject<ElementRef<SVGGElement>>(ElementRef).nativeElement;

  constructor() {
    effect(() => {
      const svg = this.sumiDibujo();
      this.g.replaceChildren();
      if (svg) {
        this.g.appendChild(fragmento(svg));
      }
    });
  }
}
