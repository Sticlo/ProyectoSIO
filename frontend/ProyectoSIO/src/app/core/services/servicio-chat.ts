import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

// =============================================
// MODELOS DEL CHAT
// =============================================

/** Mensaje individual en la conversación */
export interface MensajeChat {
  id: string;
  contenido: string;
  rol: 'usuario' | 'asistente';
  fechaHora: Date;
}

/** Respuesta del backend */
export interface RespuestaChat {
  message: string;
  conversationId: string;
  timestamp: Date;
}

// =============================================
// SERVICIO DEL CHATBOT
// =============================================

@Injectable({
  providedIn: 'root'
})
export class ServicioChat {
  private servicioApi = inject(ApiService);

  /** Indica si el asistente está "escribiendo" */
  estaEscribiendo = signal(false);

  /** Historial de mensajes de la conversación actual */
  mensajes = signal<MensajeChat[]>([]);

  /** ID de conversación para mantener contexto en el backend */
  private idConversacion: string | null = null;

  /**
   * Envía un mensaje al backend y agrega el mensaje del usuario al historial.
   */
  enviarMensaje(mensaje: string): Observable<RespuestaChat> {
    this.estaEscribiendo.set(true);

    // Agregar mensaje del usuario al historial local
    const mensajeUsuario: MensajeChat = {
      id: this.generarId(),
      contenido: mensaje,
      rol: 'usuario',
      fechaHora: new Date()
    };
    this.mensajes.update(lista => [...lista, mensajeUsuario]);

    // Enviar al backend con el ID de conversación
    return this.servicioApi.post<RespuestaChat>('/chat', {
      message: mensaje,
      conversationId: this.idConversacion
    }).pipe(
      tap(respuesta => {
        if (respuesta.conversationId) {
          this.idConversacion = respuesta.conversationId;
        }
      })
    );
  }

  /**
   * Agrega la respuesta del asistente al historial local.
   */
  agregarRespuestaAsistente(contenido: string): void {
    const mensajeAsistente: MensajeChat = {
      id: this.generarId(),
      contenido,
      rol: 'asistente',
      fechaHora: new Date()
    };
    this.mensajes.update(lista => [...lista, mensajeAsistente]);
    this.estaEscribiendo.set(false);
  }

  /**
   * Limpia la conversación y reinicia el contexto.
   */
  limpiarConversacion(): void {
    this.mensajes.set([]);
    this.idConversacion = null;
  }

  /** Genera un ID único para cada mensaje */
  private generarId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
