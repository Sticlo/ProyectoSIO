import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  timestamp: Date;
}

/**
 * ChatService
 * Service for managing chatbot interactions with AI
 */
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiService = inject(ApiService);
  
  // Señal para controlar el estado de "escribiendo..."
  isTyping = signal(false);
  
  // Historial de mensajes
  messages = signal<ChatMessage[]>([]);

  // ID de conversación para mantener contexto
  private conversationId: string | null = null;

  /**
   * Envía un mensaje al chatbot
   */
  sendMessage(message: string): Observable<ChatResponse> {
    this.isTyping.set(true);
    
    // Agregar mensaje del usuario al historial
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };
    
    this.messages.update(msgs => [...msgs, userMessage]);
    
    // Enviar mensaje con ID de conversación para mantener contexto
    return this.apiService.post<ChatResponse>('/chat', { 
      message,
      conversationId: this.conversationId 
    }).pipe(
      tap(response => {
        // Guardar ID de conversación para mantener contexto
        if (response.conversationId) {
          this.conversationId = response.conversationId;
        }
      })
    );
  }

  /**
   * Agrega la respuesta del asistente al historial
   */
  addAssistantMessage(content: string): void {
    const assistantMessage: ChatMessage = {
      id: this.generateId(),
      content,
      role: 'assistant',
      timestamp: new Date()
    };
    
    this.messages.update(msgs => [...msgs, assistantMessage]);
    this.isTyping.set(false);
  }

  /**
   * Limpia el historial de mensajes y reinicia el contexto
   */
  clearMessages(): void {
    this.messages.set([]);
    this.conversationId = null; // Reiniciar contexto de conversación
  }

  /**
   * Genera un ID único para cada mensaje
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
