import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ResultadoQuiz, duracion, nombreTemaQuiz } from '../../../quiz/models/quiz.model';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { DocenteService } from '../../services/docente.service';
import { EstudianteDetalle } from '../../models/docente.model';
import { NOMBRES_TEMA } from '../../../foro/models/foro.model';
import { ActividadChart } from '../../components/actividad-chart/actividad-chart';
import { haceCuanto } from '../../../../shared/utils/tiempo';
import { colorPorcentaje, iniciales } from '../../utils/colores';

/**
 * /docente/estudiantes/:id
 * Todo lo de un estudiante: progreso por tema, actividad, últimos intentos,
 * preguntas en las que más se equivoca y su participación en el foro.
 */
@Component({
  selector: 'app-estudiante-detalle',
  imports: [RouterLink, DatePipe, MatIconModule, ActividadChart],
  templateUrl: './estudiante-detalle.html',
  styleUrl: './estudiante-detalle.scss',
})
export class EstudianteDetallePage implements OnInit {

  private route = inject(ActivatedRoute);
  private docenteService = inject(DocenteService);

  datos = signal<EstudianteDetalle | null>(null);
  error = signal(false);

  readonly nombresTema = NOMBRES_TEMA;
  readonly haceCuanto = haceCuanto;
  readonly iniciales = iniciales;
  readonly color = colorPorcentaje;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.docenteService.estudiante(id).subscribe({
      next: (d) => this.datos.set(d),
      error: () => this.error.set(true)
    });
  }

  /** Quiz abierto para ver sus respuestas (uno a la vez). */
  quizAbierto = signal<number | null>(null);
  revision = signal<ResultadoQuiz | null>(null);
  cargandoRevision = signal(false);
  readonly nombreQuiz = nombreTemaQuiz;
  readonly duracion = duracion;

  promedioQuiz = computed(() => this.datos()?.resumen.promedioQuiz ?? null);

  verQuiz(intentoId: number): void {
    if (this.quizAbierto() === intentoId) {
      this.quizAbierto.set(null);
      return;
    }
    const estudiante = this.datos()?.resumen.id;
    if (!estudiante) return;
    this.quizAbierto.set(intentoId);
    this.revision.set(null);
    this.cargandoRevision.set(true);
    this.docenteService.quizDeEstudiante(estudiante, intentoId).subscribe({
      next: (r) => { this.revision.set(r); this.cargandoRevision.set(false); },
      error: () => { this.cargandoRevision.set(false); this.quizAbierto.set(null); }
    });
  }

  avance(resueltas: number, total: number): number {
    return total ? Math.round((resueltas / total) * 100) : 0;
  }
}
