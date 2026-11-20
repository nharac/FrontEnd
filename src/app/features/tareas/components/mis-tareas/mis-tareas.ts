import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { TareasService } from '../../services/tareas.service';
import { TareaEstudiante } from '../../models/tarea.model';

/** Tareas del docente en el inicio del estudiante. No se muestra si no tiene ninguna. */
@Component({
  selector: 'app-mis-tareas',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './mis-tareas.html',
  styleUrl: './mis-tareas.scss',
})
export class MisTareas implements OnInit {
  private readonly servicio = inject(TareasService);

  tareas = signal<TareaEstudiante[]>([]);
  pendientes = computed(() => this.tareas().filter(t => !t.completada).length);

  ngOnInit(): void {
    this.servicio.misTareas().subscribe({ next: t => this.tareas.set(t), error: () => this.tareas.set([]) });
  }

  porcentaje(t: TareaEstudiante): number {
    return Math.round((t.resueltas / t.metaPreguntas) * 100);
  }

  plazo(t: TareaEstudiante): string {
    if (t.completada) return '¡Completada!';
    if (t.vencida) return 'Vencida';
    if (t.diasRestantes === 0) return 'Vence hoy';
    if (t.diasRestantes === 1) return 'Vence mañana';
    return `Quedan ${t.diasRestantes} días`;
  }
}
