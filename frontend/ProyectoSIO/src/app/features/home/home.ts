import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly productService = inject(ProductService);

  quickstartCode = `import { createAgent, workflow } from "@sio/core";

const supportAgent = createAgent({
  name: "Support Assistant",
  model: "gpt-5.3-codex",
  memory: true,
});

const onboarding = workflow("customer-onboarding")
  .step("qualify")
  .step("propose")
  .step("close");

await supportAgent.run(onboarding);`;

  featuredProducts = computed(() =>
    this.productService.allProducts().slice(0, 6)
  );

  processSteps = [
    {
      number: '01',
      title: 'Entiendemos tu visión',
      description: 'Nos sumergimos en tu negocio: objetivos, público objetivo y necesidades técnicas para un proyecto alineado.'
    },
    {
      number: '02',
      title: 'Diseño + Experiencia',
      description: 'Creamos una experiencia visual atractiva y funcional que convierte visitantes en clientes.'
    },
    {
      number: '03',
      title: 'Desarrollo profesional',
      description: 'Construimos tu sitio con código limpio, seguro y optimizado para rendimiento máximo.'
    },
    {
      number: '04',
      title: 'Lanzamiento perfecto',
      description: 'Publicamos, configuramos SEO y te entregamos documentación completa para que gestiones tu web.'
    }
  ];

  stats = [
    { value: '50+', label: 'Proyectos completados' },
    { value: '✓ 100%', label: 'Clientes satisfechos' },
    { value: '3', label: 'Profesionales dedicados' },
    { value: '24/7', label: 'Soporte disponible' }
  ];

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }
}
