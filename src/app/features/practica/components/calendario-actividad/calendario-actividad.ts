import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { AvanceService } from '../../services/avance.service';
import { Actividad, DiaActividad } from '../../models/avance.model';

/** Una celda del calendario; null = hueco antes del primer día (para que cada columna empiece en lunes). */
export type Celda = (DiaActividad & { nivel: number; hoy: boolean }) | null;

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre',
  'noviembre', 'diciembre'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** Intensidad del color (0 = sin práctica) según las respuestas del día. */
export function nivelDe(respondidas: number): number {
  if (respondidas <= 0) return 0;
  if (respondidas < 5) return 1;
  if (respondidas < 10) return 2;
  if (respondidas < 20) return 3;
  return 4;
}

/** "2026-11-04" → Date local (sin desfase de zona horaria). */
function fecha(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

/**
 * Calendario de actividad estilo GitHub: una columna por semana (de lunes a domingo)
 * y cada día más oscuro entre más preguntas respondió el estudiante.
 */
@Component({
  selector: 'app-calendario-actividad',
  imports: [MatIconModule],
  templateUrl: './calendario-actividad.html',
  styleUrl: './calendario-actividad.scss',
})
export class CalendarioActividad implements OnInit {

  private avance = inject(AvanceService);

  datos = signal<Actividad | null>(null);
  error = signal(false);
  /** Día sobre el que está el cursor (o el que se tocó en el celular). */
  elegido = signal<Celda>(null);

  readonly diasSemana = ['L', '', 'M', '', 'V', '', 'D'];

  celdas = computed<Celda[]>(() => {
    const dias = this.datos()?.dias ?? [];
    if (!dias.length) return [];
    // getDay(): domingo = 0 → huecos para que la primera columna empiece en lunes
    const huecos = (fecha(dias[0].fecha).getDay() + 6) % 7;
    const ultimo = dias.at(-1)!.fecha;
    return [
      ...Array<Celda>(huecos).fill(null),
      ...dias.map(d => ({ ...d, nivel: nivelDe(d.respondidas), hoy: d.fecha === ultimo })),
    ];
  });

  /** Nombre del mes encima de la columna en la que empieza. */
  meses = computed(() => {
    const celdas = this.celdas();
    const etiquetas: { columna: number; mes: string }[] = [];
    let anterior = -1;
    for (let i = 0; i < celdas.length; i += 7) {
      const primera = celdas.slice(i, i + 7).find(c => c !== null);
      if (!primera) continue;
      const mes = fecha(primera.fecha).getMonth();
      if (mes !== anterior) {
        etiquetas.push({ columna: i / 7 + 1, mes: MESES[mes] });
        anterior = mes;
      }
    }
    return etiquetas;
  });

  semanas = computed(() => Math.ceil(this.celdas().length / 7));

  precision = computed(() => {
    const d = this.datos();
    return d?.totalRespondidas ? Math.round((d.totalAciertos / d.totalRespondidas) * 100) : 0;
  });

  resumen = computed(() => {
    const d = this.datos();
    if (!d) return '';
    const periodo = this.semanas() === 1 ? 'la última semana' : `las últimas ${this.semanas()} semanas`;
    return `${d.diasActivos} días con práctica en ${periodo}, ${d.totalRespondidas} preguntas respondidas`;
  });

  ngOnInit(): void {
    this.avance.actividad().subscribe({
      next: (a) => this.datos.set(a),
      error: () => this.error.set(true),
    });
  }

  /** "2026-11-04" → "miércoles 4 de noviembre" (o "4 de noviembre" sin el día de la semana). */
  fechaLarga(iso: string, conDia = true): string {
    const f = fecha(iso);
    const texto = `${f.getDate()} de ${MESES_LARGOS[f.getMonth()]}`;
    return conDia ? `${DIAS[f.getDay()]} ${texto}` : texto;
  }

  titulo(c: NonNullable<Celda>): string {
    const f = fecha(c.fecha);
    const dia = `${f.getDate()} ${MESES[f.getMonth()]}`;
    if (!c.respondidas) return `${dia}: sin práctica`;
    return `${dia}: ${c.respondidas} ${c.respondidas === 1 ? 'respondida' : 'respondidas'}, ${c.aciertos} ${c.aciertos === 1 ? 'acierto' : 'aciertos'}`;
  }
}
