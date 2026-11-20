import { trocear } from './texto-matriz';

describe('trocear', () => {
  it('separa texto y matrices', () => {
    const t = trocear('F2 → F2 − F1: [1 0 −2; 0 3 4]');
    expect(t[0]).toEqual({ texto: 'F2 → F2 − F1: ' });
    expect(t[1]).toEqual({ filas: [['1', '0', '−2'], ['0', '3', '4']] });
  });
  it('deja intacto lo que no es matriz', () => {
    expect(trocear('[A | I] → [I | A⁻¹]')).toEqual([{ texto: '[A | I] → [I | A⁻¹]' }]);
    expect(trocear('x = 2')).toEqual([{ texto: 'x = 2' }]);
  });
});
