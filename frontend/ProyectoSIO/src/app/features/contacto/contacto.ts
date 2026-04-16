import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss'
})
export class Contacto {
  formData = signal({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  submitted = signal(false);
  loading = signal(false);
  
  contactChannels = [
    {
      icon: '✉️',
      title: 'Email',
      description: 'Respuesta en 24-48 horas',
      value: 'hello@sio.com',
      link: 'mailto:hello@sio.com'
    },
    {
      icon: '💬',
      title: 'WhatsApp',
      description: 'Chat en vivo durante horario laboral',
      value: '+57 322 7067516',
      link: 'https://wa.me/573227067516'
    },
    {
      icon: '📍',
      title: 'Oficina',
      description: 'Lun - Vie: 9:00 - 18:00 (GMT-5)',
      value: 'Bogotá, Colombia',
      link: '#'
    },
    {
      icon: '🎯',
      title: 'Agenda',
      description: 'Reserva una llamada directa',
      value: 'Calendly',
      link: '#'
    }
  ];
  
  private readonly WHATSAPP_NUMBER = '573227067516';

  onSubmit() {
    if (!this.formData().name || !this.formData().email || !this.formData().message) {
      alert('Por favor completa todos los campos');
      return;
    }

    this.loading.set(true);
    const data = this.formData();

    // Construir mensaje para WhatsApp
    const text = [
      `Hola, me contacto desde el sitio web SIO.`,
      `*Nombre:* ${data.name}`,
      `*Email:* ${data.email}`,
      data.subject ? `*Asunto:* ${data.subject}` : '',
      `*Mensaje:* ${data.message}`
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');

    setTimeout(() => {
      this.loading.set(false);
      this.submitted.set(true);
      this.formData.set({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => {
        this.submitted.set(false);
      }, 4000);
    }, 500);
  }
}
