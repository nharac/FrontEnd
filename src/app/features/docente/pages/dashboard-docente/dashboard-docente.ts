import { SumiDice } from '../../../../shared/components/sumi-dice/sumi-dice';
import { saludoDocente } from '../../../../shared/components/sumi-dice/dialogos';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { DocenteService } from '../../services/docente.service';
import { NOMBRES_TEMA, PublicacionResumen } from '../../../foro/models/foro.model';
import { EstadisticasGrupo } from '../../models/docente.model';
import { diasDesde, haceCuanto } from '../../../../shared/utils/tiempo';

/**
 * Inicio del docente: cifras de las consultas pendientes y las más antiguas.
 */
@Component({
  selector: 'app-dashboard-docente',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, SumiDice],
  templateUrl: './dashboard-docente.html',
  styleUrl: './dashboard-docente.scss',
})
export class DashboardDocente implements OnInit {

  private docenteService = inject(DocenteService);

  nombreDocente = signal('');
  pendientes = signal<PublicacionResumen[]>([]);
  cargando = signal(true);
  error = signal(false);
  /** Resumen del grupo (si falla, simplemente no se muestra). */
  grupo = signal<EstadisticasGrupo | null>(null);

  readonly nombresTema = NOMBRES_TEMA;
  readonly haceCuanto = haceCuanto;

  /** Pendientes sin ninguna respuesta (ni de estudiantes). */
  sumiDocente = computed(() => saludoDocente(this.nombreDocente(), this.cargando() || this.error() ? null : this.pendientes().length));
  sinRespuestas = computed(() => this.pendientes().filter(p => p.respuestasCount === 0).length);

  /** Días que lleva esperando la consulta pendiente más antigua. */
  diasMasAntigua = computed(() => {
    const lista = this.pendientes();
    return lista.length ? Math.max(...lista.map(p => diasDesde(p.fechaCreacion))) : 0;
  });

  /** Las 3 que más llevan esperando. */
  masAntiguas = computed(() =>
    [...this.pendientes()]
      .sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime())
      .slice(0, 3)
  );

  ngOnInit(): void {
    this.docenteService.obtenerPerfil().subscribe({
      next: (u) => this.nombreDocente.set(u.nombre),
      error: () => this.nombreDocente.set('')
    });

    this.docenteService.estadisticas().subscribe({
      next: (g) => this.grupo.set(g),
      error: () => this.grupo.set(null)
    });

    this.docenteService.notificaciones().subscribe({
      next: (lista) => {
        this.pendientes.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      }
    });
  }
}
