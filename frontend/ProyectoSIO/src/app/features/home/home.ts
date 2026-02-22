import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { TestimonialCardComponent, Testimonial } from '../../shared/components/testimonial-card/testimonial-card.component';

@Component({
  selector: 'app-home',
  imports: [ButtonComponent, TestimonialCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  // Testimonios
  testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Carlos Méndez',
      role: 'Director General',
      company: 'Fashion Boutique',
      content: 'La plataforma e-commerce que desarrollaron transformó nuestro negocio. Las ventas en línea aumentaron un 300% en los primeros 3 meses.',
      rating: 5
    },
    {
      id: '2',
      name: 'Laura Sánchez',
      role: 'Dueña',
      company: 'Tienda Local',
      content: 'El panel de administración es intuitivo y completo. Puedo gestionar inventario, pedidos y finanzas desde cualquier lugar.',
      rating: 5
    },
    {
      id: '3',
      name: 'Roberto Jiménez',
      role: 'CEO',
      company: 'TechStore',
      content: 'La integración con WhatsApp fue un cambio radical. Nuestros clientes ahora realizan pedidos fácilmente y nosotros gestionamos todo desde un solo lugar.',
      rating: 5
    }
  ];
  
  // Estadísticas
  stats = [
    { value: '50+', label: 'Proyectos Exitosos' },
    { value: '99%', label: 'Satisfacción Cliente' },
    { value: '24/7', label: 'Soporte Técnico' }
  ];
}

