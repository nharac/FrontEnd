import { esDocente, esEstudiante, normalizarRol } from './rol';
import { diasDesde, haceCuanto } from './tiempo';
import { colorAvatar } from './avatar';
import { azar } from './azar';
import { Rol } from '../../features/usuario/models/rol.enum';

describe('Utilidades compartidas', () => {
  it('normaliza roles escritos de distintas formas', () => {
    expect(normalizarRol(' role_docente ')).toBe(Rol.DOCENTE);
    expect(normalizarRol('ESTUDIANTE')).toBe(Rol.ESTUDIANTE);
    expect(normalizarRol('admin')).toBeNull();
    expect(normalizarRol(null)).toBeNull();
    expect(esDocente('DOCENTE')).toBe(true);
    expect(esEstudiante('docente')).toBe(false);
  });

  it('describe cuánto tiempo pasó en palabras', () => {
    const hace = (ms: number) => new Date(Date.now() - ms).toISOString();
    expect(haceCuanto(hace(10_000))).toBe('hace un momento');
    expect(haceCuanto(hace(5 * 60_000))).toBe('hace 5 min');
    expect(haceCuanto(hace(3 * 3_600_000))).toBe('hace 3 h');
    expect(haceCuanto(hace(26 * 3_600_000))).toBe('hace 1 día');
    expect(haceCuanto(hace(3 * 86_400_000))).toBe('hace 3 días');
    expect(diasDesde(hace(2 * 86_400_000 + 1000))).toBe(2);
    expect(diasDesde(new Date(Date.now() + 86_400_000).toISOString())).toBe(0);
  });

  it('da siempre el mismo color de avatar al mismo nombre', () => {
    expect(colorAvatar('Laura Gómez')).toEqual(colorAvatar('Laura Gómez'));
    expect(colorAvatar(null).fondo).toMatch(/^#/);
  });
});

describe('azar', () => {
  it('devuelve números entre 0 y 1 como Math.random', () => {
    for (let i = 0; i < 50; i++) {
      const n = azar();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});
