import { formatearMensaje } from './formato-mensaje';

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

  it('simplifica LaTeX básico', () => {
    expect(formatearMensaje('$\\frac{1}{x} \\to \\infty$')).toBe('<p>(1)/(x) → ∞</p>');
  });

  it('separa párrafos y respeta saltos de línea', () => {
    expect(formatearMensaje('Hola\nqué tal\n\nAdiós')).toBe('<p>Hola<br>qué tal</p><p>Adiós</p>');
  });

  it('no confunde multiplicaciones con cursiva', () => {
    expect(formatearMensaje('2 * x * 3')).toBe('<p>2 * x * 3</p>');
  });
});
