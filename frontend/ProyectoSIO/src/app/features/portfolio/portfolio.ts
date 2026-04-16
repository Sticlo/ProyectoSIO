import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface CaseStudy {
  id: string;
  company: string;
  industry: string;
  icon: string;
  challenge: string;
  solution: string;
  result: string;
  metrics: Array<{ label: string; value: string }>;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class Portfolio {
  caseStudies: CaseStudy[] = [
    {
      id: 'case-1',
      company: 'FastShip Logistics',
      industry: 'Logística y Entregas',
      icon: '🚚',
      challenge: 'Procesaban 500+ solicitudes de estado de pedidos diarias manualmente, lo que demoraba 2-3 horas de latencia.',
      solution: 'Implementamos un agente IA que atiende consultas de clientes en WhatsApp, integrado con su sistema de rastreo en tiempo real.',
      result: 'Reducción del 85% en solicitudes manuales, 15 segundos de promedio de respuesta y 40% de reducción en costos operativos.',
      metrics: [
        { label: 'Reducción de Tareas Manuales', value: '85%' },
        { label: 'Tiempo de Respuesta', value: '15 seg' },
        { label: 'ROI', value: '280%' },
        { label: 'Tiempo a ROI', value: '4 meses' },
      ],
      testimonial: {
        quote:
          'SIO transformó completamente cómo atendemos clientes. Pasamos de saturados a eficientes en cuestión de semanas.',
        author: 'Carlos Mendez',
        role: 'CEO de FastShip Logistics',
      },
    },
    {
      id: 'case-2',
      company: 'EcomPro Store',
      industry: 'E-commerce',
      icon: '🛍️',
      challenge:
        'Perdían ventas por falta de atención personalizada. Los clientes se iban sin respuesta en horarios no comerciales.',
      solution:
        'Creamos un chatbot de IA que califica leads, responde preguntas de productos y redirige a vendedores humanos cuando es necesario.',
      result: 'Aumento de 38% en conversiones, reducción de cart abandonment en 22% y satisfacción de cliente 4.8/5.',
      metrics: [
        { label: 'Aumento en Conversiones', value: '+38%' },
        { label: 'Reducción Cart Abandonment', value: '-22%' },
        { label: 'Satisfacción Cliente', value: '4.8/5' },
        { label: 'Leads Calificados/mes', value: '2500+' },
      ],
      testimonial: {
        quote:
          'El chatbot de SIO funciona como si fuera parte de nuestro equipo. Muy inteligente y fácil de mantener.',
        author: 'Sofia Rios',
        role: 'Gerenta de Operaciones, EcomPro',
      },
    },
    {
      id: 'case-3',
      company: 'FinServe Bank',
      industry: 'Finanzas y Banca',
      icon: '🏦',
      challenge:
        'Recibían 10,000+ consultas mensuales sobre saldos, transferencias y otros. Personal limitado no daba abasto.',
      solution:
        'Sistema de agentes IA con acceso seguro a APIs bancarias para resolver consultas automáticamente sin intervención humana.',
      result: 'Automatización del 73% de consultas, reducción de tiempo promedio de resolución de 24h a 30 segundos.',
      metrics: [
        { label: 'Automatización de Consultas', value: '73%' },
        { label: 'Mejora en Latencia', value: '2880x' },
        { label: 'Ahorros Anuales', value: '$180K' },
        { label: 'CSAT Score', value: '4.6/5' },
      ],
    },
    {
      id: 'case-4',
      company: 'TechRecruit HR',
      industry: 'Recursos Humanos',
      icon: '👥',
      challenge:
        'Procesaba candidaturas de forma lenta. Tardaban semanas en primera entrevista. Perdían talento por demoras.',
      solution:
        'Agente de IA realiza pre-screening automático, programa entrevistas y envía actualizaciones a candidatos.',
      result:
        'Tiempo a primer contact reducido de 5 días a 2 horas. Aumento de 60% en tasa de aplicación y 25% en tiempo a hire.',
      metrics: [
        { label: 'Reducción Tiempo a Contact', value: '-96%' },
        { label: 'Aumento de Aplicaciones', value: '+60%' },
        { label: 'Mejora en Time-to-Hire', value: '-25%' },
        { label: 'Automatización', value: '80%' },
      ],
    },
    {
      id: 'case-5',
      company: 'HealthCare Plus',
      industry: 'Salud',
      icon: '⚕️',
      challenge:
        'Clínica recibía 200+ llamadas diarias. Saturación en recepción. Pacientes no podían agendar citas fuera de horario.',
      solution:
        'Chatbot inteligente que agenda citas, valida seguros, recuerda citas y resuelve consultas de pacientes.',
      result:
        'Aumento de 45% en citas agendadas online, reducción de no-shows en 35%, mejor experiencia del paciente.',
      metrics: [
        { label: 'Citas Agendadas Online', value: '+45%' },
        { label: 'Reducción No-Shows', value: '-35%' },
        { label: 'Disponibilidad 24/7', value: '✓' },
        { label: 'NPS Score', value: '72' },
      ],
    },
    {
      id: 'case-6',
      company: 'RetailChain Store',
      industry: 'Retail',
      icon: '🏬',
      challenge:
        'Múltiples tiendas físicas. Clientes consultaban disponibilidad de stock. Manual consume mucho tiempo de cajeras.',
      solution:
        'Agente IA en Whatsapp que verifica stock real-time en todas las sucursales y reserva productos automáticamente.',
      result:
        'Reducción de 70% en consultas de stock al personal. Aumento de cross-selling por recomendaciones personalizadas.',
      metrics: [
        { label: 'Consultas Automatizadas', value: '70%' },
        { label: 'Tiempo de Respuesta', value: '<5 seg' },
        { label: 'Satisfacción', value: '4.7/5' },
        { label: 'Incremento Ventas', value: '+18%' },
      ],
    },
  ];

  stats = [
    { label: 'Empresas Transformadas', value: '150+' },
    { label: 'Millones en Ahorros', value: '$45M+' },
    { label: 'Procesos Automatizados', value: '1200+' },
    { label: 'ROI Promedio', value: '340%' },
  ];

  industries = ['Logística', 'E-commerce', 'Finanzas', 'RRHH', 'Salud', 'Retail'];
}
