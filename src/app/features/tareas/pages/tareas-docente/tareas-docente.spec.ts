import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { TareasDocente, fechaMas } from './tareas-docente';
import { TareasService } from '../../services/tareas.service';
import { DocenteService } from '../../../docente/services/docente.service';
import { TareaDocente } from '../../models/tarea.model';

const tarea: TareaDocente = { id: 3, titulo: 'Repaso', instrucciones: null, tema: 'algebra', temaNombre: 'Álgebra', metaPreguntas: 5,
  fechaLimite: '2026-12-01', estudianteId: null, asignadaA: 'Todo el grupo', asignados: 4, completadas: 1, vencida: false, creadaEn: '' };

describe('TareasDocente', () => {
  function crear(params: Record<string, string> = {}) {
    const tareas = { delDocente: vi.fn(() => of([tarea])), crear: vi.fn(() => of({ ...tarea, id: 9, asignadaA: 'Ana' })), eliminar: vi.fn(() => of(undefined)) };
    TestBed.configureTestingModule({
      imports: [TareasDocente],
      providers: [
        { provide: TareasService, useValue: tareas },
        { provide: DocenteService, useValue: { estudiantes: () => of([{ id: 2, nombre: 'Ana' }]) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(params) } } },
      ],
    });
    const f = TestBed.createComponent(TareasDocente);
    f.detectChanges();
    return { f, tareas };
  }

  it('fechaMas suma días en formato AAAA-MM-DD', () => {
    expect(fechaMas(3, new Date(2026, 10, 29))).toBe('2026-12-02');
  });

  it('precarga estudiante y tema desde la alerta y asigna', () => {
    const { f, tareas } = crear({ estudiante: '2', tema: 'limites' });
    const c = f.componentInstance;
    expect(c.form().estudianteId).toBe(2);
    expect(c.form().tema).toBe('limites');
    expect(c.valido()).toBe(false);
    c.campo('titulo', '  Límites  ');
    c.asignar();
    f.detectChanges();
    expect(tareas.crear).toHaveBeenCalledWith(expect.objectContaining({ titulo: 'Límites', instrucciones: null, estudianteId: 2 }));
    expect(c.tareas().length).toBe(2);
    expect(f.nativeElement.textContent).toContain('Tarea asignada a Ana');
  });

  it('muestra el avance y elimina', () => {
    const { f, tareas } = crear();
    const c = f.componentInstance;
    expect(c.porcentaje(tarea)).toBe(25);
    expect(f.nativeElement.textContent).toContain('1 de 4 la completaron');
    c.eliminar(tarea);
    expect(tareas.eliminar).toHaveBeenCalledWith(3);
    expect(c.tareas().length).toBe(0);
  });
});
