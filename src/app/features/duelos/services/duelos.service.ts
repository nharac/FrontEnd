import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Companero, Duelo, PreguntaDuelo } from '../models/duelo.model';

@Injectable({ providedIn: 'root' })
export class DuelosService {
  private readonly API = `${environment.apiUrl}/duelos`;
  private http = inject(HttpClient);

  misDuelos(): Observable<Duelo[]> {
    return this.http.get<Duelo[]>(this.API);
  }

  companeros(): Observable<Companero[]> {
    return this.http.get<Companero[]>(`${this.API}/companeros`);
  }

  retar(rivalId: number, tema: string, modo: string = 'CLASICO'): Observable<Duelo> {
    return this.http.post<Duelo>(this.API, { rivalId, tema, modo });
  }

  preguntas(id: number): Observable<PreguntaDuelo[]> {
    return this.http.get<PreguntaDuelo[]>(`${this.API}/${id}/preguntas`);
  }

  entregar(id: number, respuestas: { preguntaId: number; letra: string | null }[], segundos: number): Observable<Duelo> {
    return this.http.post<Duelo>(`${this.API}/${id}/entregar`, { respuestas, segundos });
  }
}
