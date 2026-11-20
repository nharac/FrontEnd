import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { ChatService } from '../../../chat/services/chat.service';
import { TextoRicoDirective } from '../../../../shared/directives/texto-rico.directive';

/** Calculadora paso a paso: el tutor IA resuelve el ejercicio que escribe el estudiante. */
@Component({
  selector: 'app-calculadora-pasos',
  standalone: true,
  imports: [MatIconModule, TextoRicoDirective],
  templateUrl: './calculadora-pasos.html',
  styleUrl: './calculadora-pasos.scss',
})
export class CalculadoraPasos {
  private readonly chat = inject(ChatService);

  readonly ejemplos = ['Resuelve 2x² − 8 = 0', 'Deriva f(x) = x³ · sen x', '∫ x·eˣ dx', 'Simplifica (x² − 9)/(x − 3)'];

  ejercicio = signal('');
  explicacion = signal<string | null>(null);
  restantes = signal<number | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);

  resolver(): void {
    const texto = this.ejercicio().trim();
    if (!texto || this.cargando()) return;
    this.cargando.set(true);
    this.error.set(null);
    this.chat.explicar(texto).subscribe({
      next: r => {
        this.explicacion.set(r.explicacion);
        this.restantes.set(r.mensajesRestantes);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(e.error?.mensaje ?? e.error?.message ?? 'El tutor no pudo responder. Intenta de nuevo en unos segundos.');
        this.cargando.set(false);
      },
    });
  }

  usarEjemplo(texto: string): void {
    this.ejercicio.set(texto);
  }
}
