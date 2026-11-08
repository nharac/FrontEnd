import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AvanceService } from '../../services/avance.service';
import { Analisis, MIN_RESPUESTAS, Rendimiento, UMBRAL_DEBILIDAD, UMBRAL_FORTALEZA } from '../../models/avance.model';
import { DIFICULTADES, TEMAS } from '../../models/practica.model';
import { Mascota } from '../../../../shared/components/mascota/mascota';

const NOMBRE_TEMA: Record<string, string> = Object.fromEntries(TEMAS.map(t => [t.id, t.nombre]));
const NOMBRE_DIFICULTAD: Record<string, string> = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' };

/** Color de una celda del mapa: sin datos, débil, regular o fuerte (mismos umbrales del backend). */
export function claseDe(r: Rendimiento): 'sin-datos' | 'debil' | 'regular' | 'fuerte' {
  if (r.respondidas < MIN_RESPUESTAS) return 'sin-datos';
  if (r.porcentaje >= UMBRAL_FORTALEZA) return 'fuerte';
  if (r.porcentaje < UMBRAL_DEBILIDAD) return 'debil';
  return 'regular';
}

/**
 * Fortalezas y debilidades: mapa de calor de acierto por tema y dificultad,
 * las listas de fortalezas y "por reforzar", y la recomendación de Sumi con un botón para practicarla.
 */
@Component({
  selector: 'app-analisis-temas',
  imports: [RouterLink, MatIconModule, Mascota],
  templateUrl: './analisis-temas.html',
  styleUrl: './analisis-temas.scss',
})
export class AnalisisTemas implements OnInit {

  private avance = inject(AvanceService);

  datos = signal<Analisis | null>(null);
  error = signal(false);

  readonly temas = TEMAS;
  readonly dificultades = DIFICULTADES.filter(d => d.id !== null);
  readonly minimo = MIN_RESPUESTAS;
  readonly clase = claseDe;

  sinRespuestas = computed(() => !!this.datos() && this.datos()!.detalle.every(r => r.respondidas === 0));

  ngOnInit(): void {
    this.avance.analisis().subscribe({
      next: (a) => this.datos.set(a),
      error: () => this.error.set(true),
    });
  }

  celda(tema: string, dificultad: string | null): Rendimiento | undefined {
    return this.datos()?.detalle.find(r => r.tema === tema && r.dificultad === dificultad);
  }

  nombre(r: { tema: string; dificultad: string }): string {
    return `${NOMBRE_TEMA[r.tema]} · ${NOMBRE_DIFICULTAD[r.dificultad]}`;
  }

  etiquetaCelda(r: Rendimiento): string {
    return r.respondidas
      ? `${this.nombre(r)}: ${r.porcentaje}% de acierto en ${r.respondidas} preguntas`
      : `${this.nombre(r)}: sin respuestas`;
  }
}
