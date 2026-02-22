import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.scss'
})
export class Nosotros {
  team = [
    { name: 'María González', role: 'CEO & Fundadora', image: '👩‍💼' },
    { name: 'Carlos Rodríguez', role: 'CTO', image: '👨‍💻' },
    { name: 'Ana Martínez', role: 'Directora de Diseño', image: '👩‍🎨' },
    { name: 'Juan López', role: 'Líder de Desarrollo', image: '👨‍🔧' }
  ];
  
  values = [
    { icon: '🎯', title: 'Innovación', description: 'Buscamos constantemente nuevas formas de resolver problemas' },
    { icon: '💎', title: 'Calidad', description: 'Excelencia en cada proyecto que entregamos' },
    { icon: '🤝', title: 'Colaboración', description: 'Trabajamos estrechamente con nuestros clientes' },
    { icon: '⚡', title: 'Agilidad', description: 'Respuesta rápida y adaptación al cambio' }
  ];
}
