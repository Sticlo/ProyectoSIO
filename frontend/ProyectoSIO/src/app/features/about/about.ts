import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  missionPoints = [
    {
      icon: '🎯',
      title: 'Nuestra Misión',
      description: 'Democratizar la inteligencia artificial para que cualquier empresa pueda automatizar procesos sin experiencia técnica previa.',
    },
    {
      icon: '🌟',
      title: 'Nuestra Visión',
      description: 'Ser la plataforma líder en Latinoamérica para crear y operar agentes de IA que transforman negocios.',
    },
    {
      icon: '💪',
      title: 'Nuestros Valores',
      description: 'Transparencia, simplidad, excelencia y compromiso con el éxito de nuestros clientes en cada paso del camino.',
    },
  ];

  teamStats = [
    { number: '50+', label: 'Proyectos Completados' },
    { number: '30K+', label: 'Usuarios Activos' },
    { number: '15+', label: 'Años de Experiencia Combinada' },
    { number: '24/7', label: 'Soporte Disponible' },
  ];

  coreValues = [
    {
      title: 'Innovación Constante',
      description: 'Invertimos en investigación y desarrollo para mantenernos a la vanguardia de la IA.',
      icon: '⚡',
    },
    {
      title: 'Seguridad Primero',
      description: 'Tus datos son sagrados. Cumplimos con GDPR, ISO 27001 y estándares de privacidad internacionales.',
      icon: '🔐',
    },
    {
      title: 'Éxito del Cliente',
      description: 'Tu éxito es nuestro éxito. Nos comprometemos a entregar ROI real y medible.',
      icon: '📈',
    },
    {
      title: 'Comunidad',
      description: 'Creemos en la colaboración. Conectamos empresas, compartimos conocimiento y crecemos juntos.',
      icon: '🤝',
    },
  ];

  timeline = [
    {
      year: '2020',
      title: 'Fundación',
      description: 'Nace SIO con la visión de llevar IA a empresas de todos los tamaños.',
    },
    {
      year: '2021',
      title: 'Primera Versión API',
      description: 'Lanzamos nuestra API REST con soporte para integraciones básicas.',
    },
    {
      year: '2022',
      title: 'Plataforma de Agentes',
      description: 'Presentamos el motor de agentes autónomos con workflows personalizables.',
    },
    {
      year: '2023',
      title: 'Expansión Regional',
      description: 'Llegamos a 5 países en Latinoamérica con oficinas en principales ciudades.',
    },
    {
      year: '2024',
      title: 'Modelo Empresarial',
      description: 'Lanzamos Enterprise con SLA 99.99% y soporte dedicado 24/7.',
    },
    {
      year: '2025',
      title: 'IA Personalizada',
      description: 'Introducimos modelos de IA personalizados para casos de uso específicos.',
    },
  ];
}
