import { TestBed } from '@angular/core/testing';
import { Graficas } from './graficas';
import { FUNCIONES, area, trazo } from './funciones';

describe('Gráficas interactivas', () => {
  it('cada función trae una derivada y una primitiva coherentes', () => {
    for (const fn of FUNCIONES) {
      const h = 1e-4;
      for (const x of [-1.3, 0.4, 1.7]) {
        expect(Math.abs((fn.f(x + h) - fn.f(x - h)) / (2 * h) - fn.df(x))).toBeLessThan(1e-3);
        expect(Math.abs((fn.F(x + h) - fn.F(x - h)) / (2 * h) - fn.f(x))).toBeLessThan(1e-3);
      }
    }
  });

  it('el trazo y el área generan caminos de SVG', () => {
    expect(trazo(x => x, 320)).toMatch(/^M/);
    expect(area(x => x * x, 0, 2, 320)).toMatch(/Z$/);
  });

  it('calcula la pendiente de la tangente y la integral definida', () => {
    TestBed.configureTestingModule({ imports: [Graficas] });
    const f = TestBed.createComponent(Graficas);
    const c = f.componentInstance;
    c.x0.set(3);
    expect(c.pendiente()).toBeCloseTo(6);
    c.verArea.set(true);
    c.a.set(2); c.b.set(0);
    f.detectChanges();
    expect(c.integral()).toBeCloseTo(8 / 3);
    expect(f.nativeElement.querySelector('.gr-area')).toBeTruthy();
  });
});
