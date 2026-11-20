import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { PracticaService } from '../../services/practica.service';
import { Progreso } from '../../models/practica.model';
import { MINIMO_PORCENTAJE, MINIMO_PREGUNTAS, armarRuta } from './ruta';

/** Camino de aprendizaje: de las bases de matemáticas hasta las integrales. */
@Component({
  selector: 'app-ruta-aprendizaje',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './ruta-aprendizaje.html',
  styleUrl: './ruta-aprendizaje.scss',
})
export class RutaAprendizaje implements OnInit {
  private readonly practica = inject(PracticaService);

  readonly minimoPreguntas = MINIMO_PREGUNTAS;
  readonly minimoPorcentaje = MINIMO_PORCENTAJE;

  progreso = signal<Progreso | null>(null);
  cargando = signal(true);
  error = signal(false);

  paradas = computed(() => armarRuta(this.progreso()));
  completadas = computed(() => this.paradas().filter(p => p.estado === 'completado').length);

  ngOnInit(): void {
    this.practica.obtenerProgreso().subscribe({
      next: p => { this.progreso.set(p); this.cargando.set(false); },
      error: () => { this.error.set(true); this.cargando.set(false); },
    });
  }
}
