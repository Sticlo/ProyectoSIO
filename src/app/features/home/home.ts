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
      name: 'María González',
      role: 'Directora de Marketing',
      company: 'TechCorp',
      content: 'Excelente servicio y productos de alta calidad. Han superado todas nuestras expectativas.',
      rating: 5
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      role: 'CEO',
      company: 'Innovate Inc',
      content: 'La atención al detalle es impresionante. Definitivamente volveré a comprar.',
      rating: 5
    },
    {
      id: '3',
      name: 'Ana Martínez',
      role: 'Gerente',
      company: 'StyleCo',
      content: 'Productos que realmente cumplen lo que prometen. Muy satisfecha con mi compra.',
      rating: 5
    }
  ];
  
  // Estadísticas
  stats = [
    { value: '10K+', label: 'Clientes Felices' },
    { value: '50K+', label: 'Productos Vendidos' },
    { value: '4.9', label: 'Rating Promedio' },
    { value: '24/7', label: 'Soporte' }
  ];
}

