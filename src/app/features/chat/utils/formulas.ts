import katex from 'katex';
import { simplificarLatex } from './formato-mensaje';

/**
 * Dibuja con KaTeX las fórmulas que formatearMensaje dejó en <span class="tex">.
 * Se hace sobre el DOM ya saneado por Angular: KaTeX arma sus propios elementos a partir
 * del texto (con trust: false), así que no se abre ninguna puerta a HTML de la IA.
 * Si una fórmula tiene un error, se muestra simplificada como texto.
 */
export function dibujarFormulas(raiz: HTMLElement | null | undefined): void {
  if (!raiz) return;
  raiz.querySelectorAll<HTMLElement>('span.tex:not(.tex--lista)').forEach(el => {
    const tex = el.textContent ?? '';
    try {
      katex.render(tex, el, {
        displayMode: el.classList.contains('tex--bloque'),
        throwOnError: true,
        strict: 'ignore',
        trust: false,
      });
    } catch {
      el.textContent = simplificarLatex(tex);
      el.classList.add('tex--simple');
    }
    el.classList.add('tex--lista');
  });
}
