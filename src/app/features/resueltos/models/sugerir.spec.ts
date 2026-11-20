import { sugerirResuelto } from './sugerir';

describe('sugerirResuelto', () => {
  it('busca en el mismo tema el más parecido', () => {
    const e = sugerirResuelto('algebra_lineal', 'Calcula el determinante de la matriz [1 2; 3 4]', 'basico');
    expect(e?.tema).toBe('algebra_lineal');
    expect(e?.titulo.toLowerCase()).toContain('determinante');
    const d = sugerirResuelto('derivadas', 'Usa la regla de la cadena para derivar (3x + 1)⁴', 'intermedio');
    expect(d?.titulo.toLowerCase()).toContain('cadena');
    expect(sugerirResuelto('inexistente', 'x')).toBeNull();
  });
});
