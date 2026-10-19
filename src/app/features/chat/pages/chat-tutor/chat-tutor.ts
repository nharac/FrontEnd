import { Component } from '@angular/core';

import { ChatPanel } from '../../components/chat-panel/chat-panel';

/**
 * Página /chat: chat libre con el tutor IA.
 * El chat contextual reutiliza <app-chat-panel> dentro de la práctica.
 */
@Component({
  imports: [ChatPanel],
  selector: 'app-chat-tutor',
  styleUrl: './chat-tutor.scss',
  templateUrl: './chat-tutor.html',
})
export class ChatTutor {}
