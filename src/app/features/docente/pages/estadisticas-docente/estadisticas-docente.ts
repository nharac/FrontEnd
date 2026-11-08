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
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIAS_LARGOS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

/** Suma los intentos por día de la semana (lunes primero) y el alto relativo de cada barra. */
export function intentosPorDiaSemana(actividad: { fecha: string; intentos: number }[]) {
  const totales = [0, 0, 0, 0, 0, 0, 0];
  for (const a of actividad ?? []) {
    const [y, m, d] = a.fecha.split('-').map(Number);
    const dia = (new Date(y, m - 1, d).getDay() + 6) % 7; // lunes = 0
    totales[dia] += a.intentos;
  }
  const max = Math.max(...totales);
  return totales.map((intentos, i) => ({
    nombre: DIAS_SEMANA[i], largo: DIAS_LARGOS[i], intentos,
    alto: max ? Math.max(4, Math.round((intentos / max) * 100)) : 4,
    esMax: max > 0 && intentos === max,
  }));
}

@Component({
  selector: 'app-estadisticas-docente',
  imports: [RouterLink, MatIconModule, ActividadChart, ContadorDirective, SumiDice],
  templateUrl: './estadisticas-docente.html',
  styleUrl: './estadisticas-docente.scss',
})
export class EstadisticasDocente implements OnInit {

  private docenteService = inject(DocenteService);

  datos = signal<EstadisticasGrupo | null>(null);

  /** Intentos por día de la semana (de los últimos 14 días). */
  porDiaSemana = computed(() => intentosPorDiaSemana(this.datos()?.actividad ?? []));
  mejorDia = computed(() => {
    const max = this.porDiaSemana().find(x => x.esMax);
    return max ? `El ${max.largo} es el día con más práctica.` : 'Todavía no hay práctica registrada.';
  });

  /** "7 de noviembre de 2026" (para el encabezado del PDF). */
  readonly hoy = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

  /** El navegador abre su diálogo de impresión, donde se elige "Guardar como PDF". */
  imprimir(): void {
    window.print();
  }
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
