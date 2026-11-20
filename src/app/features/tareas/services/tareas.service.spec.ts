import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TareasService } from './tareas.service';
import { environment } from '../../../../environments/environment';

describe('TareasService', () => {
  it('usa las rutas de tareas del estudiante y del docente', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const s = TestBed.inject(TareasService);
    const http = TestBed.inject(HttpTestingController);
    const API = environment.apiUrl;

    s.misTareas().subscribe();
    http.expectOne(`${API}/tareas`).flush([]);
    s.delDocente().subscribe();
    http.expectOne(`${API}/docente/tareas`).flush([]);
    s.crear({ titulo: 't', instrucciones: null, tema: 'algebra', metaPreguntas: 5, fechaLimite: '2026-12-01', estudianteId: null }).subscribe();
    const req = http.expectOne(`${API}/docente/tareas`);
    expect(req.request.method).toBe('POST');
    req.flush({});
    s.eliminar(4).subscribe();
    expect(http.expectOne(`${API}/docente/tareas/4`).request.method).toBe('DELETE');
    http.verify();
  });
});
