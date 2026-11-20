import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { DocenteService } from '../../services/docente.service';
import { AlertaDocente } from '../../models/docente.model';

const ICONOS: Record<AlertaDocente['tipo'], string> = {
  INACTIVO: 'bedtime',
  SIN_EMPEZAR: 'hourglass_empty',
  TEMA_DIFICIL: 'trending_down',
  QUIZ_BAJO: 'quiz',
  GRUPO_TEMA: 'groups',
};

/** Alertas automáticas del docente: quién necesita ayuda y en qué tema. */
@Component({
  selector: 'app-alertas-docente',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './alertas-docente.html',
  styleUrl: './alertas-docente.scss',
})
export class AlertasDocente implements OnInit {
  private readonly docente = inject(DocenteService);

  alertas = signal<AlertaDocente[]>([]);
  cargando = signal(true);
  error = signal(false);
  verTodas = signal(false);

  altas = computed(() => this.alertas().filter(a => a.gravedad === 'alta').length);
  visibles = computed(() => (this.verTodas() ? this.alertas() : this.alertas().slice(0, 5)));

  ngOnInit(): void {
    this.docente.alertas().subscribe({
      next: a => { this.alertas.set(a); this.cargando.set(false); },
      error: () => { this.error.set(true); this.cargando.set(false); },
    });
  }

  icono(a: AlertaDocente): string {
    return ICONOS[a.tipo] ?? 'notifications';
  }
}
