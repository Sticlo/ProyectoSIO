import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environment';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface WompiSignatureData {
  publicKey: string;
  reference: string;
  amountInCents: number;
  currency: string;
  integrity: string;
}

export interface WompiCheckoutConfig extends WompiSignatureData {
  redirectUrl?: string;
  customerData?: {
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    phoneNumberPrefix?: string;
    legalId?: string;
    legalIdType?: string;
  };
}

export interface WompiTransaction {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
  reference: string;
  amount_in_cents: number;
  currency: string;
  payment_method_type: string;
  customer_email: string;
}

// El tipo global del widget se declara aquí para evitar errores TS
declare global {
  interface Window {
    WidgetCheckout?: new (config: object) => {
      open: (callback: (result: { transaction: WompiTransaction }) => void) => void;
    };
  }
}

// ── Servicio ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class WompiService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiUrl ?? '/api';
  private scriptLoaded = false;

  /** Carga el script del widget de Wompi (solo una vez). */
  loadWidget(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded || (globalThis as any).WidgetCheckout) {
        this.scriptLoaded = true;
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.wompi.co/widget.js';
      script.dataset['render'] = 'false';
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('No se pudo cargar el widget de Wompi'));
      document.head.appendChild(script);
    });
  }

  /** Solicita al backend la firma + referencia para abrir el widget. */
  getSignatureData(payload: {
    amount: number;
    orderId?: string;
    currency?: string;
  }): Promise<WompiSignatureData> {
    return firstValueFrom(
      this.http.post<WompiSignatureData>(`${this.apiBase}/wompi/signature`, payload)
    );
  }

  /** Consulta el estado de una transacción. */
  getTransaction(transactionId: string): Promise<{ data: WompiTransaction }> {
    return firstValueFrom(
      this.http.get<{ data: WompiTransaction }>(
        `${this.apiBase}/wompi/transaction/${transactionId}`
      )
    );
  }

  /**
   * Abre el checkout de Wompi y resuelve la promesa cuando el usuario
   * termina (pago aprobado, rechazado o cancela).
   */
  openCheckout(config: WompiCheckoutConfig): Promise<WompiTransaction> {
    return new Promise((resolve, reject) => {
      const WidgetCheckout = (globalThis as any).WidgetCheckout;
      if (!WidgetCheckout) {
        reject(new Error('El widget de Wompi no está cargado'));
        return;
      }

      const checkout = new WidgetCheckout({
        currency: config.currency || 'COP',
        amountInCents: config.amountInCents,
        reference: config.reference,
        publicKey: config.publicKey,
        redirectUrl:
          config.redirectUrl || `${globalThis.location.origin}/pago-resultado`,
        signature: { integrity: config.integrity },
        ...(config.customerData ? { customerData: config.customerData } : {}),
      });

      checkout.open((result: { transaction: WompiTransaction }) => {
        if (result?.transaction) {
          resolve(result.transaction);
        } else {
          reject(new Error('Pago cancelado o sin resultado'));
        }
      });
    });
  }
}
