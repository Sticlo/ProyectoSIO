import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class Pricing {
  pricingPlans = [
    {
      name: 'Landing Page Profesional',
      description: 'Sitio estático perfecto para empresas que quieren presentar su negocio y captar clientes',
      priceCOP: '700.000',
      priceUSD: '175',
      period: 'pago único',
      popular: false,
      icon: '🎨',
      features: [
        'Diseño moderno y responsivo',
        'Hasta 5 secciones personalizadas',
        'Optimizado para SEO',
        'Formulario de contacto integrado',
        'Integración con WhatsApp y redes sociales',
        'Certificado SSL incluido',
        'Hosting 1 año incluido',
        'Soporte por 3 meses',
      ],
      cta: 'Solicitar Presupuesto',
      ctaLink: '/contacto',
    },
    {
      name: 'Plataforma Web Completa',
      description: 'Sistema escalable con carrito de compras, automatización y panel de administración avanzado',
      priceCOP: '2.500.000',
      priceUSD: '625',
      period: 'pago único',
      popular: true,
      icon: '🚀',
      features: [
        'Diseño personalizado y responsivo',
        'Carrito de compras integrado',
        'Panel de administración completo',
        'Sistema de usuarios y autenticación',
        'Integraciones de pago (Wompi, Stripe)',
        'Automatización de procesos y notificaciones',
        'Base de datos escalable',
        'WhatsApp, email y SMS automatizados',
        'Analytics y reportes en tiempo real',
        'Certificado SSL incluido',
        'Hosting 1 año incluido',
        'Soporte por 6 meses',
      ],
      cta: 'Agendar Consulta',
      ctaLink: '/contacto',
    },
  ];

  includedFeatures = [
    'Equipo de 3 profesionales especializados en desarrollo web',
    'Consultoría gratuita para elegir el plan perfecto',
    'Proceso transparente y comunicación constante',
    'Entrega de código documentado y mantenible',
  ];
}
