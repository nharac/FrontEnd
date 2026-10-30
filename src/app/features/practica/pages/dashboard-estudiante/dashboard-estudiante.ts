import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { SumiDice } from '../../../../shared/components/sumi-dice/sumi-dice';
import { CONSEJOS_CALCULO, saludoInicio } from '../../../../shared/components/sumi-dice/dialogos';
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
import { LogrosService } from '../../../gamificacion/services/logros.service';
import { Logro } from '../../../gamificacion/models/logro.model';
import { ForoService } from '../../../foro/services/foro.service';
import { NOMBRES_TEMA, PublicacionResumen } from '../../../foro/models/foro.model';
import { haceCuanto } from '../../../../shared/utils/tiempo';
import { saludoSegunHora } from '../../../../shared/components/aviso/aviso.model';

@Component({
  selector: 'app-dashboard-estudiante',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, ContadorDirective, Medalla, SumiDice],
  templateUrl: './dashboard-estudiante.html',
  styleUrl: './dashboard-estudiante.scss',
})
export class DashboardEstudiante implements OnInit {

  private router = inject(Router);
  private perfilService = inject(PerfilService);
  private rankingService = inject(RankingService);
  private practicaService = inject(PracticaService);
  private logrosService = inject(LogrosService);
  private foroService = inject(ForoService);

  readonly temas = TEMAS;
  readonly nombresTema = NOMBRES_TEMA;
  readonly haceCuanto = haceCuanto;
  readonly saludo = saludoSegunHora();
  /** "lunes 26 de octubre" */
  readonly hoy = (() => {
    const t = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    return t.charAt(0).toUpperCase() + t.slice(1);
  })();

  /** Logros (GET /api/logros) y últimas publicaciones del foro. */
  logros = signal<Logro[]>([]);
  readonly consejos = CONSEJOS_CALCULO;
  saludoSumi = computed(() => saludoInicio(this.racha(), false));
  foroReciente = signal<PublicacionResumen[]>([]);

  logrosObtenidos = computed(() => this.logros().filter(l => l.obtenido).length);
  /** El siguiente logro por desbloquear (el primero que falta, en el orden del backend). */
  proximoLogro = computed(() => this.logros().find(l => !l.obtenido) ?? null);

  /** Aciertos sumando los tres temas. */
  totales = computed(() => {
    const p = this.progreso();
    if (!p) return { respondidas: 0, correctas: 0, porcentaje: 0 };
    const respondidas = TEMAS.reduce((s, t) => s + (p[t.id]?.respondidas ?? 0), 0);
    const correctas = TEMAS.reduce((s, t) => s + (p[t.id]?.correctas ?? 0), 0);
    return { respondidas, correctas, porcentaje: respondidas ? Math.round((correctas / respondidas) * 100) : 0 };
  });

  readonly puntos = computed(() => this.perfilService.usuario()?.puntosTotales ?? this.miFilaPublica()?.puntosTotales ?? 0);
  readonly fotoUrl = this.perfilService.fotoUrl;
  readonly iniciales = this.perfilService.iniciales;

  /** Circunferencia del anillo de progreso (r = 34). */
  readonly circunferencia = 2 * Math.PI * 34;

  progresoDe(tema: string) {
    const t = this.progreso()?.[tema as keyof Progreso];
    return { respondidas: t?.respondidas ?? 0, correctas: t?.correctas ?? 0, porcentaje: Math.round(t?.porcentaje ?? 0) };
  }

  /** Mensaje corto según cómo va en el tema. */
  estadoTema(porcentaje: number, respondidas: number): string {
    if (!respondidas) return 'Sin empezar';
    if (porcentaje >= 80) return '¡Vas excelente!';
    if (porcentaje >= 50) return 'Vas bien';
    return 'Necesita repaso';
  }

  practicar(tema: string): void {
    void this.router.navigate(['/practica'], { queryParams: { tema } });
  }

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
  private miFilaPublica = computed(() => this.miFila());

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
    this.logrosService.listar().subscribe({
      next: (l) => this.logros.set(l ?? []),
      error: () => this.logros.set([])
    });
    this.foroService.listar({ size: 3 }).subscribe({
      next: (lista) => this.foroReciente.set((lista ?? []).slice(0, 3)),
      error: () => this.foroReciente.set([])
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
    void this.router.navigate(['/practica'], tema ? { queryParams: { tema } } : {});
  }
}
