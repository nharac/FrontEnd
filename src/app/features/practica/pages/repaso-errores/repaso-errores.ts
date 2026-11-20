import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { PracticaService } from '../../services/practica.service';
import { Pregunta, TEMAS } from '../../models/practica.model';

/**
 * Repaso de errores: las preguntas que el estudiante falló la última vez.
 * Al acertarlas salen de la lista; si vuelve a fallar ve la pista.
 */
@Component({
  selector: 'app-repaso-errores',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './repaso-errores.html',
  styleUrl: './repaso-errores.scss',
})
export class RepasoErrores implements OnInit {
  private readonly practica = inject(PracticaService);

  preguntas = signal<Pregunta[]>([]);
  cargando = signal(true);
  error = signal(false);
  elegida = signal<Record<number, number>>({});
  pistas = signal<Record<number, string>>({});
  corregidas = signal(0);
  enviando = signal<number | null>(null);

  pendientes = computed(() => this.preguntas().length);

  ngOnInit(): void {
    this.practica.repaso().subscribe({
      next: p => { this.preguntas.set(p); this.cargando.set(false); },
      error: () => { this.error.set(true); this.cargando.set(false); },
    });
  }

  nombreTema(tema: string): string {
    return TEMAS.find(t => t.id === tema)?.nombre ?? tema;
  }

  elegir(preguntaId: number, opcionId: number): void {
    this.elegida.update(e => ({ ...e, [preguntaId]: opcionId }));
  }

  responder(p: Pregunta): void {
    const opcion = this.elegida()[p.id];
    if (opcion === undefined || this.enviando() !== null) return;
    this.enviando.set(p.id);
    this.practica.responder(p.id, opcion).subscribe({
      next: v => {
        this.enviando.set(null);
        if (v.esCorrecta) {
          this.preguntas.update(lista => lista.filter(x => x.id !== p.id));
          this.corregidas.update(n => n + 1);
        } else {
          this.pistas.update(ps => ({ ...ps, [p.id]: v.pista ?? 'Revisa el procedimiento paso a paso.' }));
        }
      },
      error: () => this.enviando.set(null),
    });
  }
}
