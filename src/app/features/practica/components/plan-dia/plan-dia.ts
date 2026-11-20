import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PracticaService } from '../../services/practica.service';
import { TareasService } from '../../../tareas/services/tareas.service';
import { DuelosService } from '../../../duelos/services/duelos.service';
import { Progreso } from '../../models/practica.model';
import { armarRuta } from '../../pages/ruta-aprendizaje/ruta';
import { SumiDice } from '../../../../shared/components/sumi-dice/sumi-dice';

export interface ItemPlan {
  id: string;
  icono: string;
  titulo: string;
  detalle: string;
  enlace: string;
  query?: Record<string, string>;
  hecho: boolean;
}

/** Arma el plan del día a partir de lo pendiente. Exportada para probarla sin la vista. */
export function armarPlan(tareas: number, tareaUrgente: string | null, retos: number, repasoHoy: number,
                          siguienteTema: { id: string; nombre: string } | null): ItemPlan[] {
  const plan: ItemPlan[] = [];
  if (tareas > 0) plan.push({ id: 'tareas', icono: 'assignment', titulo: tareas === 1 ? '1 tarea del docente' : `${tareas} tareas del docente`,
    detalle: tareaUrgente ?? 'Revisa tus tareas pendientes', enlace: '/dashboard', hecho: false });
  if (retos > 0) plan.push({ id: 'retos', icono: 'sports_kabaddi', titulo: retos === 1 ? '1 reto por jugar' : `${retos} retos por jugar`,
    detalle: 'Tus compañeros te esperan', enlace: '/retos', hecho: false });
  plan.push({ id: 'repaso', icono: 'replay', titulo: repasoHoy > 0 ? `Repasar ${repasoHoy} pregunta${repasoHoy === 1 ? '' : 's'}` : 'Repaso al día',
    detalle: repasoHoy > 0 ? 'Repaso espaciado: hoy es el momento justo' : 'No te toca repasar nada hoy', enlace: '/repaso', hecho: repasoHoy === 0 });
  if (siguienteTema) plan.push({ id: 'ruta', icono: 'route', titulo: `Practicar ${siguienteTema.nombre}`,
    detalle: 'Es el siguiente paso de tu ruta', enlace: '/practica', query: { tema: siguienteTema.id }, hecho: false });
  return plan;
}

/** Plan del día: lo más importante para hoy, en un solo lugar, con Sumi de guía. */
@Component({
  selector: 'app-plan-dia',
  standalone: true,
  imports: [RouterLink, MatIconModule, SumiDice],
  template: `
    @if (plan().length) {
      <section class="pd" aria-labelledby="pd-titulo">
        <div class="pd-cabeza">
          <h3 id="pd-titulo"><mat-icon aria-hidden="true">today</mat-icon> Tu plan de hoy</h3>
          <span class="pd-avance">{{ hechos() }}/{{ plan().length }}</span>
        </div>
        <app-sumi-dice estado="saludo" accesorio="libro" [tamano]="60" compacto [titulo]="titulo()" [mensajes]="mensaje()" [aleatorio]="false" />
        <ol class="pd-lista">
          @for (i of plan(); track i.id) {
            <li>
              <a class="pd-item" [class.pd-item--hecho]="i.hecho" [routerLink]="i.enlace" [queryParams]="i.query ?? null">
                <span class="pd-check" aria-hidden="true"><mat-icon>{{ i.hecho ? 'check_circle' : i.icono }}</mat-icon></span>
                <span class="pd-texto"><strong>{{ i.titulo }}</strong><small>{{ i.detalle }}</small></span>
                @if (!i.hecho) { <mat-icon class="pd-ir" aria-hidden="true">chevron_right</mat-icon> }
              </a>
            </li>
          }
        </ol>
      </section>
    }
  `,
  styles: [`
    :host { display: block; }
    .pd { background: #fff; border-radius: 20px; padding: 16px 18px; box-shadow: 0 6px 22px rgba(31, 50, 71, 0.07); margin-bottom: 20px;
      border-top: 4px solid #4f46e5; display: flex; flex-direction: column; gap: 10px; }
    .pd-cabeza { display: flex; justify-content: space-between; align-items: center; }
    h3 { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 18px; mat-icon { color: #4f46e5; } }
    .pd-avance { font-weight: 700; font-size: 13px; color: #4f46e5; background: #eef2ff; padding: 3px 10px; border-radius: 999px; }
    .pd-lista { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
    .pd-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 14px; background: #f8fafc; color: inherit; text-decoration: none;
      border: 1px solid #eef0f4; transition: transform 0.15s; height: 100%; box-sizing: border-box; }
    .pd-item:hover { transform: translateY(-2px); border-color: #c7d2fe; }
    .pd-check { flex: none; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; background: #eef2ff; color: #4f46e5; }
    .pd-texto { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; strong { font-size: 14px; } small { font-size: 12.5px; color: #6b7280; } }
    .pd-ir { color: #a5b4fc; }
    .pd-item--hecho { background: #f0fdf4; border-color: #bbf7d0; .pd-check { background: #dcfce7; color: #16a34a; } strong { color: #166534; } }
  `],
})
export class PlanDia implements OnInit {
  private readonly practica = inject(PracticaService);
  private readonly tareas = inject(TareasService);
  private readonly duelos = inject(DuelosService);

  /** Progreso que ya cargó el inicio (para el siguiente tema de la ruta). */
  progreso = input<Progreso | null>(null);

  private datos = signal<{ tareas: number; urgente: string | null; retos: number; repaso: number } | null>(null);

  plan = computed(() => {
    const d = this.datos();
    if (!d) return [];
    const siguiente = armarRuta(this.progreso()).find(p => p.estado === 'siguiente' || p.estado === 'en-curso');
    return armarPlan(d.tareas, d.urgente, d.retos, d.repaso, siguiente ? { id: siguiente.tema, nombre: siguiente.nombre } : null);
  });
  hechos = computed(() => this.plan().filter(i => i.hecho).length);
  titulo = computed(() => {
    const pend = this.plan().filter(i => !i.hecho).length;
    return pend === 0 ? '¡Plan cumplido!' : pend === 1 ? 'Solo te falta una cosa' : `Hoy tienes ${pend} cosas`;
  });
  mensaje = computed(() => {
    const pend = this.plan().filter(i => !i.hecho);
    if (!pend.length) return ['Hiciste todo lo de hoy. ¿Un reto para celebrar?'];
    return [`Te recomiendo empezar por: ${pend[0].titulo.toLowerCase()}.`];
  });

  ngOnInit(): void {
    forkJoin({
      tareas: this.tareas.misTareas().pipe(catchError(() => of([]))),
      duelos: this.duelos.misDuelos().pipe(catchError(() => of([]))),
      repaso: this.practica.repasoResumen().pipe(catchError(() => of(null))),
    }).subscribe(({ tareas, duelos, repaso }) => {
      const pendientes = tareas.filter(t => !t.completada && !t.vencida);
      const urgente = pendientes[0] ? `${pendientes[0].titulo} · ${pendientes[0].diasRestantes === 0 ? 'vence hoy' : 'quedan ' + pendientes[0].diasRestantes + ' días'}` : null;
      this.datos.set({ tareas: pendientes.length, urgente, retos: duelos.filter(d => d.estado === 'POR_JUGAR').length, repaso: repaso?.paraHoy ?? 0 });
    });
  }
}
