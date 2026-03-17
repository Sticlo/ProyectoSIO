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
    { name: 'Marlon Pérez', role: 'CEO & Marketing', image: '👨‍💼' },
    { name: 'Juan Aguilar', role: 'Desarrollador', image: '👨‍💻' },
    { name: 'Thomas Cortés', role: 'Desarrollador', image: '👨‍💻' },
    { name: 'Santiago Gómez', role: 'Desarrollador', image: '👨‍💻' },
    { name: 'Jair Erazo', role: 'Diseñador UI/UX', image: '🎨' }
  ];

  values = [
    { icon: '💻', title: 'Desarrollo Web', description: 'Creamos sitios y aplicaciones web a medida con las últimas tecnologías' },
    { icon: '🚀', title: 'Potencia tus Ventas', description: 'Diseñamos soluciones digitales que impulsan el crecimiento de tu negocio' },
    { icon: '🤝', title: 'Asesoría Personalizada', description: 'Acompañamos a cada cliente desde la idea hasta el lanzamiento' },
    { icon: '⚡', title: 'Agilidad', description: 'Entregas rápidas, iterativas y adaptadas a tus necesidades' }
  ];
}
