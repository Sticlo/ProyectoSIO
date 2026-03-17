import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PSEBank {
  code: string;
  name: string;
}

export const PSE_BANKS: PSEBank[] = [
  { code: '1007', name: 'BANCOLOMBIA' },
  { code: '1040', name: 'BANCO AGRARIO' },
  { code: '1052', name: 'BANK OF AMERICA' },
  { code: '1032', name: 'BANCO CAJA SOCIAL BCSC' },
  { code: '1061', name: 'BANCO COOPERATIVO COOPCENTRAL' },
  { code: '1066', name: 'BANCO CREDIFINANCIERA' },
  { code: '1051', name: 'BANCO DAVIVIENDA' },
  { code: '1001', name: 'BANCO DE BOGOTA' },
  { code: '1023', name: 'BANCO DE OCCIDENTE' },
  { code: '1062', name: 'BANCO FALABELLA' },
  { code: '1012', name: 'BANCO GNB SUDAMERIS' },
  { code: '1006', name: 'BANCO ITAU CORPBANCA' },
  { code: '1060', name: 'BANCO PICHINCHA' },
  { code: '1002', name: 'BANCO POPULAR' },
  { code: '1058', name: 'BANCO PROCREDIT' },
  { code: '1009', name: 'CITIBANK' },
  { code: '1289', name: 'CONFIAR COOPERATIVA FINANCIERA' },
  { code: '1370', name: 'COOFINEP COOPERATIVA FINANCIERA' },
  { code: '1292', name: 'COTRAFA COOPERATIVA FINANCIERA' },
  { code: '1283', name: 'COOPERATIVA FINANCIERA DE ANTIOQUIA' },
  { code: '1151', name: 'DAVIPLATA' },
  { code: '1507', name: 'NEQUI' },
  { code: '1303', name: 'SCOTIABANK COLPATRIA' },
];

@Injectable({ providedIn: 'root' })
export class StripeService {
  private readonly http = inject(HttpClient);
  private stripePromise: Promise<Stripe | null> | null = null;
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  /** Carga Stripe.js de forma diferida (lazy) */
  loadStripe(): Promise<Stripe | null> {
    this.stripePromise ??= loadStripe(environment.stripePublishableKey);
    return this.stripePromise;
  }

  /** Crea un PaymentIntent para tarjeta en el backend */
  createCardIntent(params: {
    amount: number;
    customerEmail?: string;
    customerName?: string;
    orderId?: string;
  }): Promise<CreateIntentResponse> {
    return firstValueFrom(
      this.http.post<CreateIntentResponse>(`${this.apiUrl}/create-intent`, {
        ...params,
        currency: 'cop',
      })
    );
  }

  /** Crea un PaymentIntent para PSE en el backend */
  createPSEIntent(params: {
    amount: number;
    customerEmail: string;
    customerName?: string;
    customerPhone?: string;
    orderId?: string;
  }): Promise<CreateIntentResponse> {
    return firstValueFrom(
      this.http.post<CreateIntentResponse>(`${this.apiUrl}/create-pse-intent`, {
        ...params,
        currency: 'cop',
      })
    );
  }

  /** Confirma el pago PSE con el banco seleccionado */
  confirmPSE(params: {
    paymentIntentId: string;
    bankCode: string;
    customerEmail: string;
    customerName?: string;
    returnUrl?: string;
  }): Promise<{ status: string; redirectUrl: string | null }> {
    return firstValueFrom(
      this.http.post<{ status: string; redirectUrl: string | null }>(
        `${this.apiUrl}/confirm-pse`,
        params
      )
    );
  }

  /** Confirma el pago con tarjeta usando Stripe.js */
  async confirmCardPayment(
    stripe: Stripe,
    elements: StripeElements,
    cardElement: StripeCardElement,
    clientSecret: string,
    billingDetails: { name: string; email?: string }
  ) {
    return stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: billingDetails,
      },
    });
  }

  /** Consulta el estado de un pago */
  getPaymentStatus(paymentIntentId: string) {
    return firstValueFrom(
      this.http.get<{ status: string; amount: number; currency: string }>(
        `${this.apiUrl}/status/${paymentIntentId}`
      )
    );
  }
}
