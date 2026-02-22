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
    { icon: '📧', label: 'Email', value: 'contacto@sio.com' },
    { icon: '📱', label: 'Teléfono', value: '+1 234 567 8900' },
    { icon: '📍', label: 'Dirección', value: 'Ciudad, País' },
    { icon: '🕐', label: 'Horario', value: 'Lun - Vie: 9:00 - 18:00' }
  ];
  
  onSubmit() {
    console.log('Formulario enviado:', this.formData());
    this.submitted.set(true);
    
    setTimeout(() => {
      this.submitted.set(false);
      this.formData.set({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    }, 3000);
  }
}
