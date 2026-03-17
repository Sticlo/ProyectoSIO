import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss'
})
export class Contacto {
  formData = signal({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  submitted = signal(false);
  
  contactInfo = [
    { icon: '📧', label: 'Email', value: 'gestiondecomprassio@gmail.com' },
    { icon: '📱', label: 'Teléfono', value: '+57 322 7067516' },
    { icon: '📍', label: 'Dirección', value: 'Bogotá, Colombia' },
    { icon: '🕐', label: 'Horario', value: 'Lun - Vie: 9:00 - 18:00' }
  ];
  
  private readonly WHATSAPP_NUMBER = '573227067516'; // sin +

  onSubmit() {
    const data = this.formData();

    // Construir mensaje para WhatsApp
    const text = [
      `Hola, me contacto desde el sitio web.`,
      `*Nombre:* ${data.name}`,
      `*Email:* ${data.email}`,
      data.phone ? `*Teléfono:* ${data.phone}` : '',
      `*Mensaje:* ${data.message}`
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');

    this.submitted.set(true);
    setTimeout(() => {
      this.submitted.set(false);
      this.formData.set({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  }
}
