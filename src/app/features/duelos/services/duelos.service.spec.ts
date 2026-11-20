import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DuelosService } from './duelos.service';
import { environment } from '../../../../environments/environment';

describe('DuelosService', () => {
  it('usa las rutas de /api/duelos', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const s = TestBed.inject(DuelosService);
    const http = TestBed.inject(HttpTestingController);
    const API = `${environment.apiUrl}/duelos`;

    s.misDuelos().subscribe();
    http.expectOne(API).flush([]);
    s.companeros().subscribe();
    http.expectOne(`${API}/companeros`).flush([]);
    s.retar(2, 'algebra').subscribe();
    expect(http.expectOne(API).request.body).toEqual({ rivalId: 2, tema: 'algebra', modo: 'CLASICO' });
    s.preguntas(7).subscribe();
    http.expectOne(`${API}/7/preguntas`).flush([]);
    s.entregar(7, [{ preguntaId: 1, letra: 'A' }], 30).subscribe();
    expect(http.expectOne(`${API}/7/entregar`).request.body).toEqual({ respuestas: [{ preguntaId: 1, letra: 'A' }], segundos: 30 });
    http.verify();
  });
});
