import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Companero, Duelo, EstadoSala, PreguntaDuelo, RespuestaVivo, Torneo } from '../models/duelo.model';

@Injectable({ providedIn: 'root' })
export class DuelosService {
  private readonly API = `${environment.apiUrl}/duelos`;
  private http = inject(HttpClient);

  misDuelos(): Observable<Duelo[]> {
    return this.http.get<Duelo[]>(this.API);
  }

  torneo(): Observable<Torneo> {
    return this.http.get<Torneo>(`${this.API}/torneo`);
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

/** Retos en vivo: el cliente consulta el estado cada segundo. */
@Injectable({ providedIn: 'root' })
export class VivoService {
  private readonly API = `${environment.apiUrl}/vivo/salas`;
  private http = inject(HttpClient);

  crear(tema: string, invitadoId: number | null): Observable<EstadoSala> {
    return this.http.post<EstadoSala>(this.API, { tema, invitadoId });
  }

  ver(codigo: string): Observable<EstadoSala> {
    return this.http.get<EstadoSala>(`${this.API}/${codigo}`);
  }

  unirse(codigo: string): Observable<EstadoSala> {
    return this.http.post<EstadoSala>(`${this.API}/${codigo}/unirse`, {});
  }

  responder(codigo: string, orden: number, letra: string): Observable<RespuestaVivo> {
    return this.http.post<RespuestaVivo>(`${this.API}/${codigo}/responder`, { orden, letra });
  }

  cancelar(codigo: string): Observable<EstadoSala> {
    return this.http.post<EstadoSala>(`${this.API}/${codigo}/cancelar`, {});
  }
}
