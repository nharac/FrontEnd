import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { PerfilService } from '../../../../core/services/perfil.service';
import { RankingService } from '../../../gamificacion/services/ranking.service';
import { PosicionRanking, inicialesDe } from '../../../gamificacion/models/ranking.model';
import { PracticaService } from '../../services/practica.service';
import { InfoTema, Progreso, TEMAS } from '../../models/practica.model';
import { ContadorDirective } from '../../../../shared/directives/contador.directive';
import { Medalla } from '../../../../shared/components/medalla/medalla';

@Component({
  selector: 'app-dashboard-estudiante',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, ContadorDirective, Medalla],
  templateUrl: './dashboard-estudiante.html',
  styleUrl: './dashboard-estudiante.scss',
})
export class DashboardEstudiante implements OnInit {

  private router = inject(Router);
  private perfilService = inject(PerfilService);
  private rankingService = inject(RankingService);
  private practicaService = inject(PracticaService);

  /** Progreso por tema (GET /api/practica/progreso). */
  progreso = signal<Progreso | null>(null);

  /**
   * Tema recomendado para hoy: primero los que no ha practicado,
   * luego el de menor porcentaje de aciertos.
   */
  recomendado = computed<{ tema: InfoTema; respondidas: number; porcentaje: number } | null>(() => {
    const p = this.progreso();
    if (!p) return null;
    return TEMAS
      .map(tema => ({ tema, respondidas: p[tema.id]?.respondidas ?? 0, porcentaje: p[tema.id]?.porcentaje ?? 0 }))
      .sort((a, b) => (a.respondidas === 0 ? -1 : 0) - (b.respondidas === 0 ? -1 : 0) || a.porcentaje - b.porcentaje)[0];
  });

  /** Primer nombre del usuario autenticado (GET /api/auth/perfil). */
  readonly nombre = this.perfilService.primerNombre;
  readonly inicialesDe = inicialesDe;

  /** Top 10 del ranking (GET /api/ranking). */
  ranking = signal<PosicionRanking[]>([]);
  rankingCargado = signal(false);

  top3 = computed(() => this.ranking().slice(0, 3));

  /** Fila del estudiante actual en el ranking, si está en el top 10. */
  private miFila = computed(() => {
    const id = this.perfilService.usuario()?.id;
    return this.ranking().find(p => p.usuarioId === id) ?? null;
  });

  miLugar = computed(() => {
    const fila = this.miFila();
    return fila ? this.ranking().indexOf(fila) + 1 : null;
  });

  /**
   * Racha real: la del perfil (cuando el backend la incluya) o la del ranking.
   * null = todavía no se conoce.
   */
  racha = computed<number | null>(() =>
    this.perfilService.usuario()?.rachaActual ?? this.miFila()?.rachaActual ?? null);

  minutosEstimados = 15;

  ngOnInit(): void {
    this.perfilService.cargar();
    this.practicaService.obtenerProgreso().subscribe({
      next: (p) => this.progreso.set(p),
      error: () => this.progreso.set(null)
    });
    this.rankingService.obtenerTop().subscribe({
      next: (lista) => {
        this.ranking.set(lista ?? []);
        this.rankingCargado.set(true);
      },
      error: () => this.rankingCargado.set(true)
    });
  }

  irAPractica(): void {
    const tema = this.recomendado()?.tema.id;
    this.router.navigate(['/practica'], tema ? { queryParams: { tema } } : {});
  }
}
