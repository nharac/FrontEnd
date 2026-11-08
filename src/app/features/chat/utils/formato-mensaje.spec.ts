import { formatearMensaje, simplificarLatex } from './formato-mensaje';

describe('formatearMensaje', () => {
  it('escapa el HTML que venga en el texto', () => {
    expect(formatearMensaje('<script>alert(1)</script>')).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
  });

  it('aplica negrita, cursiva y código', () => {
    expect(formatearMensaje('**Regla** de la *cadena* con `f(g(x))`'))
      .toBe('<p><strong>Regla</strong> de la <em>cadena</em> con <code>f(g(x))</code></p>');
  });

  it('convierte exponentes en superíndices', () => {
    expect(formatearMensaje('x^2 + x^(n+1) + e^{2x}'))
      .toBe('<p>x<sup>2</sup> + x<sup>(n+1)</sup> + e<sup>2x</sup></p>');
  });

  it('arma listas con viñetas y numeradas', () => {
    expect(formatearMensaje('Piensa:\n- uno\n- dos\n\n1. tres\n2. cuatro'))
      .toBe('<p>Piensa:</p><ul><li>uno</li><li>dos</li></ul><ol><li>tres</li><li>cuatro</li></ol>');
  });

  it('aparta las fórmulas para dibujarlas con KaTeX', () => {
    expect(formatearMensaje('Si $\\frac{1}{x} \\to \\infty$ entonces'))
      .toBe('<p>Si <span class="tex">\\frac{1}{x} \\to \\infty</span> entonces</p>');
    expect(formatearMensaje('Mira:\n$$\\int x\\,dx$$'))
      .toBe('<p>Mira:<br><span class="tex tex--bloque">\\int x\\,dx</span></p>');
    expect(formatearMensaje('\\(x^2\\) y \\[a<b\\]'))
      .toBe('<p><span class="tex">x^2</span> y <span class="tex tex--bloque">a&lt;b</span></p>');
  });

  it('no confunde precios ni signos sueltos con fórmulas', () => {
    expect(formatearMensaje('Cuesta $5 y $10')).toBe('<p>Cuesta $5 y $10</p>');
    expect(formatearMensaje('Un $ solo')).toBe('<p>Un $ solo</p>');
    expect(formatearMensaje('$$ $$')).toBe('<p>$$ $$</p>');
  });

  it('simplifica el LaTeX que quede fuera de los delimitadores', () => {
    expect(simplificarLatex('\\frac{1}{x} \\to \\infty')).toBe('(1)/(x) → ∞');
  });

  it('separa párrafos y respeta saltos de línea', () => {
    expect(formatearMensaje('Hola\nqué tal\n\nAdiós')).toBe('<p>Hola<br>qué tal</p><p>Adiós</p>');
  });

  it('no confunde multiplicaciones con cursiva', () => {
    expect(formatearMensaje('2 * x * 3')).toBe('<p>2 * x * 3</p>');
  });
});
