import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { MisTareas } from './mis-tareas';
import { TareasService } from '../../services/tareas.service';
import { TareaEstudiante } from '../../models/tarea.model';

const tarea = (o: Partial<TareaEstudiante>): TareaEstudiante => ({ id: 1, titulo: 'Repaso', instrucciones: null, tema: 'algebra',
  temaNombre: 'Álgebra', metaPreguntas: 4, fechaLimite: '2026-11-25', docente: 'Profe', resueltas: 1, completada: false,
  vencida: false, diasRestantes: 3, ...o });

describe('MisTareas', () => {
  function crear(tareas: TareaEstudiante[]) {
    TestBed.configureTestingModule({ imports: [MisTareas],
      providers: [provideRouter([]), { provide: TareasService, useValue: { misTareas: () => of(tareas) } }] });
    const f = TestBed.createComponent(MisTareas);
    f.detectChanges();
    return f;
  }

  it('no muestra nada si no hay tareas', () => {
    expect(crear([]).nativeElement.querySelector('.mt')).toBeNull();
  });

  it('muestra el avance, el plazo y cuántas faltan', () => {
    const f = crear([tarea({}), tarea({ id: 2, completada: true, resueltas: 4 }), tarea({ id: 3, vencida: true, diasRestantes: -1 })]);
    const c = f.componentInstance;
    expect(c.pendientes()).toBe(2);
    expect(c.porcentaje(c.tareas()[0])).toBe(25);
    expect(c.plazo(tarea({ diasRestantes: 0 }))).toBe('Vence hoy');
    expect(c.plazo(tarea({ diasRestantes: 1 }))).toBe('Vence mañana');
    const texto = f.nativeElement.textContent;
    expect(texto).toContain('Quedan 3 días');
    expect(texto).toContain('¡Completada!');
    expect(texto).toContain('Vencida');
    expect(f.nativeElement.querySelectorAll('.mt-btn').length).toBe(2);
  });
});
