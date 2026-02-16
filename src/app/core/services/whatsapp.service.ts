import { Injectable } from '@angular/core';
import { CartItem } from './cart.service';
import { SiteConfig } from '../../config/site.config';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  // Número de WhatsApp del destinatario (desde configuración)
  private readonly phoneNumber = SiteConfig.contact.whatsapp;
  
  /**
   * Envía un pedido por WhatsApp
   * Abre WhatsApp con un mensaje pre-formateado con los detalles del pedido
   */
  sendOrder(items: CartItem[], total: number): void {
    const message = this.formatOrderMessage(items, total);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en una nueva ventana
    window.open(whatsappUrl, '_blank');
  }
  
  /**
   * Formatea el mensaje del pedido para WhatsApp
   */
  private formatOrderMessage(items: CartItem[], total: number): string {
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
   * Envía un mensaje de consulta general
   */
  sendInquiry(message: string): void {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
}
