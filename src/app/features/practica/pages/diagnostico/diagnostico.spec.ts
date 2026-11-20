import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Diagnostico, temaRecomendado } from './diagnostico';
import { PracticaService } from '../../services/practica.service';
import { Pregunta, Tema } from '../../models/practica.model';

const preg = (id: number, tema: Tema): Pregunta => ({
  id, tema, enunciado: `P${id}`, dificultad: 'basico',
  opciones: [{ id: id * 10, letra: 'A', texto: 'a' }, { id: id * 10 + 1, letra: 'B', texto: 'b' }],
} as Pregunta);

describe('Diagnóstico inicial', () => {
  it('recomienda el primer tema con fallos, o el último si acertó todo', () => {
    expect(temaRecomendado([])).toBeNull();
    const r = temaRecomendado([
      { tema: 'fundamentos', nombre: 'F', aciertos: 2, total: 2 },
      { tema: 'algebra', nombre: 'A', aciertos: 1, total: 2 },
      { tema: 'limites', nombre: 'L', aciertos: 0, total: 2 },
    ]);
    expect(r?.tema).toBe('algebra');
    expect(temaRecomendado([{ tema: 'integrales', nombre: 'I', aciertos: 2, total: 2 }])?.tema).toBe('integrales');
  });

  it('hace 2 preguntas por tema, cuenta aciertos y recomienda por dónde empezar', () => {
    let id = 0;
    const servicio = {
      sesion: vi.fn().mockImplementation(({ tema }: { tema: Tema }) => of([preg(++id, tema), preg(++id, tema)])),
      responder: vi.fn().mockImplementation((pid: number) => of({ esCorrecta: pid !== 3, opcionCorrectaId: null, pista: null })),
    };
    TestBed.configureTestingModule({ imports: [Diagnostico], providers: [provideRouter([]), { provide: PracticaService, useValue: servicio }] });
    const f = TestBed.createComponent(Diagnostico);
    const c = f.componentInstance;
    c.empezar();
    expect(c.preguntas().length).toBe(12);

    while (c.etapa() === 'preguntas') {
      const p = c.pregunta()!;
      if (p.id === 5) { c.noSe(); continue; }
      c.elegida.set(p.opciones[0].id);
      c.responder();
    }
    f.detectChanges();
    expect(c.etapa()).toBe('resultado');
    expect(c.recomendado()?.tema).toBe('algebra'); // la 3 (álgebra) falló
    expect(c.resultados().find(r => r.tema === 'trigonometria')?.aciertos).toBe(1); // la 5 fue "No sé"
    expect(f.nativeElement.textContent).toContain('Te recomendamos empezar por');
  });

  it('si no carga las preguntas muestra el error', () => {
    const servicio = { sesion: vi.fn().mockReturnValue(throwError(() => new Error('x'))), responder: vi.fn() };
    TestBed.configureTestingModule({ imports: [Diagnostico], providers: [provideRouter([]), { provide: PracticaService, useValue: servicio }] });
    const c = TestBed.createComponent(Diagnostico).componentInstance;
    c.empezar();
    expect(c.etapa()).toBe('error');
  });
});
