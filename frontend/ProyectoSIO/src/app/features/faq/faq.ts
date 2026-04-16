import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class FAQ {
  faqItems: FAQItem[] = [
    {
      id: 'q1',
      category: 'General',
      question: '¿Qué es SIO?',
      answer:
        'SIO es una plataforma de inteligencia artificial empresarial que permite crear, entrenar y desplegar agentes autónomos sin necesidad de experiencia en machine learning. Nuestro enfoque está en automatizar tareas complejas de negocio.',
    },
    {
      id: 'q2',
      category: 'General',
      question: '¿Para qué empresas es SIO?',
      answer:
        'SIO es para cualquier empresa: startups, PyMES, empresas medianas y grandes. Funciona en sectores como comercio electrónico, logística, atención al cliente, finanzas y recursos humanos.',
    },
    {
      id: 'q3',
      category: 'General',
      question: '¿Cuál es el modelo de precios?',
      answer:
        'Ofrecemos dos planes: Professional ($499/mes) para equipos pequeños e intermedios, y Enterprise ($1499/mes) para empresas grandes con necesidades personalizadas. Ambos incluyen 14 días de prueba gratis.',
    },
    {
      id: 'q4',
      category: 'Técnico',
      question: '¿Puedo integrar mis sistemas existentes?',
      answer:
        'Sí, SIO se integra con CRM, bases de datos, pasarelas de pago, WhatsApp, Slack y cualquier API REST. Tenemos guías de integración detalladas y un equipo listo para ayudarte.',
    },
    {
      id: 'q5',
      category: 'Técnico',
      question: '¿Es seguro usar SIO con datos sensibles?',
      answer:
        'Absolutamente. Cumplimos con GDPR, ISO 27001, SOC 2 Type II y tenemos encriptación end-to-end. Tus datos se almacenan en servidores seguros con acceso controlado y auditorías regulares.',
    },
    {
      id: 'q6',
      category: 'Técnico',
      question: '¿Qué idiomas soporta?',
      answer:
        'SIO soporta más de 50 idiomas, incluyendo español, inglés, portugués, francés, alemán y muchos más. Los agentes pueden responder y procesar automáticamente en el idioma del usuario.',
    },
    {
      id: 'q7',
      category: 'Implementación',
      question: '¿Cuánto tiempo tarda implementar SIO?',
      answer:
        'La mayoría de implementaciones toman entre 2-4 semanas. Para clientes Enterprise, ofrecemos onboarding acelerado con expertos dedicados que pueden reducir esto a 1 semana.',
    },
    {
      id: 'q8',
      category: 'Implementación',
      question: '¿Necesito personal técnico especial?',
      answer:
        'No necesariamente. SIO fue diseñado para ser usado por no-técnicos. Sin embargo, tenemos APIs y webhooks para desarrolladores que quieran personalizaciones avanzadas.',
    },
    {
      id: 'q9',
      category: 'Soporte',
      question: '¿Qué tipo de soporte recibo?',
      answer:
        'Professional incluye soporte por email (48h de respuesta). Enterprise incluye soporte prioritario 24/7, llamadas semanales con tu equipo dedicado y asesoramiento estratégico.',
    },
    {
      id: 'q10',
      category: 'Soporte',
      question: '¿Hay comunidad o recursos?',
      answer:
        'Sí, tenemos documentación completa, tutoriales en video, webinars gratuitos mensuales y una comunidad Slack activa donde puedes conectar con otros usuarios.',
    },
    {
      id: 'q11',
      category: 'Soporte',
      question: '¿Qué pasa si quiero cancelar?',
      answer:
        'Puedes cancelar en cualquier momento sin penalidades. No hay contratos de permanencia. Si changeas de opinión, tu cuenta se reactiva sin perder datos durante 30 días.',
    },
    {
      id: 'q12',
      category: 'ROI',
      question: '¿Cuánto puedo ahorrar con SIO?',
      answer:
        'Nuestros clientes reportan un promedio de 40-60% reducción en costos operativos y 30-50% mejora en tiempos de respuesta. El ROI típico es 3-6 meses dependiendo del caso de uso.',
    },
  ];

  categories = ['General', 'Técnico', 'Implementación', 'Soporte', 'ROI'];
  selectedCategory = signal<string>('General');
  expandedId = signal<string | null>(null);

  toggleFAQ(id: string) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  getFilteredItems() {
    return this.faqItems.filter((item) => item.category === this.selectedCategory());
  }
}
