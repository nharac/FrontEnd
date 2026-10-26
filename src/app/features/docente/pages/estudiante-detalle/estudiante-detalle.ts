import { Component, OnInit, inject, signal } from '@angular/core';
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

  avance(resueltas: number, total: number): number {
    return total ? Math.round((resueltas / total) * 100) : 0;
  }
}
