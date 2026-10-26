import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { RankingService } from '../../services/ranking.service';
import { PosicionRanking, REGLAS_PUNTOS, inicialesDe } from '../../models/ranking.model';
import { PerfilService } from '../../../../core/services/perfil.service';
import { Confeti } from '../../../../shared/components/confeti/confeti';
import { ContadorDirective } from '../../../../shared/directives/contador.directive';
import { Medalla } from '../../../../shared/components/medalla/medalla';

/**
 * /ranking: podio con los 3 primeros, lista del 4 al 10
 * y la posición del estudiante actual si está en el top.
 */
@Component({
  selector: 'app-ranking',
  imports: [RouterLink, MatIconModule, Confeti, ContadorDirective, Medalla],
  templateUrl: './ranking.html',
  styleUrl: './ranking.scss',
})
export class Ranking implements OnInit, OnDestroy {

  private rankingService = inject(RankingService);
  private perfilService = inject(PerfilService);

  posiciones = signal<PosicionRanking[]>([]);
  cargando = signal(true);
  error = signal(false);
  /** El confeti sale cuando el podio termina de subir. */
  mostrarConfeti = signal(false);
  private timerConfeti: ReturnType<typeof setTimeout> | undefined;

  readonly reglas = REGLAS_PUNTOS;
  readonly inicialesDe = inicialesDe;

  private miId = computed(() => this.perfilService.usuario()?.id ?? null);

  /** El podio se dibuja 2.º – 1.º – 3.º, como en un podio real. */
  podio = computed(() => {
    const [primero, segundo, tercero] = this.posiciones();
    return [
      segundo && { ...segundo, lugar: 2 },
      primero && { ...primero, lugar: 1 },
      tercero && { ...tercero, lugar: 3 },
    ].filter(Boolean) as (PosicionRanking & { lugar: number })[];
  });

  resto = computed(() => this.posiciones().slice(3).map((p, i) => ({ ...p, lugar: i + 4 })));

  /** Lugar del estudiante actual (1–10) o null si no está en el top. */
  miLugar = computed(() => {
    const id = this.miId();
    const i = this.posiciones().findIndex(p => p.usuarioId === id);
    return i >= 0 ? i + 1 : null;
  });

  ngOnInit(): void {
    this.perfilService.cargar();
    this.rankingService.obtenerTop().subscribe({
      next: (lista) => {
        this.posiciones.set(lista ?? []);
        this.cargando.set(false);
        if (this.posiciones().length) {
          this.timerConfeti = setTimeout(() => this.mostrarConfeti.set(true), 1100);
        }
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.timerConfeti);
  }

  esYo(p: PosicionRanking): boolean {
    return p.usuarioId === this.miId();
  }
}
