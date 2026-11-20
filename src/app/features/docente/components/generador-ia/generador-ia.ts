import { Component, inject, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { DocenteService } from '../../services/docente.service';
import { NOMBRES_DIFICULTAD, PreguntaDocenteRequest } from '../../models/docente.model';
import { TEMAS } from '../../../practica/models/practica.model';

interface Borrador { pregunta: PreguntaDocenteRequest; estado: 'pendiente' | 'guardando' | 'guardada' | 'descartada'; editando: boolean }

/** Panel para pedirle preguntas a la IA, revisarlas y publicar solo las buenas. */
@Component({
  selector: 'app-generador-ia',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './generador-ia.html',
})
export class GeneradorIa {
  private readonly docente = inject(DocenteService);

  readonly temas = TEMAS;
  readonly dificultades = Object.entries(NOMBRES_DIFICULTAD);
  readonly guardada = output<void>();

  abierto = signal(false);
  tema = signal('limites');
  dificultad = signal('basico');
  cantidad = signal(3);
  enfoque = signal('');
  generando = signal(false);
  error = signal<string | null>(null);
  borradores = signal<Borrador[]>([]);

  generar(): void {
    if (this.generando()) return;
    this.generando.set(true);
    this.error.set(null);
    this.docente.generarPreguntas({ tema: this.tema(), dificultad: this.dificultad(), cantidad: this.cantidad(),
      enfoque: this.enfoque().trim() || null }).subscribe({
      next: ps => { this.borradores.set(ps.map(p => ({ pregunta: p, estado: 'pendiente', editando: false }))); this.generando.set(false); },
      error: (e: HttpErrorResponse) => { this.error.set(e.error?.mensaje ?? 'La IA no respondió. Intenta de nuevo en unos segundos.'); this.generando.set(false); },
    });
  }

  private cambiar(i: number, cambio: Partial<Borrador>): void {
    this.borradores.update(l => l.map((b, k) => (k === i ? { ...b, ...cambio } : b)));
  }

  editarEnunciado(i: number, texto: string): void {
    const b = this.borradores()[i];
    this.cambiar(i, { pregunta: { ...b.pregunta, enunciado: texto } });
  }

  editarOpcion(i: number, j: number, texto: string): void {
    const b = this.borradores()[i];
    this.cambiar(i, { pregunta: { ...b.pregunta, opciones: b.pregunta.opciones.map((o, k) => (k === j ? { ...o, texto } : o)) } });
  }

  marcarCorrecta(i: number, j: number): void {
    const b = this.borradores()[i];
    this.cambiar(i, { pregunta: { ...b.pregunta, opciones: b.pregunta.opciones.map((o, k) => ({ ...o, esCorrecta: k === j })) } });
  }

  alternarEdicion(i: number): void {
    this.cambiar(i, { editando: !this.borradores()[i].editando });
  }

  guardar(i: number): void {
    const b = this.borradores()[i];
    this.cambiar(i, { estado: 'guardando' });
    this.docente.crearPregunta(b.pregunta).subscribe({
      next: () => { this.cambiar(i, { estado: 'guardada', editando: false }); this.guardada.emit(); },
      error: (e: HttpErrorResponse) => { this.cambiar(i, { estado: 'pendiente' }); this.error.set(e.error?.mensaje ?? 'No se pudo guardar la pregunta.'); },
    });
  }

  descartar(i: number): void {
    this.cambiar(i, { estado: 'descartada' });
  }
}
