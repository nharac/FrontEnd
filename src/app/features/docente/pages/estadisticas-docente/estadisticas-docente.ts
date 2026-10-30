import { SumiDice } from '../../../../shared/components/sumi-dice/sumi-dice';
import { mensajeEstadisticas } from '../../../../shared/components/sumi-dice/dialogos';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  imports: [RouterLink, MatIconModule, ActividadChart, ContadorDirective, SumiDice],
  templateUrl: './estadisticas-docente.html',
  styleUrl: './estadisticas-docente.scss',
})
export class EstadisticasDocente implements OnInit {

  private docenteService = inject(DocenteService);

  datos = signal<EstadisticasGrupo | null>(null);
  error = signal(false);
  /** Comentarios de Sumi: el tema con menos aciertos y consejos generales. */
  consejosGrupo = computed(() => {
    const temas = (this.datos()?.porTema ?? []).filter(t => t.intentos > 0);
    const bajo = temas.length ? temas.reduce((a, b) => (b.porcentaje < a.porcentaje ? b : a), temas[0]) : null;
    const nombres: Record<string, string> = { limites: 'Límites', derivadas: 'Derivadas', integrales: 'Integrales' };
    return mensajeEstadisticas(bajo ? nombres[bajo.tema] ?? bajo.tema : null, bajo ? Math.round(bajo.porcentaje) : null);
  });

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
