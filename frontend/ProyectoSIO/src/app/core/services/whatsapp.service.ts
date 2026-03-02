import { Injectable, inject } from '@angular/core';
import { CartItem } from './cart.service';
import { SiteConfig } from '../../config/site.config';
import { OrderService } from './order.service';
import { InventoryService } from './inventory.service';
import { ProductService } from './product.service';
import { Observable, tap } from 'rxjs';

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private orderService = inject(OrderService);
  private inventoryService = inject(InventoryService);
  private productService = inject(ProductService);
  
  // Número de WhatsApp del destinatario (desde configuración)
  private readonly phoneNumber = SiteConfig.contact.whatsapp;
  
  /**
   * Envía un pedido por WhatsApp con información del cliente
   * Abre WhatsApp con un mensaje pre-formateado incluyendo los datos del cliente
   */
  /**
   * Solo abre WhatsApp con el pedido formateado (sin guardar en BD)
   * Usar DESPUES de que createOrder() haya tenido éxito
   */
  openWhatsApp(
    customerInfo: CustomerInfo,
    items: CartItem[],
    total: number,
    shippingCost: number = 0
  ): void {
    const message = this.formatOrderMessageWithCustomer(customerInfo, items, total, shippingCost);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Guarda el pedido en el backend Y luego abre WhatsApp si tiene éxito.
   * Retorna Observable para que el componente pueda manejar errores de stock.
   */
  sendOrderWithCustomerInfo(
    customerInfo: CustomerInfo,
    items: CartItem[],
    total: number,
    shippingCost: number = 0
  ): Observable<any> {
    return this.orderService.createOrder(
      customerInfo.phone,
      items,
      total,
      shippingCost,
      customerInfo.name,
      customerInfo.address,
      customerInfo.notes
    ).pipe(
      tap(() => this.openWhatsApp(customerInfo, items, total, shippingCost))
    );
  }
  
  /**
   * Envía un pedido por WhatsApp (método antiguo, se mantiene para compatibilidad)
   * Abre WhatsApp con un mensaje pre-formateado con los detalles del pedido
   */
  sendOrder(items: CartItem[], total: number, shippingCost: number = 0): void {
    const message = this.formatOrderMessage(items, total, shippingCost);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;

    // Abrir WhatsApp inmediatamente
    window.open(whatsappUrl, '_blank');

    // Guardar en el backend
    this.orderService.createOrder(this.phoneNumber, items, total, shippingCost).subscribe({
      error: err => console.error('No se pudo guardar la orden:', err)
    });
  }
  
  /**
   * Formatea el mensaje del pedido para WhatsApp con información del cliente
   */
  private formatOrderMessageWithCustomer(
    customerInfo: CustomerInfo,
    items: CartItem[],
    total: number,
    shippingCost: number = 0
  ): string {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let message = `🛍️ *NUEVO PEDIDO* 🛍️\n\n`;
    message += `📅 *Fecha:* ${formattedDate}\n\n`;
    
    // Datos del cliente
    message += `👤 *DATOS DEL CLIENTE*\n`;
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `• Nombre: ${customerInfo.name}\n`;
    message += `• WhatsApp: ${customerInfo.phone}\n`;
    if (customerInfo.address) {
      message += `• Dirección: ${customerInfo.address}\n`;
    }
    if (customerInfo.notes) {
      message += `• Observaciones: ${customerInfo.notes}\n`;
    }
    message += `\n`;
    
    // Productos
    message += `📦 *PRODUCTOS SOLICITADOS*\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    
    items.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      message += `${index + 1}. *${item.name}*\n`;
      if (item.category) {
        message += `   • Categoría: ${item.category}\n`;
      }
      message += `   • Cantidad: ${item.quantity}\n`;
      message += `   • Precio unitario: $${this.formatPrice(item.price)}\n`;
      message += `   • Subtotal: $${this.formatPrice(subtotal)}\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━\n`;
    
    // Costos
    const subtotal = total - shippingCost;
    if (shippingCost > 0) {
      message += `📦 Subtotal: $${this.formatPrice(subtotal)}\n`;
      message += `🚚 Envío: $${this.formatPrice(shippingCost)}\n`;
    }
    
    message += `💰 *TOTAL A PAGAR: $${this.formatPrice(total)}*\n\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    message += `✅ Tu pedido ha sido recibido correctamente.\n`;
    message += `📱 Te contactaremos pronto para confirmar los detalles.\n\n`;
    message += `🙌 ¡Gracias por tu compra!`;
    
    return message;
  }
  
  /**
   * Formatea el mensaje del pedido para WhatsApp (sin datos de cliente)
   */
  private formatOrderMessage(items: CartItem[], total: number, shippingCost: number = 0): string {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let message = `🛍️ *NUEVO PEDIDO* 🛍️\n\n`;
    message += `📅 *Fecha:* ${formattedDate}\n\n`;
    message += `📦 *Detalles del pedido:*\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    
    // Agregar cada producto
    items.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      message += `${index + 1}. *${item.name}*\n`;
      if (item.category) {
        message += `   • Categoría: ${item.category}\n`;
      }
      message += `   • Cantidad: ${item.quantity}\n`;
      message += `   • Precio unitario: $${this.formatPrice(item.price)}\n`;
      message += `   • Subtotal: $${this.formatPrice(subtotal)}\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━\n`;
    
    // Mostrar costo de envío si aplica
    const subtotal = total - shippingCost;
    if (shippingCost > 0) {
      message += `📦 Subtotal: $${this.formatPrice(subtotal)}\n`;
      message += `🚚 Envío: $${this.formatPrice(shippingCost)}\n`;
    }
    
    message += `💰 *TOTAL: $${this.formatPrice(total)}*\n\n`;
    message += `📍 *Datos del cliente:*\n`;
    message += `Por favor, proporciona los siguientes datos:\n`;
    message += `• Nombre completo:\n`;
    message += `• Dirección de entrega:\n`;
    message += `• Teléfono de contacto:\n`;
    message += `• Observaciones (opcional):\n\n`;
    message += `¡Gracias por tu compra! 🙌`;
    
    return message;
  }
  
  /**
   * Formatea el precio con separadores de miles
   */
  private formatPrice(price: number): string {
    return price.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
  
  /**
   * Envía un recordatorio al cliente sobre su pedido pendiente
   */
  sendReminder(order: any): void {
    const customerName = order.customerName || 'cliente';
    const itemsCount = order.items.length;
    const total = this.formatPrice(order.total);
    
    let message = `🔔 *Hola ${customerName}* 👋\n\n`;
    message += `Vimos que tu pedido está *pendiente* 📦\n\n`;
    message += `📋 *Resumen de tu pedido:*\n`;
    
    // Lista de productos
    order.items.forEach((item: any, index: number) => {
      message += `${index + 1}. ${item.name} x${item.quantity}\n`;
    });
    
    message += `\n💰 *Total:* ${total}\n\n`;
    message += `¿Deseas *completar tu pedido*? 🛒\n`;
    message += `Estamos aquí para ayudarte 😊`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${order.phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
  
  /**
   * Descontar stock automáticamente para los productos de una orden
   */
  private decreaseStockForOrder(items: CartItem[], orderId: string): void {
    items.forEach(item => {
      // Buscar el producto
      const product = this.productService.getById(item.productId);
      
      if (product) {
        // Descontar stock (el backend actualiza el producto automáticamente)
        this.inventoryService.decreaseStock(
          product,
          item.quantity,
          orderId
        ).subscribe({
          next: (updatedProduct) => {
            // Actualizar en el servicio de productos
            this.productService.updateProductStock(product.id, updatedProduct);
          },
          error: (err) => {
            console.error(`Error al descontar stock del producto ${product.name}:`, err);
          }
        });
      }
    });
  }
  
  /**
   * Envía un mensaje de consulta general
   */
  sendInquiry(message: string): void {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
}
