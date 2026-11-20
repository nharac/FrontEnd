import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PlanDia, armarPlan } from './plan-dia';
import { PracticaService } from '../../services/practica.service';
import { TareasService } from '../../../tareas/services/tareas.service';
import { DuelosService } from '../../../duelos/services/duelos.service';

describe('PlanDia', () => {
  it('armarPlan junta lo pendiente y marca el repaso hecho si no hay', () => {
    const p = armarPlan(2, 'Repaso · vence hoy', 1, 0, { id: 'algebra', nombre: 'Álgebra' });
    expect(p.map(i => i.id)).toEqual(['tareas', 'retos', 'repaso', 'ruta']);
    expect(p[0].titulo).toBe('2 tareas del docente');
    expect(p[2].hecho).toBe(true);
    expect(p[3].query).toEqual({ tema: 'algebra' });
    expect(armarPlan(0, null, 0, 3, null).map(i => i.titulo)).toEqual(['Repasar 3 preguntas']);
  });

  it('carga lo pendiente y Sumi recomienda por dónde empezar', () => {
    TestBed.configureTestingModule({ imports: [PlanDia], providers: [provideRouter([]),
      { provide: TareasService, useValue: { misTareas: () => of([{ titulo: 'Límites', completada: false, vencida: false, diasRestantes: 0 }]) } },
      { provide: DuelosService, useValue: { misDuelos: () => throwError(() => new Error('x')) } },
      { provide: PracticaService, useValue: { repasoResumen: () => of({ paraHoy: 4 }) } }] });
    const f = TestBed.createComponent(PlanDia);
    f.detectChanges();
    const c = f.componentInstance;
    expect(c.plan().length).toBe(3);
    expect(c.titulo()).toBe('Hoy tienes 3 cosas');
    expect(f.nativeElement.textContent).toContain('Límites · vence hoy');
    expect(c.mensaje()[0]).toContain('1 tarea del docente');
  });
});
