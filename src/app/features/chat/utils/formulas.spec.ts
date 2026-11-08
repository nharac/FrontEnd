import { describe, expect, it } from 'vitest';
import { dibujarFormulas } from './formulas';
import { formatearMensaje } from './formato-mensaje';

function contenedor(html: string): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

describe('dibujarFormulas', () => {
  it('dibuja con KaTeX las fórmulas en línea y en bloque', () => {
    const div = contenedor(formatearMensaje('El límite $\\lim_{x \\to 0} \\frac{\\sin x}{x}$ vale\n$$\\int_0^1 x^2\\,dx = \\frac{1}{3}$$'));
    dibujarFormulas(div);
    const formulas = div.querySelectorAll('.tex');
    expect(formulas).toHaveLength(2);
    expect(formulas[0].querySelector('.katex')).toBeTruthy();
    expect(formulas[1].querySelector('.katex-display')).toBeTruthy();
    expect(div.querySelectorAll('.tex--lista')).toHaveLength(2);
  });

  it('no vuelve a dibujar las que ya están listas', () => {
    const div = contenedor(formatearMensaje('$x^2$'));
    dibujarFormulas(div);
    const antes = div.innerHTML;
    dibujarFormulas(div);
    expect(div.innerHTML).toBe(antes);
  });

  it('si la fórmula tiene un error la muestra simplificada', () => {
    const div = contenedor('<span class="tex">\\frac{1}{x</span>');
    dibujarFormulas(div);
    const el = div.querySelector('.tex')!;
    expect(el.classList.contains('tex--simple')).toBe(true);
    expect(el.querySelector('.katex')).toBeNull();
  });

  it('no hace nada sin contenedor y no ejecuta HTML de la IA', () => {
    expect(() => dibujarFormulas(null)).not.toThrow();
    const div = contenedor(formatearMensaje('$\\href{javascript:alert(1)}{x}$ <img src=x onerror=alert(1)>'));
    dibujarFormulas(div);
    expect(div.querySelector('img')).toBeNull();
    expect(div.querySelector('a')).toBeNull();
  });
});
