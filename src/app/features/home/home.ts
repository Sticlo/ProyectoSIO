import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductCardComponent, Product } from '../../shared/components/product-card/product-card.component';
import { TestimonialCardComponent, Testimonial } from '../../shared/components/testimonial-card/testimonial-card.component';

@Component({
  selector: 'app-home',
  imports: [ButtonComponent, ProductCardComponent, TestimonialCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  // Productos destacados
  featuredProducts: Product[] = [
    {
      id: '1',
      name: 'Producto Premium',
      description: 'Descripción elegante del producto con las mejores características.',
      price: 299.99,
      badge: 'Nuevo'
    },
    {
      id: '2',
      name: 'Edición Limitada',
      description: 'Producto exclusivo de nuestra colección especial.',
      price: 399.99,
      badge: 'Exclusivo'
    },
    {
      id: '3',
      name: 'Clásico Atemporal',
      description: 'Diseño que nunca pasa de moda, calidad garantizada.',
      price: 249.99
    },
    {
      id: '4',
      name: 'Innovación 2026',
      description: 'Lo último en tecnología y diseño contemporáneo.',
      price: 449.99,
      badge: 'Popular'
    }
  ];
  
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

