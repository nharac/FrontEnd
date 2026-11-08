import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AvanceService } from '../../services/avance.service';
import { META_MAX, META_MIN, MetaSemanal } from '../../models/avance.model';
import { Mascota } from '../../../../shared/components/mascota/mascota';
import { Confeti } from '../../../../shared/components/confeti/confeti';

/** Metas sugeridas (preguntas por semana). */
export const METAS_SUGERIDAS = [10, 20, 30, 50, 80];

/**
 * Meta semanal: cuántas preguntas quiere responder el estudiante esta semana (lunes a domingo),
 * con un anillo de avance y lo que Sumi opina del ritmo. Se puede cambiar ahí mismo.
 */
@Component({
  selector: 'app-meta-semanal',
  imports: [FormsModule, MatIconModule, Mascota, Confeti],
  templateUrl: './meta-semanal.html',
  styleUrl: './meta-semanal.scss',
})
export class MetaSemanalCard implements OnInit {

  private avance = inject(AvanceService);
  private snackBar = inject(MatSnackBar);

  readonly sugeridas = METAS_SUGERIDAS;
  readonly min = META_MIN;
  readonly max = META_MAX;

  datos = signal<MetaSemanal | null>(null);
  error = signal(false);
  editando = signal(false);
  guardando = signal(false);
  /** Valor del campo "otra meta". */
  otra: number | null = null;

  avancePct = computed(() => {
    const d = this.datos();
    return d && d.meta ? Math.min(100, Math.round((d.respondidas / d.meta) * 100)) : 0;
  });

  faltan = computed(() => {
    const d = this.datos();
    return d ? Math.max(0, d.meta - d.respondidas) : 0;
  });

  /** Lo que dice Sumi según el ritmo de la semana. */
  mensaje = computed(() => {
    const d = this.datos();
    if (!d) return { estado: 'feliz' as const, texto: '' };
    if (d.cumplida) {
      return { estado: 'celebra' as const, texto: `¡Meta cumplida! Respondiste ${d.respondidas} preguntas esta semana. ¡Eres imparable! 🎉` };
    }
    const porDia = Math.ceil(this.faltan() / Math.max(1, d.diasRestantes));
    const transcurridos = 7 - d.diasRestantes + 1;
    const esperado = (d.meta * transcurridos) / 7;
    if (d.respondidas === 0) {
      return { estado: 'saludo' as const, texto: `¡Arranquemos! Con ${porDia} ${porDia === 1 ? 'pregunta' : 'preguntas'} al día la cumples.` };
    }
    if (d.respondidas >= esperado) {
      return { estado: 'feliz' as const, texto: `¡Vas a buen ritmo! Te faltan ${this.faltan()}, unas ${porDia} al día.` };
    }
    return { estado: 'animo' as const, texto: `Vas un poco atrás, pero se puede: ${porDia} ${porDia === 1 ? 'pregunta' : 'preguntas'} al día y la logras 💪` };
  });

  ngOnInit(): void {
    this.avance.meta().subscribe({
      next: (m) => this.datos.set(m),
      error: () => this.error.set(true),
    });
  }

  guardar(meta: number | null): void {
    if (meta == null || !Number.isInteger(meta) || meta < META_MIN || meta > META_MAX) {
      this.snackBar.open(`La meta debe estar entre ${META_MIN} y ${META_MAX} preguntas`, 'Cerrar', { duration: 3500 });
      return;
    }
    this.guardando.set(true);
    this.avance.cambiarMeta(meta).subscribe({
      next: (m) => {
        this.datos.set(m);
        this.guardando.set(false);
        this.editando.set(false);
        this.otra = null;
        this.snackBar.open(`Nueva meta: ${meta} preguntas por semana`, 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.guardando.set(false);
        this.snackBar.open(err?.message || 'No se pudo cambiar la meta', 'Cerrar', { duration: 3500 });
      },
    });
  }
}
