import { Component, signal, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qr-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-mesas.html',
  styleUrl: './qr-mesas.scss'
})
export class QrMesasComponent {
  private readonly document = inject(DOCUMENT);

  isOpen = signal(false);
  cantidadMesas = signal(4);
  mesaSeleccionada = signal(1);
  baseUrl = signal(this.document.location.origin);

  open(): void { this.isOpen.set(true); }
  close(): void { this.isOpen.set(false); }

  getMesas(): number[] {
    return Array.from({ length: this.cantidadMesas() }, (_, i) => i + 1);
  }

  getUrlMesa(mesaId: number): string {
    return `${this.baseUrl()}/mesa/${mesaId}`;
  }

  /**
   * Genera la URL del QR usando api.qrserver.com
   * Servicio gratuito, sin API key, sin límites de uso razonables
   */
  getQrUrl(mesaId: number): string {
    const url = encodeURIComponent(this.getUrlMesa(mesaId));
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${url}&format=png&margin=10&ecc=M`;
  }

  imprimirQr(mesaId: number): void {
    const ventana = this.document.defaultView?.open('', '_blank');
    if (!ventana) return;

    const qrUrl = this.getQrUrl(mesaId);
    const mesaUrl = this.getUrlMesa(mesaId);

    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>QR Mesa ${mesaId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: white;
              padding: 40px;
            }
            .card {
              border: 3px solid #1a1a2e;
              border-radius: 20px;
              padding: 32px;
              text-align: center;
              max-width: 340px;
              width: 100%;
            }
            h1 { font-size: 32px; color: #1a1a2e; margin-bottom: 6px; }
            .subtitle { font-size: 14px; color: #666; margin-bottom: 24px; }
            img {
              width: 240px;
              height: 240px;
              border-radius: 12px;
              display: block;
              margin: 0 auto 20px;
            }
            .url { font-size: 11px; color: #888; word-break: break-all; margin-bottom: 16px; }
            .instruccion { font-size: 15px; font-weight: 600; color: #1a1a2e; }
            @media print {
              body { padding: 0; }
              .card { border: 2px solid black; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🍽️ Mesa ${mesaId}</h1>
            <p class="subtitle">Escanea para hacer tu pedido</p>
            <img src="${qrUrl}" alt="QR Mesa ${mesaId}" onload="window.print()" onerror="this.style.display='none'" />
            <p class="url">${mesaUrl}</p>
            <p class="instruccion">📱 Apunta tu cámara al código QR</p>
          </div>
        </body>
      </html>
    `);
    ventana.document.close();
  }

  copiarUrl(mesaId: number): void {
    navigator.clipboard.writeText(this.getUrlMesa(mesaId))
      .then(() => alert(`✅ URL copiada: ${this.getUrlMesa(mesaId)}`))
      .catch(() => prompt('Copia esta URL:', this.getUrlMesa(mesaId)));
  }
}
