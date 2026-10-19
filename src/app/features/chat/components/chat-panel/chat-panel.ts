import {
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ChatService } from '../../services/chat.service';
import { ChatMensaje } from '../../models/chat.model';

/** Límite de caracteres que acepta el backend (EnviarMensajeRequest). */
const MAX_CARACTERES = 2000;

/**
 * Panel de chat reutilizable con el tutor IA.
 *
 * - Sin preguntaId  → chat libre (página /chat).
 * - Con preguntaId  → chat contextual: la IA sabe qué pregunta está resolviendo
 *   el estudiante. Uso en la práctica:
 *   <app-chat-panel [preguntaId]="pregunta.id" />
 */
@Component({
  selector: 'app-chat-panel',
  imports: [DatePipe, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './chat-panel.html',
  styleUrl: './chat-panel.scss',
})
export class ChatPanel implements OnInit {

  /** Id de la pregunta para el modo contextual. null = chat libre. */
  preguntaId = input<number | null>(null);

  private chatService = inject(ChatService);
  private snackBar = inject(MatSnackBar);

  private contenedor = viewChild<ElementRef<HTMLElement>>('contenedor');

  readonly maxCaracteres = MAX_CARACTERES;

  mensajes = signal<ChatMensaje[]>([]);
  texto = signal('');
  cargandoHistorial = signal(true);
  enviando = signal(false);
  mensajesRestantes = signal<number | null>(null);

  esContextual = computed(() => this.preguntaId() !== null);
  puedeEnviar = computed(() => {
    const t = this.texto().trim();
    return t.length > 0 && t.length <= MAX_CARACTERES && !this.enviando();
  });

  /** Sugerencias para arrancar la conversación cuando no hay mensajes. */
  sugerencias = computed(() =>
    this.esContextual()
      ? ['No sé por dónde empezar', '¿Qué concepto necesito aquí?', 'Dame una pista']
      : ['¿Qué es un límite?', '¿Cómo se usa la regla de la cadena?', '¿Para qué sirve una integral?']
  );

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    const id = this.preguntaId();
    const peticion = id !== null
      ? this.chatService.historialPorPregunta(id)
      : this.chatService.historialLibre();

    this.cargandoHistorial.set(true);
    peticion.subscribe({
      next: (res) => {
        this.mensajes.set(res.mensajes ?? []);
        this.cargandoHistorial.set(false);
        this.bajarAlFinal();
      },
      error: (err) => {
        this.cargandoHistorial.set(false);
        this.mostrarError(err, 'No se pudo cargar el historial');
      }
    });
  }

  usarSugerencia(sugerencia: string): void {
    this.texto.set(sugerencia);
    this.enviar();
  }

  /** Enter envía; Shift + Enter hace salto de línea. */
  alPresionarTecla(evento: KeyboardEvent): void {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      this.enviar();
    }
  }

  enviar(): void {
    if (!this.puedeEnviar()) {
      return;
    }

    const mensaje = this.texto().trim();

    // Se muestra de inmediato el mensaje del estudiante (temporal, id negativo)
    const temporal: ChatMensaje = {
      id: -Date.now(),
      rolEmisor: 'usuario',
      mensaje,
      preguntaId: this.preguntaId(),
      fechaHora: new Date().toISOString()
    };
    this.mensajes.update(lista => [...lista, temporal]);
    this.texto.set('');
    this.enviando.set(true);
    this.bajarAlFinal();

    this.chatService.enviarMensaje({ mensaje, preguntaId: this.preguntaId() }).subscribe({
      next: (res) => {
        // Reemplaza el temporal por el guardado y agrega la respuesta de la IA
        this.mensajes.update(lista => [
          ...lista.filter(m => m.id !== temporal.id),
          res.mensajeUsuario,
          res.respuestaIa
        ]);
        this.mensajesRestantes.set(res.mensajesRestantesHoy);
        this.enviando.set(false);
        this.bajarAlFinal();
      },
      error: (err) => {
        // Quita el temporal y devuelve el texto para que no se pierda
        this.mensajes.update(lista => lista.filter(m => m.id !== temporal.id));
        this.texto.set(mensaje);
        this.enviando.set(false);
        this.mostrarError(err, 'No se pudo enviar el mensaje');
      }
    });
  }

  limpiarHistorial(): void {
    if (this.esContextual() || this.mensajes().length === 0) {
      return;
    }

    this.chatService.limpiarHistorialLibre().subscribe({
      next: () => {
        this.mensajes.set([]);
        this.snackBar.open('Historial borrado', 'Cerrar', { duration: 2500 });
      },
      error: (err) => this.mostrarError(err, 'No se pudo borrar el historial')
    });
  }

  /** Mensajes claros según el código HTTP que devuelve el backend. */
  private mostrarError(err: { status?: number; message?: string }, porDefecto: string): void {
    let mensaje = err?.message || porDefecto;

    if (err?.status === 429) {
      // LimiteChatExcedidoException
      this.mensajesRestantes.set(0);
    } else if (err?.status === 503) {
      // IaNoDisponibleException
      mensaje = 'El tutor IA no está disponible en este momento. Intenta de nuevo en unos segundos.';
    } else if (err?.status === 0) {
      mensaje = 'No hay conexión con el servidor.';
    }

    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
  }

  private bajarAlFinal(): void {
    setTimeout(() => {
      const el = this.contenedor()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }
}
