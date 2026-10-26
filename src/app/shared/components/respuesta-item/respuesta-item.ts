import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { Respuesta } from '../../../features/foro/models/foro.model';
import { haceCuanto } from '../../utils/tiempo';
import { esDocente } from '../../utils/rol';

/**
 * Una respuesta del foro con sus respuestas hijas, dibujadas con sangría.
 * Lo usan el foro del estudiante y el panel del docente.
 *
 * Regla del backend (ResponderPublicacionService): solo se permite 1 nivel de
 * anidamiento. Por eso el botón "Responder" solo aparece en respuestas directas
 * a la publicación (nivel 0).
 */
@Component({
  selector: 'app-respuesta-item',
  imports: [FormsModule, MatIconModule],
  templateUrl: './respuesta-item.html',
  styleUrl: './respuesta-item.scss',
})
export class RespuestaItem {

  respuesta = input.required<Respuesta>();
  nivel = input(0);
  /** true en el panel docente: muestra "Marcar oficial" / "Quitar oficial". */
  puedeMarcarOficial = input(false);
  /** Id de la respuesta que se está procesando (deshabilita sus botones). */
  procesandoId = input<number | null>(null);
  /** true en el panel docente: muestra "Ocultar" (moderación). */
  puedeModerar = input(false);

  marcarOficial = output<number>();
  quitarOficial = output<number>();
  ocultar = output<number>();
  responder = output<{ padreId: number; contenido: string }>();

  respondiendo = signal(false);
  texto = signal('');

  /** Solo se puede responder a respuestas directas (1 nivel de anidamiento). */
  puedeResponder = computed(() => this.nivel() === 0 && !this.respuesta().oculta);

  /** La respuesta la escribió un docente. */
  autorDocente = computed(() => esDocente(this.respuesta().autor.rol));

  /**
   * RF-13: el docente marca como oficial respuestas de estudiantes.
   * "Quitar oficial" se deja siempre, por si alguna quedó marcada antes.
   */
  mostrarBotonOficial = computed(() =>
    !this.respuesta().oculta && this.puedeMarcarOficial() && (this.respuesta().esOficial || !this.autorDocente()));

  /** Moderación: solo respuestas visibles de estudiantes. */
  mostrarBotonOcultar = computed(() =>
    this.puedeModerar() && !this.respuesta().oculta && !this.autorDocente());

  readonly haceCuanto = haceCuanto;

  alternarRespuesta(): void {
    this.respondiendo.update(v => !v);
  }

  enviarRespuesta(): void {
    const contenido = this.texto().trim();
    if (!contenido) {
      return;
    }
    this.responder.emit({ padreId: this.respuesta().id, contenido });
    this.texto.set('');
    this.respondiendo.set(false);
  }
}
