import { Component, signal, effect, inject, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioChat, MensajeChat } from '../../../core/services/servicio-chat';

// =============================================
// COMPONENTE DEL CHATBOT
// =============================================

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss'
})
export class ChatbotComponent {
  private servicioChat = inject(ServicioChat);

  /** Referencia al contenedor de mensajes para auto-scroll */
  private contenedorMensajes = viewChild<ElementRef>('contenedorMensajes');

  /** Estado de visibilidad del panel de chat */
  estaAbierto = signal(false);

  /** Texto del input del usuario */
  textoUsuario = signal('');

  /** Señales del servicio */
  mensajes = this.servicioChat.mensajes;
  estaEscribiendo = this.servicioChat.estaEscribiendo;

  /** Preguntas sugeridas para el usuario */
  sugerencias = [
    '¿Qué secciones tiene el sitio?',
    '¿Qué hace el panel admin?',
    '¿Cómo compro un producto?',
    '¿Para qué sirve contacto?'
  ];

  constructor() {
    // Auto-scroll cuando llegan nuevos mensajes
    effect(() => {
      if (this.mensajes().length > 0) {
        setTimeout(() => this.desplazarAlFinal(), 100);
      }
    });
  }

  /** Alterna la visibilidad del chat */
  alternarChat(): void {
    this.estaAbierto.update(valor => !valor);
  }

  /** Envía un mensaje al backend */
  enviarMensaje(): void {
    const mensaje = this.textoUsuario().trim();
    if (!mensaje) return;

    this.textoUsuario.set('');

    this.servicioChat.enviarMensaje(mensaje).subscribe({
      next: (respuesta) => {
        this.servicioChat.agregarRespuestaAsistente(respuesta.message);
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
        this.servicioChat.agregarRespuestaAsistente(
          'Lo siento, ocurrió un error de conexión. Verifica que el servidor esté activo e intenta de nuevo.'
        );
      }
    });
  }

  /** Envía una pregunta sugerida directamente */
  enviarSugerencia(sugerencia: string): void {
    this.textoUsuario.set(sugerencia);
    this.enviarMensaje();
  }

  /** Maneja Enter en el textarea */
  manejarTecla(evento: KeyboardEvent): void {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      this.enviarMensaje();
    }
  }

  /** Limpia la conversación */
  limpiarChat(): void {
    this.servicioChat.limpiarConversacion();
  }

  /**
   * Convierte formato básico de markdown a HTML para renderizar
   * negritas, listas y saltos de línea en las respuestas.
   */
  formatearTexto(texto: string): string {
    return texto
      // Negritas: **texto** → <strong>texto</strong>
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Itálicas: *texto* → <em>texto</em>
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Saltos de línea
      .replace(/\n/g, '<br>');
  }

  /** Desplaza el contenedor de mensajes al fondo */
  private desplazarAlFinal(): void {
    const contenedor = this.contenedorMensajes();
    if (contenedor) {
      const elemento = contenedor.nativeElement as HTMLElement;
      elemento.scrollTop = elemento.scrollHeight;
    }
  }
}
