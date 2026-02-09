import { Component } from '@angular/core';
import { ProductCardComponent, Product } from '../../shared/components/product-card/product-card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-productos',
  imports: [ProductCardComponent, ButtonComponent],
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
})
export class Productos {
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

  // Todos los productos (se puede expandir)
  allProducts: Product[] = [
    ...this.featuredProducts,
    {
      id: '5',
      name: 'Elegancia Moderna',
      description: 'Fusión perfecta entre estilo y funcionalidad.',
      price: 329.99
    },
    {
      id: '6',
      name: 'Serie Signature',
      description: 'Diseño exclusivo de nuestra colección principal.',
      price: 279.99,
      badge: 'Nuevo'
    },
    {
      id: '7',
      name: 'Minimalista Pro',
      description: 'Menos es más, máxima calidad en cada detalle.',
      price: 349.99
    },
    {
      id: '8',
      name: 'Edición Especial',
      description: 'Únicamente disponible por tiempo limitado.',
      price: 479.99,
      badge: 'Exclusivo'
    }
  ];
}
