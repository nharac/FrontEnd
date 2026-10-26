import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { LogrosService } from '../../services/logros.service';
import { Logro } from '../../models/logro.model';

/** Cuadrícula de insignias: a color las obtenidas y en gris (con candado) las pendientes. */
@Component({
  selector: 'app-logros-grid',
  imports: [DatePipe, MatIconModule],
  templateUrl: './logros-grid.html',
  styleUrl: './logros-grid.scss',
})
export class LogrosGrid implements OnInit {

  private logrosService = inject(LogrosService);

  logros = signal<Logro[]>([]);
  cargando = signal(true);
  error = signal(false);

  obtenidos = computed(() => this.logros().filter(l => l.obtenido).length);
  porcentaje = computed(() => this.logros().length ? Math.round(this.obtenidos() / this.logros().length * 100) : 0);

  ngOnInit(): void {
    this.logrosService.listar().subscribe({
      next: (lista) => {
        // Primero los obtenidos, para que se vea el avance
        this.logros.set([...lista].sort((a, b) => Number(b.obtenido) - Number(a.obtenido)));
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      }
    });
  }
}
