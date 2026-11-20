import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RepasoErrores } from './repaso-errores';
import { PracticaService } from '../../services/practica.service';
import { Pregunta } from '../../models/practica.model';

const preg = (id: number): Pregunta => ({
  id, tema: 'algebra', enunciado: `P${id}`, dificultad: 'basico',
  opciones: [{ id: id * 10, letra: 'A', texto: 'a' }, { id: id * 10 + 1, letra: 'B', texto: 'b' }],
});

describe('Repaso de errores', () => {
  function crear(servicio: object) {
    servicio = { repasoResumen: vi.fn().mockReturnValue(of({ paraHoy: 2, manana: 3, estaSemana: 1, dominadas: 4, enRepaso: 6 })), ...servicio };
    TestBed.configureTestingModule({ imports: [RepasoErrores], providers: [provideRouter([]), { provide: PracticaService, useValue: servicio }] });
    const f = TestBed.createComponent(RepasoErrores);
    f.detectChanges();
    return f;
  }

  it('al acertar la pregunta sale de la lista; al fallar muestra la pista', () => {
    const servicio = {
      repaso: vi.fn().mockReturnValue(of([preg(1), preg(2)])),
      responder: vi.fn().mockImplementation((id: number) =>
        of(id === 1 ? { esCorrecta: true, opcionCorrectaId: 10, pista: null } : { esCorrecta: false, opcionCorrectaId: null, pista: 'Factoriza' })),
    };
    const f = crear(servicio);
    const c = f.componentInstance;
    expect(c.pendientes()).toBe(2);
    expect(f.nativeElement.textContent).toContain('Álgebra');

    c.responder(preg(1)); // sin elegir: no hace nada
    expect(servicio.responder).not.toHaveBeenCalled();

    c.elegir(1, 10); c.responder(preg(1));
    c.elegir(2, 21); c.responder(preg(2));
    f.detectChanges();
    expect(c.pendientes()).toBe(1);
    expect(c.corregidas()).toBe(1);
    expect(f.nativeElement.textContent).toContain('Factoriza');
  });

  it('sin errores pendientes lo felicita; si falla la carga avisa', () => {
    const f = crear({ repaso: vi.fn().mockReturnValue(of([])), responder: vi.fn() });
    expect(f.nativeElement.textContent).toContain('Nada que repasar hoy');
    expect(f.nativeElement.textContent).toContain('Mañana te tocan 3');
    expect(f.nativeElement.textContent).toContain('Dominadas');
    TestBed.resetTestingModule();
    const f2 = crear({ repaso: vi.fn().mockReturnValue(throwError(() => new Error('x'))), responder: vi.fn() });
    expect(f2.nativeElement.textContent).toContain('No pudimos cargar');
  });
});
