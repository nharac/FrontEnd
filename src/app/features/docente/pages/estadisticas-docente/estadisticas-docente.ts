import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { DocenteService } from '../../services/docente.service';
import { EstadisticasGrupo, NOMBRES_DIFICULTAD } from '../../models/docente.model';
import { NOMBRES_TEMA } from '../../../foro/models/foro.model';
import { ActividadChart } from '../../components/actividad-chart/actividad-chart';
import { ContadorDirective } from '../../../../shared/directives/contador.directive';
import { colorPorcentaje } from '../../utils/colores';

/**
 * /docente/estadisticas
 * Cómo le va al grupo: aciertos por tema, actividad de los últimos 14 días
 * y las preguntas en las que más fallan (con la respuesta incorrecta que más eligen).
 */
@Component({
  selector: 'app-estadisticas-docente',
  imports: [RouterLink, MatIconModule, ActividadChart, ContadorDirective],
  templateUrl: './estadisticas-docente.html',
  styleUrl: './estadisticas-docente.scss',
})
export class EstadisticasDocente implements OnInit {

  private docenteService = inject(DocenteService);

  datos = signal<EstadisticasGrupo | null>(null);
  error = signal(false);

  readonly nombresTema = NOMBRES_TEMA;
  readonly nombresDificultad = NOMBRES_DIFICULTAD;
  readonly color = colorPorcentaje;

  ngOnInit(): void {
    this.docenteService.estadisticas().subscribe({
      next: (d) => this.datos.set(d),
      error: () => this.error.set(true)
    });
  }
}
