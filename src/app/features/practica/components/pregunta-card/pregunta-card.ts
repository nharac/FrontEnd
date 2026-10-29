import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Mascota } from '../../../../shared/components/mascota/mascota';
import { reaccionPractica } from '../../../../shared/components/sumi-dice/dialogos';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PracticaService } from '../../services/practica.service';
import { Opcion, Pregunta, Validacion } from '../../models/practica.model';
import { Logro } from '../../../gamificacion/models/logro.model';
import { ChatPanel } from '../../../chat/components/chat-panel/chat-panel';
import { Confeti } from '../../../../shared/components/confeti/confeti';

/**
 * Tarjeta de una pregunta de práctica.
 *
 * Flujo (según ValidarRespuestaService del backend):
 * - Acierta  → se marca en verde, se muestran los puntos ganados y se habilita "Siguiente".
 * - Falla    → se marca en rojo, baja lo que vale la pregunta (20, 15, 10... mín. 5),
 *              se muestra la pista y se abre el tutor IA
 *              contextual. El estudiante puede intentar con otra opción.
 */
@Component({
  selector: 'app-pregunta-card',
  imports: [MatIconModule, ChatPanel, Confeti, Mascota],
  templateUrl: './pregunta-card.html',
  styleUrl: './pregunta-card.scss',
  host: {
    '[class.con-tutor]': 'mostrarChat() && !resuelta()',
    '(document:keydown)': 'alPresionarTecla($event)'
  }
})
export class PreguntaCard {

  pregunta = input.required<Pregunta>();
  numero = input(1);
  total = input(1);

  /** Se emite cuando el estudiante acierta. */
  acertada = output<{ primerIntento: boolean; puntos: number; logros: Logro[] }>();
  /** Se emite al pulsar "Siguiente". */
  siguiente = output<void>();

  private practicaService = inject(PracticaService);
  private snackBar = inject(MatSnackBar);

  seleccionada = signal<number | null>(null);
  descartadas = signal<number[]>([]);
  validacion = signal<Validacion | null>(null);
  pista = signal<string | null>(null);
  intentos = signal(0);
  enviando = signal(false);
  cargandoPista = signal(false);
  mostrarChat = signal(false);

  resuelta = computed(() => this.validacion()?.esCorrecta === true);
  /** Cómo reacciona Sumi a la última respuesta. */
  reaccion = computed(() => {
    const v = this.validacion();
    return v ? reaccionPractica(v.esCorrecta, this.intentos(), !!this.pista()) : null;
  });
  etiquetaDificultad = computed(() => {
    const nombres: Record<string, string> = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' };
    return nombres[this.pregunta().dificultad] ?? this.pregunta().dificultad;
  });
  /** Lo que vale acertar ahora: 20 al primer intento y baja 5 por fallo (mínimo 5). */
  valeAhora = computed(() => {
    const v = this.validacion();
    if (v?.esCorrecta) {
      return v.puntosGanados ?? 0;
    }
    return v?.puntosEnJuego ?? Math.max(5, 20 - 5 * this.intentos());
  });

  constructor() {
    // Reinicia el estado cada vez que llega una pregunta nueva
    effect(() => {
      this.pregunta();
      untracked(() => this.reiniciar());
    });
  }

  estadoOpcion(opcion: Opcion): 'correcta' | 'incorrecta' | 'seleccionada' | 'normal' {
    if (this.resuelta() && this.validacion()?.opcionCorrectaId === opcion.id) {
      return 'correcta';
    }
    if (this.descartadas().includes(opcion.id)) {
      return 'incorrecta';
    }
    if (this.seleccionada() === opcion.id) {
      return 'seleccionada';
    }
    return 'normal';
  }

  elegir(opcion: Opcion): void {
    if (this.resuelta() || this.enviando() || this.descartadas().includes(opcion.id)) {
      return;
    }
    this.seleccionada.set(opcion.id);
  }

  responder(): void {
    const opcionId = this.seleccionada();
    if (opcionId === null || this.enviando() || this.resuelta()) {
      return;
    }

    this.enviando.set(true);
    this.practicaService.responder(this.pregunta().id, opcionId).subscribe({
      next: (res) => {
        this.enviando.set(false);
        this.intentos.update(n => n + 1);
        this.validacion.set(res);

        if (res.esCorrecta) {
          this.acertada.emit({
            primerIntento: this.intentos() === 1,
            puntos: res.puntosGanados ?? 0,
            logros: res.nuevosLogros ?? []
          });
        } else {
          this.descartadas.update(lista => [...lista, opcionId]);
          this.seleccionada.set(null);
          if (res.pista) {
            this.pista.set(res.pista);
          }
          if (res.chatIaHabilitado) {
            this.mostrarChat.set(true);
          }
        }
      },
      error: (err) => {
        this.enviando.set(false);
        this.snackBar.open(err?.message || 'No se pudo validar la respuesta', 'Cerrar', { duration: 3500 });
      }
    });
  }

  pedirPista(): void {
    // RF-07: solo después de al menos un intento fallido
    if (this.intentos() === 0 || this.pista() || this.cargandoPista()) {
      return;
    }
    this.cargandoPista.set(true);
    this.practicaService.obtenerPista(this.pregunta().id).subscribe({
      next: (res) => {
        this.cargandoPista.set(false);
        this.pista.set(res.pista || res.mensaje || 'Esta pregunta no tiene pista.');
      },
      error: (err) => {
        this.cargandoPista.set(false);
        this.snackBar.open(err?.message || 'No se pudo obtener la pista', 'Cerrar', { duration: 3500 });
      }
    });
  }

  /**
   * Atajos de teclado: A-D (o 1-4) eligen opción y Enter responde o pasa a la siguiente.
   * No se activan mientras se escribe en el chat ni con teclas modificadoras.
   */
  alPresionarTecla(evento: KeyboardEvent): void {
    const destino = evento.target as HTMLElement | null;
    if (evento.ctrlKey || evento.metaKey || evento.altKey || evento.repeat
        || destino?.closest('input, textarea, select, [contenteditable="true"]')) {
      return;
    }

    const tecla = evento.key.toLowerCase();
    const indice = 'abcd'.indexOf(tecla) >= 0 ? 'abcd'.indexOf(tecla) : '1234'.indexOf(tecla);
    const opcion = indice >= 0 && tecla.length === 1 ? this.pregunta().opciones[indice] : undefined;

    if (opcion) {
      evento.preventDefault();
      this.elegir(opcion);
    } else if (tecla === 'enter' && !destino?.closest('button:not(.pc-opcion), a')) {
      evento.preventDefault();
      if (this.resuelta()) {
        this.siguiente.emit();
      } else {
        this.responder();
      }
    }
  }

  alternarChat(): void {
    this.mostrarChat.update(v => !v);
  }

  private reiniciar(): void {
    this.seleccionada.set(null);
    this.descartadas.set([]);
    this.validacion.set(null);
    this.pista.set(null);
    this.intentos.set(0);
    this.enviando.set(false);
    this.cargandoPista.set(false);
    this.mostrarChat.set(false);
  }
}
