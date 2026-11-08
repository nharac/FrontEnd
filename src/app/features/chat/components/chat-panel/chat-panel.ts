import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  afterEveryRender,
  computed,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { timeout } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Mascota } from '../../../../shared/components/mascota/mascota';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ChatService } from '../../services/chat.service';
import { ChatMensaje } from '../../models/chat.model';
import { formatearMensaje } from '../../utils/formato-mensaje';
import { dibujarFormulas } from '../../utils/formulas';

/** Mensaje listo para pintar: el texto de la IA ya viene convertido a HTML seguro. */
interface MensajeVista extends ChatMensaje {
  html: string;
}

/** Respuesta fijada (se guarda ya formateada). */
export interface Fijada {
  id: number;
  html: string;
  fecha: string;
}

const CLAVE_FIJADAS = 'saesu-chat-fijadas';
const MAX_FIJADAS = 10;

export function leerFijadas(): Fijada[] {
  try {
    const l = JSON.parse(localStorage.getItem(CLAVE_FIJADAS) ?? '[]');
    return Array.isArray(l) ? l : [];
  } catch { return []; }
}

/** Atajos para seguir la conversación (aparecen encima del cuadro de texto). */
export const SEGUIMIENTOS = [
  { icono: 'format_list_numbered', texto: 'Explícame paso a paso' },
  { icono: 'lightbulb', texto: 'Dame un ejemplo parecido' },
  { icono: 'search', texto: '¿Dónde me equivoqué?' },
  { icono: 'compress', texto: 'Más corto, por favor' },
];

/** Límite de caracteres que acepta el backend (EnviarMensajeRequest). */
const MAX_CARACTERES = 2000;

/** Si en este tiempo no llega respuesta, se da por perdida (el backend espera a Gemini hasta ~60 s). */
const ESPERA_MAXIMA_MS = 90_000;

/** Lo que dice Sumi mientras espera a la IA, según cuántos segundos lleva. */
const MENSAJES_ESPERA: [number, string][] = [
  [30, 'Ya casi… gracias por la paciencia 🌿'],
  [15, 'Las preguntas difíciles toman un poquito más ⏳'],
  [6, 'Sumi está pensando… 🤔'],
];

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
  imports: [DatePipe, FormsModule, MatIconModule, Mascota],
  templateUrl: './chat-panel.html',
  styleUrl: './chat-panel.scss',
})
export class ChatPanel implements OnInit, OnDestroy {

  /** Id de la pregunta para el modo contextual. null = chat libre. */
  preguntaId = input<number | null>(null);

  private chatService = inject(ChatService);
  private snackBar = inject(MatSnackBar);

  private contenedor = viewChild<ElementRef<HTMLElement>>('contenedor');
  private entrada = viewChild<ElementRef<HTMLTextAreaElement>>('entrada');

  readonly maxCaracteres = MAX_CARACTERES;

  mensajes = signal<ChatMensaje[]>([]);
  texto = signal('');
  cargandoHistorial = signal(true);
  enviando = signal(false);
  mensajesRestantes = signal<number | null>(null);
  /** Id del mensaje que se acaba de copiar (muestra el check unos segundos). */
  copiado = signal<number | null>(null);

  /** Respuestas fijadas por el estudiante (en este navegador), para tenerlas a mano. */
  fijadas = signal<Fijada[]>(leerFijadas());
  verFijadas = signal(false);
  readonly seguimientos = SEGUIMIENTOS;
  /** Segundos que lleva esperando la respuesta de la IA. */
  segundosEsperando = signal(0);
  /** Último mensaje que no se pudo enviar, para el botón "Reintentar". */
  fallido = signal<{ mensaje: string; motivo: string } | null>(null);
  private reloj: ReturnType<typeof setInterval> | undefined;

  textoEspera = computed(() => MENSAJES_ESPERA.find(([s]) => this.segundosEsperando() >= s)?.[1] ?? '');

  mensajesVista = computed<MensajeVista[]>(() =>
    this.mensajes().map(m => ({ ...m, html: m.rolEmisor === 'ia' ? formatearMensaje(m.mensaje) : '' }))
  );
  /** Se muestra el contador cuando el mensaje se acerca al límite. */
  cercaDelLimite = computed(() => this.texto().length > MAX_CARACTERES * 0.8);

  esContextual = computed(() => this.preguntaId() !== null);
  puedeEnviar = computed(() => {
    const t = this.texto().trim();
    return t.length > 0 && t.length <= MAX_CARACTERES && !this.enviando();
  });

  /** Sugerencias para arrancar la conversación cuando no hay mensajes. */
  sugerencias = computed(() =>
    this.esContextual()
      ? [
          { icono: 'explore', texto: 'No sé por dónde empezar' },
          { icono: 'menu_book', texto: '¿Qué concepto necesito aquí?' },
          { icono: 'help', texto: '¿Por qué mi respuesta está mal?' }
        ]
      : [
          { icono: 'trending_flat', texto: '¿Qué es un límite y cómo se calcula?' },
          { icono: 'show_chart', texto: '¿Cómo se usa la regla de la cadena?' },
          { icono: 'functions', texto: '¿Cuándo conviene integrar por partes?' }
        ]
  );

  private host = inject(ElementRef<HTMLElement>);

  constructor() {
    // Las fórmulas llegan como texto marcado; se dibujan con KaTeX después de pintar los mensajes
    // (en todo el panel: también las respuestas fijadas)
    afterEveryRender(() => dibujarFormulas(this.host.nativeElement));
  }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  ngOnDestroy(): void {
    clearInterval(this.reloj);
  }

  /** Vuelve a enviar el mensaje que falló. */
  reintentar(): void {
    const f = this.fallido();
    if (!f || this.enviando()) return;
    this.texto.set(f.mensaje);
    this.enviar();
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

  /** El textarea crece con el texto (hasta 5 líneas aprox.). */
  ajustarAltura(): void {
    const el = this.entrada()?.nativeElement;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 140) + 'px';
    }
  }

  estaFijada(m: ChatMensaje): boolean {
    return this.fijadas().some(f => f.id === m.id);
  }

  /** Fija o quita una respuesta del tutor (máximo MAX_FIJADAS, se descartan las más viejas). */
  alternarFijada(m: ChatMensaje): void {
    if (this.estaFijada(m)) {
      this.quitarFijada(m.id);
      return;
    }
    this.guardarFijadas([{ id: m.id, html: formatearMensaje(m.mensaje), fecha: m.fechaHora }, ...this.fijadas()].slice(0, MAX_FIJADAS));
  }

  quitarFijada(id: number): void {
    this.guardarFijadas(this.fijadas().filter(f => f.id !== id));
  }

  private guardarFijadas(lista: Fijada[]): void {
    this.fijadas.set(lista);
    try { localStorage.setItem(CLAVE_FIJADAS, JSON.stringify(lista)); } catch { /* sin almacenamiento */ }
    if (!lista.length) this.verFijadas.set(false);
  }

  copiar(m: ChatMensaje): void {
    navigator.clipboard?.writeText(m.mensaje).then(() => {
      this.copiado.set(m.id);
      setTimeout(() => this.copiado.update(id => id === m.id ? null : id), 1800);
    }).catch(() => this.snackBar.open('No se pudo copiar el mensaje', 'Cerrar', { duration: 2500 }));
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
    this.fallido.set(null);
    setTimeout(() => this.ajustarAltura());
    this.enviando.set(true);
    this.empezarEspera();
    this.bajarAlFinal();

    this.chatService.enviarMensaje({ mensaje, preguntaId: this.preguntaId() }).pipe(timeout(ESPERA_MAXIMA_MS)).subscribe({
      next: (res) => {
        // Reemplaza el temporal por el guardado y agrega la respuesta de la IA
        this.mensajes.update(lista => [
          ...lista.filter(m => m.id !== temporal.id),
          res.mensajeUsuario,
          res.respuestaIa
        ]);
        this.mensajesRestantes.set(res.mensajesRestantesHoy);
        this.enviando.set(false);
        this.terminarEspera();
        this.bajarAlFinal();
      },
      error: (err: { status?: number; message?: string; name?: string }) => {
        // Quita el temporal y devuelve el texto para que no se pierda
        this.mensajes.update(lista => lista.filter(m => m.id !== temporal.id));
        this.texto.set(mensaje);
        this.enviando.set(false);
        this.terminarEspera();
        setTimeout(() => this.ajustarAltura());
        if (err?.name === 'TimeoutError') {
          err = { status: 504, message: '' };
        }
        // La IA saturada o lenta se puede reintentar; el límite diario no
        if (err?.status === 503 || err?.status === 504 || err?.status === 0) {
          this.fallido.set({ mensaje, motivo: this.motivoFallo(err.status) });
          this.bajarAlFinal();
        } else {
          this.mostrarError(err, 'No se pudo enviar el mensaje');
        }
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

  private empezarEspera(): void {
    clearInterval(this.reloj);
    this.segundosEsperando.set(0);
    this.reloj = setInterval(() => this.segundosEsperando.update(s => s + 1), 1000);
  }

  private terminarEspera(): void {
    clearInterval(this.reloj);
    this.segundosEsperando.set(0);
  }

  private motivoFallo(status?: number): string {
    if (status === 0) return 'Se perdió la conexión con el servidor 📡';
    if (status === 504) return 'Uy, me demoré demasiado pensando 😅';
    return 'Estoy con muchas preguntas a la vez y me enredé 😵‍💫';
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
