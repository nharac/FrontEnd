import { SumiDice } from '../../../../shared/components/sumi-dice/sumi-dice';
import { mensajeRanking } from '../../../../shared/components/sumi-dice/dialogos';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { RankingService } from '../../services/ranking.service';
import {
  MiPosicion,
  NIVELES,
  PERIODOS,
  PeriodoRanking,
  PosicionRanking,
  REGLAS_PUNTOS,
  describirMovimiento,
  inicialesDe,
  nivelDe
} from '../../models/ranking.model';
import { PerfilService } from '../../../../core/services/perfil.service';
import { Confeti } from '../../../../shared/components/confeti/confeti';
import { ContadorDirective } from '../../../../shared/directives/contador.directive';
import { Medalla } from '../../../../shared/components/medalla/medalla';
import { colorAvatar } from '../../../../shared/utils/avatar';
import { haceCuanto } from '../../../../shared/utils/tiempo';

/** Clave para recordar el periodo elegido (comodidad por navegador). */
const CLAVE_PERIODO = 'saesu_ranking_periodo';

/**
 * /ranking: podio con los 3 primeros, lista del 4 al 10 y, a un lado,
 * la posición del estudiante (aunque no esté en el top), su nivel y sus últimos puntos.
 * Se puede ver el ranking de la semana, del mes o el histórico.
 */
@Component({
  selector: 'app-ranking',
  imports: [RouterLink, MatIconModule, Confeti, ContadorDirective, Medalla, SumiDice],
  templateUrl: './ranking.html',
  styleUrl: './ranking.scss',
})
export class Ranking implements OnInit, OnDestroy {

  private rankingService = inject(RankingService);
  private perfilService = inject(PerfilService);

  readonly periodos = PERIODOS;
  readonly reglas = REGLAS_PUNTOS;
  readonly niveles = NIVELES;
  readonly inicialesDe = inicialesDe;
  readonly colorAvatar = colorAvatar;
  readonly haceCuanto = haceCuanto;
  readonly describirMovimiento = describirMovimiento;

  periodo = signal<PeriodoRanking>(this.leerPeriodo());
  posiciones = signal<PosicionRanking[]>([]);
  yo = signal<MiPosicion | null>(null);
  /** Lo que dice Sumi según la posición (null mientras carga). */
  sumiRanking = computed(() => {
    const y = this.yo();
    return y ? mensajeRanking(y.posicion, y.puntosParaSubir, y.siguienteNombre) : null;
  });
  cargando = signal(true);
  error = signal(false);
  /** El confeti sale cuando el podio termina de subir. */
  mostrarConfeti = signal(false);
  private timerConfeti: ReturnType<typeof setTimeout> | undefined;

  private miId = computed(() => this.perfilService.usuario()?.id ?? null);

  infoPeriodo = computed(() => this.periodos.find(p => p.id === this.periodo())!);

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

  /** Puntos del líder: las barras de la lista son relativas a él. */
  lider = computed(() => this.posiciones()[0]?.puntosTotales || 1);

  /** El estudiante tiene puesto pero no aparece en el top 10: se agrega su fila al final. */
  fueraDelTop = computed(() => {
    const yo = this.yo();
    return yo?.posicion && yo.posicion > this.posiciones().length ? yo : null;
  });

  /** Avance hacia el de arriba (para la barra de "te faltan N pts"). */
  avanceSubir = computed(() => {
    const yo = this.yo();
    if (!yo?.puntosParaSubir) return 100;
    return Math.max(4, Math.round((yo.puntos / (yo.puntos + yo.puntosParaSubir)) * 100));
  });

  nivel = computed(() => nivelDe(this.yo()?.puntosTotales ?? 0));

  ngOnInit(): void {
    this.perfilService.cargar();
    this.cargar();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timerConfeti);
  }

  cambiarPeriodo(periodo: PeriodoRanking): void {
    if (periodo === this.periodo()) return;
    this.periodo.set(periodo);
    try { localStorage.setItem(CLAVE_PERIODO, periodo); } catch { /* sin almacenamiento: no pasa nada */ }
    this.cargar();
  }

  cargar(): void {
    const periodo = this.periodo();
    this.cargando.set(true);
    this.error.set(false);
    this.mostrarConfeti.set(false);
    clearTimeout(this.timerConfeti);

    forkJoin({
      top: this.rankingService.obtenerTop(periodo),
      // "Mi posición" es complementaria: si falla, el ranking se muestra igual
      yo: this.rankingService.miPosicion(periodo).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ top, yo }) => {
        this.posiciones.set(top ?? []);
        this.yo.set(yo);
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

  esYo(p: PosicionRanking): boolean {
    return p.usuarioId === this.miId();
  }

  ancho(puntos: number): number {
    return Math.max(6, Math.round((puntos / this.lider()) * 100));
  }

  private leerPeriodo(): PeriodoRanking {
    try {
      const guardado = localStorage.getItem(CLAVE_PERIODO);
      if (guardado === 'semana' || guardado === 'mes' || guardado === 'total') return guardado;
    } catch { /* sin almacenamiento */ }
    return 'semana';
  }
}
