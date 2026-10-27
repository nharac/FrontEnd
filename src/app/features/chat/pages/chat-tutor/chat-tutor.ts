import { Component, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { ChatPanel } from '../../components/chat-panel/chat-panel';

/**
 * Página /chat: chat libre con el tutor IA.
 * El chat contextual reutiliza <app-chat-panel> dentro de la práctica.
 * La columna lateral explica cómo ayuda el tutor y ofrece preguntas rápidas por tema.
 */
@Component({
  imports: [ChatPanel, RouterLink, MatIconModule],
  selector: 'app-chat-tutor',
  styleUrl: './chat-tutor.scss',
  templateUrl: './chat-tutor.html',
})
export class ChatTutor {

  private panel = viewChild.required(ChatPanel);

  readonly temas = [
    { id: 'limites', nombre: 'Límites', icono: 'trending_flat',
      preguntas: ['¿Qué hago si me da 0/0?', '¿Cómo calculo un límite al infinito?'] },
    { id: 'derivadas', nombre: 'Derivadas', icono: 'show_chart',
      preguntas: ['¿Cuándo uso la regla del producto?', '¿Qué significa la derivada en una gráfica?'] },
    { id: 'integrales', nombre: 'Integrales', icono: 'functions',
      preguntas: ['¿Cómo elijo la sustitución u?', '¿Por qué se suma + C?'] },
  ];

  /** Envía una pregunta rápida al chat y lo lleva a la vista en pantallas pequeñas. */
  preguntar(texto: string): void {
    this.panel().usarSugerencia(texto);
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
