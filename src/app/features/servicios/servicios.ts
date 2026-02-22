import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicios.html',
  styleUrl: './servicios.scss'
})
export class Servicios {
  services = [
    {
      icon: '💻',
      title: 'Desarrollo Web',
      description: 'Aplicaciones web modernas y escalables con las últimas tecnologías'
    },
    {
      icon: '📱',
      title: 'Desarrollo Móvil',
      description: 'Apps nativas y multiplataforma para iOS y Android'
    },
    {
      icon: '☁️',
      title: 'Soluciones Cloud',
      description: 'Infraestructura y servicios en la nube optimizados'
    },
    {
      icon: '🛡️',
      title: 'Ciberseguridad',
      description: 'Protección integral de datos y sistemas empresariales'
    },
    {
      icon: '📊',
      title: 'Business Intelligence',
      description: 'Análisis de datos y reportes para decisiones estratégicas'
    },
    {
      icon: '🤖',
      title: 'Inteligencia Artificial',
      description: 'Soluciones de IA y machine learning personalizadas'
    }
  ];
}
