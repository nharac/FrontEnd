import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { GeneradorIa } from './generador-ia';
import { DocenteService } from '../../services/docente.service';
import { PreguntaDocenteRequest } from '../../models/docente.model';

const borrador: PreguntaDocenteRequest = { tema: 'limites', enunciado: 'lim x→2 de x²', dificultad: 'basico', pista: 'Sustituye',
  opciones: [{ letra: 'A', texto: '4', esCorrecta: true }, { letra: 'B', texto: '2', esCorrecta: false }, { letra: 'C', texto: '0', esCorrecta: false }, { letra: 'D', texto: '8', esCorrecta: false }] };

describe('GeneradorIa', () => {
  it('genera, deja editar y publica; avisa al banco', () => {
    const s = { generarPreguntas: vi.fn(() => of([borrador, { ...borrador, enunciado: 'otra' }])), crearPregunta: vi.fn((_p: PreguntaDocenteRequest) => of({})) };
    TestBed.configureTestingModule({ imports: [GeneradorIa], providers: [{ provide: DocenteService, useValue: s }] });
    const f = TestBed.createComponent(GeneradorIa);
    const c = f.componentInstance;
    const avisos: void[] = [];
    c.guardada.subscribe(() => avisos.push(undefined));
    c.abierto.set(true);
    c.enfoque.set('  sustitución ');
    c.generar();
    f.detectChanges();
    expect(s.generarPreguntas).toHaveBeenCalledWith({ tema: 'limites', dificultad: 'basico', cantidad: 3, enfoque: 'sustitución' });
    expect(f.nativeElement.textContent).toContain('lim x→2 de x²');
    c.alternarEdicion(0);
    c.editarEnunciado(0, 'Calcula lim x→2 de x²');
    c.marcarCorrecta(0, 1);
    c.guardar(0);
    expect(s.crearPregunta).toHaveBeenCalledWith(expect.objectContaining({ enunciado: 'Calcula lim x→2 de x²' }));
    expect((s.crearPregunta.mock.calls[0] as unknown as [PreguntaDocenteRequest])[0].opciones[1].esCorrecta).toBe(true);
    expect(c.borradores()[0].estado).toBe('guardada');
    expect(avisos.length).toBe(1);
    c.descartar(1);
    f.detectChanges();
    expect(f.nativeElement.textContent).not.toContain('otra');
  });

  it('muestra el error de la IA', () => {
    const s = { generarPreguntas: vi.fn(() => throwError(() => new HttpErrorResponse({ status: 503, error: { mensaje: 'IA ocupada' } }))) };
    TestBed.configureTestingModule({ imports: [GeneradorIa], providers: [{ provide: DocenteService, useValue: s }] });
    const f = TestBed.createComponent(GeneradorIa);
    f.componentInstance.generar();
    expect(f.componentInstance.error()).toBe('IA ocupada');
  });
});
