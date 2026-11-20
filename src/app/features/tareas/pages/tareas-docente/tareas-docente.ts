import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { TareasService } from '../../services/tareas.service';
import { TareaDocente, TareaRequest } from '../../models/tarea.model';
import { DocenteService } from '../../../docente/services/docente.service';
import { EstudianteResumen } from '../../../docente/models/docente.model';
import { TEMAS } from '../../../practica/models/practica.model';

/** Fecha local en formato AAAA-MM-DD, sumando días. */
export function fechaMas(dias: number, base = new Date()): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** El docente asigna práctica a un estudiante o a todo el grupo y ve quién la completó. */
@Component({
  selector: 'app-tareas-docente',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './tareas-docente.html',
  styleUrl: './tareas-docente.scss',
})
export class TareasDocente implements OnInit {
  private readonly tareasService = inject(TareasService);
  private readonly docente = inject(DocenteService);
  private readonly ruta = inject(ActivatedRoute);

  readonly temas = TEMAS;
  readonly hoy = fechaMas(0);

  tareas = signal<TareaDocente[]>([]);
  estudiantes = signal<EstudianteResumen[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  error = signal<string | null>(null);
  exito = signal<string | null>(null);

  form = signal<TareaRequest>({ titulo: '', instrucciones: '', tema: 'fundamentos', metaPreguntas: 5, fechaLimite: fechaMas(7), estudianteId: null });

  ngOnInit(): void {
    const q = this.ruta.snapshot.queryParamMap;
    const tema = q.get('tema');
    const est = Number(q.get('estudiante'));
    this.form.update(f => ({
      ...f,
      tema: tema && TEMAS.some(t => t.id === tema) ? tema : f.tema,
      estudianteId: est > 0 ? est : null,
    }));
    this.docente.estudiantes().subscribe({ next: e => this.estudiantes.set(e), error: () => this.estudiantes.set([]) });
    this.cargar();
  }

  private cargar(): void {
    this.tareasService.delDocente().subscribe({
      next: t => { this.tareas.set(t); this.cargando.set(false); },
      error: () => { this.cargando.set(false); this.error.set('No se pudieron cargar las tareas.'); },
    });
  }

  campo<K extends keyof TareaRequest>(k: K, valor: TareaRequest[K]): void {
    this.form.update(f => ({ ...f, [k]: valor }));
  }

  valido(): boolean {
    const f = this.form();
    return !!f.titulo.trim() && f.metaPreguntas >= 1 && f.metaPreguntas <= 50 && !!f.fechaLimite && f.fechaLimite >= this.hoy;
  }

  asignar(): void {
    if (!this.valido() || this.guardando()) return;
    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(null);
    const f = this.form();
    this.tareasService.crear({ ...f, titulo: f.titulo.trim(), instrucciones: f.instrucciones?.trim() || null }).subscribe({
      next: t => {
        this.tareas.update(lista => [t, ...lista]);
        this.exito.set(`Tarea asignada a ${t.asignadaA}.`);
        this.form.update(x => ({ ...x, titulo: '', instrucciones: '' }));
        this.guardando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(e.error?.mensaje ?? 'No se pudo asignar la tarea.');
        this.guardando.set(false);
      },
    });
  }

  eliminar(t: TareaDocente): void {
    this.tareasService.eliminar(t.id).subscribe({
      next: () => this.tareas.update(lista => lista.filter(x => x.id !== t.id)),
      error: () => this.error.set('No se pudo eliminar la tarea.'),
    });
  }

  porcentaje(t: TareaDocente): number {
    return t.asignados ? Math.round((t.completadas / t.asignados) * 100) : 0;
  }
}
