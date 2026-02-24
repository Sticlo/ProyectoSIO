import { Component, signal, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { WhatsAppService } from '../../../core/services/whatsapp.service';
import { OrderService } from '../../../core/services/order.service';
import { SiteConfig } from '../../../config/site.config';

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.scss']
})
export class CheckoutModalComponent {
  private cartService = inject(CartService);
  private whatsappService = inject(WhatsAppService);
  private orderService = inject(OrderService);
  
  isOpen = signal(false);
  isProcessing = signal(false);
  errorMessage = signal<string | null>(null);
  
  // Customer form data
  customerName = signal('');
  customerPhone = signal('');
  customerAddress = signal('');
  customerNotes = signal('');
  
  // Outputs
  close = output<void>();
  success = output<void>();
  
  // Cart data
  cartItems = this.cartService.cartItems;
  totalPrice = this.cartService.totalPrice;
  
  open(): void {
    this.isOpen.set(true);
    this.errorMessage.set(null);
    // Reset form
    this.customerName.set('');
    this.customerPhone.set('');
    this.customerAddress.set('');
    this.customerNotes.set('');
  }
  
  closeModal(): void {
    if (this.isProcessing()) return;
    this.isOpen.set(false);
    this.close.emit();
  }
  
  /**
   * Valida y formatea el número de teléfono
   * Acepta formatos: 3001234567, +573001234567, 573001234567
   */
  private formatPhoneNumber(phone: string): string {
    // Remover espacios, guiones y paréntesis
    let cleaned = phone.replace(/[\s\-()]/g, '');
    
    // Remover el símbolo +
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    // Si empieza con 57 (código de Colombia), dejarlo así
    if (cleaned.startsWith('57')) {
      return cleaned;
    }
    
    // Si es un número de 10 dígitos que empieza con 3 (móvil colombiano)
    if (cleaned.length === 10 && cleaned.startsWith('3')) {
      return '57' + cleaned;
    }
    
    // Si es un número de 10 dígitos que no empieza con 3
    if (cleaned.length === 10) {
      return '57' + cleaned;
    }
    
    // Retornar como está si no coincide con ningún patrón
    return cleaned;
  }
  
  /**
   * Valida el formulario
   */
  private validateForm(): { valid: boolean; message?: string } {
    const name = this.customerName().trim();
    const phone = this.customerPhone().trim();
    
    if (!name) {
      return { valid: false, message: 'Por favor ingresa tu nombre completo' };
    }
    
    if (name.length < 3) {
      return { valid: false, message: 'El nombre debe tener al menos 3 caracteres' };
    }
    
    if (!phone) {
      return { valid: false, message: 'Por favor ingresa tu número de teléfono' };
    }
    
    // Validar que el teléfono tenga al menos 10 dígitos
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length < 10) {
      return { valid: false, message: 'Por favor ingresa un número de teléfono válido (mínimo 10 dígitos)' };
    }
    
    return { valid: true };
  }
  
  /**
   * Procesar el checkout
   * 1. Valida el formulario
   * 2. Llama al backend (verifica stock y crea la orden)
   * 3. Solo si el backend responde OK abre WhatsApp
   * 4. Si hay error de stock muestra mensaje inline (no abre WhatsApp)
   */
  async processCheckout(): Promise<void> {
    const items = this.cartItems();
    const subtotal = this.totalPrice();
    
    if (items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    
    // Validar formulario
    const validation = this.validateForm();
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    
    this.isProcessing.set(true);
    this.errorMessage.set(null);
    
    try {
      // Preparar info del cliente
      const customerInfo: CustomerInfo = {
        name: this.customerName().trim(),
        phone: this.formatPhoneNumber(this.customerPhone().trim()),
        address: this.customerAddress().trim() || undefined,
        notes: this.customerNotes().trim() || undefined
      };
      
      // Calcular costo de envío
      const shippingCost = SiteConfig.orders.shipping.isFree || 
                          subtotal >= SiteConfig.orders.shipping.freeShippingThreshold
        ? 0
        : SiteConfig.orders.shipping.cost;
      
      const total = subtotal + shippingCost;
      
      // Primero guardar el pedido en el backend (verifica stock)
      // Si hay error de stock el backend responde 400 y NO se abre WhatsApp
      await firstValueFrom(
        this.orderService.createOrder(
          customerInfo.phone,
          items,
          total,
          shippingCost,
          customerInfo.name,
          customerInfo.address,
          customerInfo.notes
        )
      );

      // Stock OK y orden guardada → ahora sí abrir WhatsApp
      this.whatsappService.openWhatsApp(customerInfo, items, total, shippingCost);
      
      // Limpiar el carrito si está configurado
      if (SiteConfig.orders.clearCartAfterCheckout) {
        this.cartService.clearCart();
      }
      
      this.success.emit();
      this.closeModal();
    } catch (error: any) {
      console.error('Error al procesar el pedido:', error);
      // Intentar extraer el mensaje de error del backend (ej: stock insuficiente)
      const backendMsg = error?.error?.error || error?.message || null;
      if (backendMsg) {
        this.errorMessage.set(backendMsg);
      } else {
        this.errorMessage.set('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
      }
    } finally {
      this.isProcessing.set(false);
    }
  }
  
  /**
   * Formatear número de teléfono mientras se escribe
   */
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Remover todo excepto números y el símbolo +
    value = value.replace(/[^\d+]/g, '');
    
    // Limitar longitud
    if (value.startsWith('+')) {
      value = value.substring(0, 13); // +573001234567
    } else {
      value = value.substring(0, 12); // 573001234567
    }
    
    this.customerPhone.set(value);
  }
}
