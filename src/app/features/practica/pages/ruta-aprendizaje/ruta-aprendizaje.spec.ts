import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RutaAprendizaje } from './ruta-aprendizaje';
import { armarRuta } from './ruta';
import { PracticaService } from '../../services/practica.service';
import { Progreso } from '../../models/practica.model';

const t = (respondidas: number, porcentaje: number) => ({ respondidas, correctas: 0, porcentaje });
const progreso = (cambios: Partial<Progreso> = {}): Progreso => ({
  fundamentos: t(0, 0), algebra: t(0, 0), trigonometria: t(0, 0),
  limites: t(0, 0), derivadas: t(0, 0), integrales: t(0, 0), algebra_lineal: t(0, 0), ...cambios,
});

describe('Ruta de aprendizaje', () => {
  it('sin progreso empieza por fundamentos', () => {
    const r = armarRuta(progreso());
    expect(r.map(p => p.tema)).toEqual(['fundamentos', 'algebra', 'trigonometria', 'limites', 'derivadas', 'integrales', 'algebra_lineal']);
    expect(r[0].estado).toBe('siguiente');
    expect(r.slice(1).every(p => p.estado === 'pendiente')).toBe(true);
  });

  it('un tema se supera con 10 preguntas y 70 %; los empezados quedan en curso', () => {
    const r = armarRuta(progreso({ fundamentos: t(12, 80), algebra: t(5, 90), limites: t(20, 50) }));
    expect(r[0].estado).toBe('completado');
    expect(r[1].estado).toBe('siguiente');
    expect(r[3].estado).toBe('en-curso');
    expect(r[2].estado).toBe('pendiente');
  });

  it('muestra la ruta con el progreso y avisa si falla', () => {
    const servicio = { obtenerProgreso: vi.fn().mockReturnValue(of(progreso({ fundamentos: t(10, 70) }))) };
    TestBed.configureTestingModule({
      imports: [RutaAprendizaje],
      providers: [provideRouter([]), { provide: PracticaService, useValue: servicio }],
    });
    const f = TestBed.createComponent(RutaAprendizaje);
    f.detectChanges();
    expect(f.componentInstance.completadas()).toBe(1);
    expect(f.nativeElement.textContent).toContain('Te toca aquí');

    servicio.obtenerProgreso.mockReturnValue(throwError(() => new Error('x')));
    const f2 = TestBed.createComponent(RutaAprendizaje);
    f2.detectChanges();
    expect(f2.nativeElement.textContent).toContain('No pudimos cargar');
  });
});
