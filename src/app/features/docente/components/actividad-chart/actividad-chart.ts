import { Component, computed, input } from '@angular/core';

import { ActividadDia } from '../../models/docente.model';

/**
 * Barras de intentos por día (últimos 14 días). Sin librerías: solo CSS.
 */
@Component({
  selector: 'app-actividad-chart',
  templateUrl: './actividad-chart.html',
  styleUrl: './actividad-chart.scss',
})
export class ActividadChart {

  dias = input.required<ActividadDia[]>();
  /** Texto del tooltip: "estudiantes" en el grupo, nada en un estudiante. */
  mostrarEstudiantes = input(true);

  private static readonly LETRA_DIA = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  maximo = computed(() => Math.max(1, ...this.dias().map(d => d.intentos)));
  total = computed(() => this.dias().reduce((s, d) => s + d.intentos, 0));

  barras = computed(() => this.dias().map(d => {
    // yyyy-MM-dd → fecha local (sin desfase de zona horaria)
    const [a, m, dd] = d.fecha.split('-').map(Number);
    const fecha = new Date(a, m - 1, dd);
    const etiqueta = fecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' });
    return {
      ...d,
      alto: d.intentos ? Math.max(6, Math.round((d.intentos / this.maximo()) * 100)) : 0,
      letra: ActividadChart.LETRA_DIA[fecha.getDay()],
      hoy: d === this.dias()[this.dias().length - 1],
      titulo: `${etiqueta}: ${d.intentos} intento${d.intentos === 1 ? '' : 's'}`
        + (this.mostrarEstudiantes() ? ` · ${d.estudiantes} estudiante${d.estudiantes === 1 ? '' : 's'}` : '')
    };
  }));
}
