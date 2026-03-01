import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@environments/environment';

// =============================================
// MODELOS
// =============================================

export interface MensajeMesa {
  id: string;
  contenido: string;
  rol: 'usuario' | 'asistente';
  fechaHora: Date;
}

export interface ItemPedido {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface RespuestaMesa {
  message: string;
  sessionId: string;
  mesaId: string;
  pedidoActual: ItemPedido[];
  pedidoCreado: any | null;
  timestamp: Date;
}

// =============================================
// SERVICIO
// =============================================

@Injectable({ providedIn: 'root' })
export class MesaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  mensajes = signal<MensajeMesa[]>([]);
  pedidoActual = signal<ItemPedido[]>([]);
  estaEscribiendo = signal(false);
  sessionId = signal<string | null>(null);

  enviarMensaje(mesaId: string, mensaje: string): Observable<RespuestaMesa> {
    this.estaEscribiendo.set(true);

    // Agregar mensaje del usuario localmente
    this.mensajes.update(lista => [...lista, {
      id: this.generarId(),
      contenido: mensaje,
      rol: 'usuario',
      fechaHora: new Date()
    }]);

    return this.http.post<RespuestaMesa>(`${this.apiUrl}/mesa/${mesaId}/chat`, {
      message: mensaje,
      sessionId: this.sessionId()
    }).pipe(
      tap(resp => {
        // Guardar sessionId para mantener contexto
        if (resp.sessionId) this.sessionId.set(resp.sessionId);

        // Actualizar pedido en curso
        if (resp.pedidoActual) this.pedidoActual.set(resp.pedidoActual);

        // Agregar respuesta del asistente
        this.mensajes.update(lista => [...lista, {
          id: this.generarId(),
          contenido: resp.message,
          rol: 'asistente',
          fechaHora: new Date()
        }]);

        this.estaEscribiendo.set(false);
      })
    );
  }

  totalPedido(): number {
    return this.pedidoActual().reduce((s, i) => s + i.precio * i.cantidad, 0);
  }

  limpiar(): void {
    this.mensajes.set([]);
    this.pedidoActual.set([]);
    this.sessionId.set(null);
  }

  private generarId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }
}
