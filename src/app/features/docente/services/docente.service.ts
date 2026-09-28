import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface KpisDocente {
  sinRespuestaOficial: number;
  respuestasPorValidar: number;
  tasaRetencion: number;
}

/**
 * Servicio del módulo docente.
 * Por ahora con datos mock, se migrará a HTTP cuando el backend esté listo.
 */
@Injectable({
  providedIn: 'root'
})
export class DocenteService {

  kpis = signal<KpisDocente | null>(null);

  cargarKpis(): Observable<KpisDocente> {
    const mock: KpisDocente = {
      sinRespuestaOficial: 5,
      respuestasPorValidar: 7,
      tasaRetencion: 88
    };

    return of(mock).pipe(
      delay(300),
      // Actualiza el signal con la respuesta
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (source) => new Observable(subscriber => {
        const sub = source.subscribe({
          next: (value) => {
            this.kpis.set(value);
            subscriber.next(value);
          },
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete()
        });
        return () => sub.unsubscribe();
      })
    );
  }
}