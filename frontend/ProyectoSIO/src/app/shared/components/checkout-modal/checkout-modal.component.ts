import { Component, signal, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { WhatsAppService } from '../../../core/services/whatsapp.service';
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
  
  isOpen = signal(false);
  isProcessing = signal(false);
  
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
      
      // Enviar pedido por WhatsApp con info del cliente
      this.whatsappService.sendOrderWithCustomerInfo(
        customerInfo,
        items,
        total,
        shippingCost
      );
      
      // Pequeña pausa para que el usuario vea que se está procesando
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Limpiar el carrito si está configurado
      if (SiteConfig.orders.clearCartAfterCheckout) {
        this.cartService.clearCart();
      }
      
      this.success.emit();
      this.closeModal();
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      alert('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
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
