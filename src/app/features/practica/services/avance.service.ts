import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Actividad, Analisis, MetaSemanal } from '../models/avance.model';

/** Estadísticas personales que se muestran en el perfil del estudiante. Requiere JWT. */
@Injectable({ providedIn: 'root' })
export class AvanceService {

  private readonly API = `${environment.apiUrl}/practica`;
  private http = inject(HttpClient);

  /** GET /api/practica/actividad?dias=N (por defecto 18 semanas). */
  actividad(dias = 126): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.API}/actividad`, { params: { dias } });
  }

  /** GET /api/practica/analisis */
  analisis(): Observable<Analisis> {
    return this.http.get<Analisis>(`${this.API}/analisis`);
  }

  /** GET /api/practica/meta */
  meta(): Observable<MetaSemanal> {
    return this.http.get<MetaSemanal>(`${this.API}/meta`);
  }

  /** PUT /api/practica/meta */
  cambiarMeta(meta: number): Observable<MetaSemanal> {
    return this.http.put<MetaSemanal>(`${this.API}/meta`, { meta });
  }
}
