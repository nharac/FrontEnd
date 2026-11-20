import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AlertasDocente } from './alertas-docente';
import { DocenteService } from '../../services/docente.service';
import { AlertaDocente } from '../../models/docente.model';

const alerta = (i: number, gravedad: 'alta' | 'media' = 'media'): AlertaDocente => ({
  tipo: 'TEMA_DIFICIL', gravedad, estudianteId: i, estudiante: 'E' + i, tema: 'algebra',
  mensaje: 'Mensaje ' + i, sugerencia: 'Sugerencia ' + i,
});

describe('AlertasDocente', () => {
  function crear(respuesta: unknown) {
    TestBed.configureTestingModule({
      imports: [AlertasDocente],
      providers: [provideRouter([]), { provide: DocenteService, useValue: { alertas: () => respuesta } }],
    });
    const f = TestBed.createComponent(AlertasDocente);
    f.detectChanges();
    return f;
  }

  it('muestra hasta 5 alertas y permite ver todas', () => {
    const f = crear(of([alerta(1, 'alta'), ...[2, 3, 4, 5, 6, 7].map(i => alerta(i))]));
    const c = f.componentInstance;
    expect(c.altas()).toBe(1);
    expect(f.nativeElement.querySelectorAll('.ad-item').length).toBe(5);
    c.verTodas.set(true);
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('.ad-item').length).toBe(7);
    expect(f.nativeElement.textContent).toContain('Sugerencia 7');
  });

  it('sin alertas dice que todo está en orden', () => {
    const f = crear(of([]));
    expect(f.nativeElement.textContent).toContain('Todo en orden');
  });

  it('si falla lo avisa', () => {
    const f = crear(throwError(() => new Error('x')));
    expect(f.nativeElement.textContent).toContain('No se pudieron cargar');
  });
});
