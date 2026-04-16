import {
  Component, signal, output, inject, input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WompiService, WompiTransaction } from '../../../core/services/wompi.service';

export interface PaymentData {
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  orderId?: string;
}

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
})
export class PaymentModalComponent {
  private readonly wompiService = inject(WompiService);

  data = input<PaymentData | null>(null);

  paymentSuccess = output<{ transactionId: string; status: WompiTransaction['status'] }>();
  paymentCancelled = output<void>();

  isOpen          = signal(false);
  step            = signal<'summary' | 'processing' | 'success' | 'error'>('summary');
  errorMessage    = signal<string | null>(null);
  paymentData     = signal<PaymentData | null>(null);
  lastTransaction = signal<WompiTransaction | null>(null);

  open(data?: PaymentData): void {
    this.paymentData.set(data ?? this.data() ?? null);
    this.step.set('summary');
    this.errorMessage.set(null);
    this.lastTransaction.set(null);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.paymentCancelled.emit();
  }

  async pay(): Promise<void> {
    const pd = this.paymentData();
    if (!pd) return;

    this.step.set('processing');
    this.errorMessage.set(null);

    try {
      await this.wompiService.loadWidget();

      const sigData = await this.wompiService.getSignatureData({
        amount: pd.amount,
        orderId: pd.orderId,
      });

      const transaction = await this.wompiService.openCheckout({
        ...sigData,
        redirectUrl: `${globalThis.location.origin}/pago-resultado`,
        customerData: {
          email: pd.customerEmail,
          fullName: pd.customerName,
          phoneNumber: pd.customerPhone,
        },
      });

      this.lastTransaction.set(transaction);

      if (transaction.status === 'APPROVED' || transaction.status === 'PENDING') {
        this.step.set('success');
        this.paymentSuccess.emit({ transactionId: transaction.id, status: transaction.status });
      } else {
        this.errorMessage.set(
          transaction.status === 'DECLINED'
            ? 'El pago fue rechazado. Verifica los datos o prueba con otro metodo.'
            : 'Ocurrio un error al procesar el pago.'
        );
        this.step.set('error');
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Error al procesar el pago.';
      if (msg.includes('cancelado') || msg.includes('sin resultado')) {
        this.step.set('summary');
      } else {
        this.errorMessage.set(msg);
        this.step.set('error');
      }
    }
  }

  retry(): void {
    this.step.set('summary');
    this.errorMessage.set(null);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
