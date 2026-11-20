import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EjerciciosResueltos } from './ejercicios-resueltos';
import { EJERCICIOS_RESUELTOS, TEMAS_RESUELTOS } from '../../models/ejercicios-resueltos';

describe('EjerciciosResueltos', () => {
  function crear() {
    TestBed.configureTestingModule({ imports: [EjerciciosResueltos], providers: [provideRouter([])] });
    const f = TestBed.createComponent(EjerciciosResueltos);
    f.detectChanges();
    return f;
  }

  it('cada tema tiene ejercicios y cada ejercicio explica el porqué de todos sus pasos', () => {
    for (const t of TEMAS_RESUELTOS) {
      expect(EJERCICIOS_RESUELTOS.some(e => e.tema === t.id)).toBe(true);
    }
    const ids = new Set(EJERCICIOS_RESUELTOS.map(e => e.id));
    expect(ids.size).toBe(EJERCICIOS_RESUELTOS.length);
    for (const e of EJERCICIOS_RESUELTOS) {
      expect(e.pasos.length).toBeGreaterThan(1);
      expect(e.pasos.every(p => p.paso.trim() && p.porque.trim())).toBe(true);
    }
  });

  it('muestra las fórmulas del tema elegido', () => {
    const f = crear();
    const c = f.componentInstance;
    c.cambiarVista('formulas');
    c.elegirTema('trigonometria');
    f.detectChanges();
    expect(c.formulas().length).toBeGreaterThan(3);
    expect(f.nativeElement.textContent).toContain('Ley del coseno');
  });

  it('filtra por tema y muestra los pasos uno a uno hasta la respuesta', () => {
    const f = crear();
    const c = f.componentInstance;

    c.elegirTema('derivadas');
    expect(c.ejercicios().every(e => e.tema === 'derivadas')).toBe(true);

    const e = c.ejercicios()[0];
    c.abrir(e);
    expect(c.pasosVisibles().length).toBe(0);

    c.siguientePaso();
    f.detectChanges();
    expect(c.pasosVisibles().length).toBe(1);
    expect(f.nativeElement.textContent).toContain('¿Por qué?');
    expect(c.terminado()).toBe(false);

    c.verTodo();
    f.detectChanges();
    expect(c.terminado()).toBe(true);
    expect(f.nativeElement.textContent).toContain(e.respuesta);

    c.siguientePaso();
    expect(c.pasosVisibles().length).toBe(e.pasos.length);

    c.reiniciar();
    expect(c.visibles()).toBe(0);
    c.volver();
    expect(c.seleccionado()).toBeNull();
  });
});

describe('EjerciciosResueltos (biblioteca grande)', () => {
  it('tiene más de 400 ejercicios, incluido álgebra lineal con Gauss-Jordan', () => {
    expect(EJERCICIOS_RESUELTOS.length).toBeGreaterThan(400);
    const lineal = EJERCICIOS_RESUELTOS.filter(e => e.tema === 'algebra_lineal');
    expect(lineal.length).toBeGreaterThan(50);
    expect(lineal.some(e => e.titulo.includes('Gauss-Jordan'))).toBe(true);
    expect(lineal.some(e => e.titulo.includes('Determinante'))).toBe(true);
  });

  it('filtra por nivel y búsqueda, y pagina de a 12', () => {
    TestBed.configureTestingModule({ imports: [EjerciciosResueltos], providers: [provideRouter([])] });
    const f = TestBed.createComponent(EjerciciosResueltos);
    f.detectChanges();
    const c = f.componentInstance;
    c.elegirTema('algebra_lineal');
    f.detectChanges();
    expect(c.visiblesLista().length).toBe(12);
    c.verMas();
    expect(c.visiblesLista().length).toBe(24);
    c.elegirNivel('Avanzado');
    expect(c.ejercicios().every(e => e.nivel === 'Avanzado')).toBe(true);
    c.buscar('gauss');
    expect(c.ejercicios().length).toBeGreaterThan(0);
    expect(c.ejercicios().every(e => /gauss/i.test(e.titulo + e.enunciado))).toBe(true);
    c.buscar('zzzz');
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('No hay ejercicios');
  });
});

describe('EjerciciosResueltos desde la práctica', () => {
  it('abre directo el ejercicio sugerido con ?tema=&ejercicio=', async () => {
    const { ActivatedRoute, convertToParamMap } = await import('@angular/router');
    const e = EJERCICIOS_RESUELTOS.find(x => x.tema === 'derivadas')!;
    TestBed.configureTestingModule({ imports: [EjerciciosResueltos], providers: [provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ tema: 'derivadas', ejercicio: e.id }) } } }] });
    const f = TestBed.createComponent(EjerciciosResueltos);
    f.detectChanges();
    expect(f.componentInstance.tema()).toBe('derivadas');
    expect(f.componentInstance.seleccionado()?.id).toBe(e.id);
  });
});
