import { Component, signal, effect, inject, ElementRef, viewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MesaService, MensajeMesa } from '../../core/services/mesa.service';

@Component({
  selector: 'app-mesa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mesa.html',
  styleUrl: './mesa.scss'
})
export class MesaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  mesaService = inject(MesaService);

  private contenedorMensajes = viewChild<ElementRef>('contenedorMensajes');

  mesaId = signal('');
  textoUsuario = signal('');
  mostrarResumen = signal(false);

  mensajes = this.mesaService.mensajes;
  pedidoActual = this.mesaService.pedidoActual;
  estaEscribiendo = this.mesaService.estaEscribiendo;

  sugerencias = [
    '🍽️ Ver carta',
    '📋 Ver mi pedido',
    '✅ Confirmar pedido',
    '🛒 Quiero pedir algo'
  ];

  constructor() {
    effect(() => {
      if (this.mensajes().length > 0) {
        setTimeout(() => this.scrollAlFinal(), 100);
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('mesaId') || '1';
    this.mesaId.set(id);
    this.mesaService.limpiar();

    // Mensaje de bienvenida automático al entrar
    setTimeout(() => this.enviarMensaje('hola'), 500);
  }

  enviarMensaje(mensajeDirecto?: string): void {
    const mensaje = mensajeDirecto ?? this.textoUsuario().trim();
    if (!mensaje) return;
    if (!mensajeDirecto) this.textoUsuario.set('');

    this.mesaService.enviarMensaje(this.mesaId(), mensaje).subscribe({
      error: (err) => {
        console.error('Error:', err);
        this.mesaService.mensajes.update(lista => [...lista, {
          id: Date.now().toString(),
          contenido: '❌ Error de conexión. Verifica que el servidor esté activo.',
          rol: 'asistente',
          fechaHora: new Date()
        }]);
      }
    });
  }

  usarSugerencia(s: string): void {
    // Quitar el emoji del principio para enviar texto limpio
    const texto = s.replace(/^[\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}]\s*/u, '').trim();
    this.enviarMensaje(texto);
  }

  manejarTecla(evento: KeyboardEvent): void {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      this.enviarMensaje();
    }
  }

  formatearTexto(texto: string): string {
    return texto
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  totalPedido(): number {
    return this.mesaService.totalPedido();
  }

  toggleResumen(): void {
    this.mostrarResumen.update(v => !v);
  }

  private scrollAlFinal(): void {
    const el = this.contenedorMensajes()?.nativeElement as HTMLElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
