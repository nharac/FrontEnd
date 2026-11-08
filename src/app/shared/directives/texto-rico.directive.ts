import { Directive, ElementRef, SecurityContext, effect, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { formatearMensaje } from '../../features/chat/utils/formato-mensaje';
import { dibujarFormulas } from '../../features/chat/utils/formulas';

/**
 * Muestra un texto escrito por un usuario con formato sencillo (negrita, listas, saltos de línea)
 * y las fórmulas en LaTeX ($x^2$, $$\frac{a}{b}$$) dibujadas con KaTeX.
 * El HTML pasa por el saneador de Angular antes de insertarse.
 * Uso: <p [appTextoRico]="publicacion.contenido"></p>
 */
@Directive({ selector: '[appTextoRico]' })
export class TextoRicoDirective {
  readonly appTextoRico = input<string | null | undefined>('');

  private el = inject(ElementRef<HTMLElement>);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    effect(() => {
      const raiz = this.el.nativeElement as HTMLElement;
      raiz.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, formatearMensaje(this.appTextoRico())) ?? '';
      dibujarFormulas(raiz);
    });
  }
}
