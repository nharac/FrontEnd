import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

import { DocenteService } from '../../services/docente.service';
import { EstadisticasGrupo, EstudianteDetalle, EstudianteResumen } from '../../models/docente.model';
import { NOMBRES_TEMA } from '../../../foro/models/foro.model';
import { Logo } from '../../../../shared/components/logo/logo';

/**
 * Reporte imprimible para el docente (grupo completo o un estudiante con ?estudiante=ID).
 * "Descargar PDF" abre el diálogo de impresión del navegador, donde se elige "Guardar como PDF".
 */
@Component({
  selector: 'app-reporte-docente',
  standalone: true,
  imports: [RouterLink, MatIconModule, DatePipe, DecimalPipe, Logo],
  templateUrl: './reporte-docente.html',
})
export class ReporteDocente implements OnInit {
  private readonly docente = inject(DocenteService);
  private readonly ruta = inject(ActivatedRoute);

  readonly hoy = new Date();
  readonly nombresTema: Record<string, string> = NOMBRES_TEMA;

  grupo = signal<EstadisticasGrupo | null>(null);
  estudiantes = signal<EstudianteResumen[]>([]);
  detalle = signal<EstudianteDetalle | null>(null);
  nombreDocente = signal('');
  cargando = signal(true);
  error = signal(false);

  enRiesgo = computed(() => this.estudiantes().filter(e => e.estado === 'en-riesgo'));
  ordenados = computed(() => [...this.estudiantes()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));

  ngOnInit(): void {
    const id = Number(this.ruta.snapshot.queryParamMap.get('estudiante'));
    this.docente.obtenerPerfil().subscribe({ next: p => this.nombreDocente.set(p.nombre), error: () => {} });
    if (id > 0) {
      this.docente.estudiante(id).subscribe({
        next: d => { this.detalle.set(d); this.cargando.set(false); },
        error: () => { this.error.set(true); this.cargando.set(false); },
      });
    } else {
      forkJoin({ g: this.docente.estadisticas(), e: this.docente.estudiantes() }).subscribe({
        next: ({ g, e }) => { this.grupo.set(g); this.estudiantes.set(e); this.cargando.set(false); },
        error: () => { this.error.set(true); this.cargando.set(false); },
      });
    }
  }

  imprimir(): void {
    window.print();
  }

  estado(e: EstudianteResumen): string {
    return e.estado === 'en-riesgo' ? 'En riesgo' : e.estado === 'nuevo' ? 'Nuevo' : 'Al día';
  }
}
