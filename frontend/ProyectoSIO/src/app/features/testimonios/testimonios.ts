import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonios.html',
  styleUrl: './testimonios.scss'
})
export class Testimonios {
  testimonios = [
    {
      nombre: 'Carlos Mendoza',
      cargo: 'Gerente de Operaciones',
      empresa: 'TechCorp S.A.',
      avatar: '👨‍💼',
      estrellas: 5,
      texto: 'SIO transformó completamente la manera en que gestionamos nuestro negocio. La plataforma es intuitiva y el soporte es excepcional. En menos de un mes ya teníamos todo el equipo operando con fluidez.'
    },
    {
      nombre: 'María González',
      cargo: 'Directora Comercial',
      empresa: 'Innovate Solutions',
      avatar: '👩‍💼',
      estrellas: 5,
      texto: 'Llevábamos años buscando una solución que integrara inventario, pedidos y finanzas en un solo lugar. Con SIO lo logramos. La visibilidad en tiempo real de nuestros datos cambió nuestra toma de decisiones.'
    },
    {
      nombre: 'Andrés Pérez',
      cargo: 'Fundador',
      empresa: 'Startup Digital',
      avatar: '🧑‍💻',
      estrellas: 5,
      texto: 'Como startup, necesitábamos una herramienta escalable que creciera con nosotros. SIO cumplió todas nuestras expectativas. El panel de administración es poderoso y muy fácil de usar.'
    },
    {
      nombre: 'Laura Jiménez',
      cargo: 'Administradora',
      empresa: 'Distribuidora Norte',
      avatar: '👩‍🏫',
      estrellas: 4,
      texto: 'El módulo de inventario me ahorra horas de trabajo cada semana. Las alertas de stock crítico son muy útiles y el reporte de finanzas me da una visión clara del negocio en segundos.'
    },
    {
      nombre: 'Roberto Sánchez',
      cargo: 'CEO',
      empresa: 'Grupo Empresarial RS',
      avatar: '👨‍🦱',
      estrellas: 5,
      texto: 'Excelente plataforma. La implementación fue rápida y el equipo de soporte estuvo disponible en todo momento. Los resultados en eficiencia operativa fueron visibles desde la primera semana.'
    },
    {
      nombre: 'Sofía Castro',
      cargo: 'Coordinadora de Ventas',
      empresa: 'Retail Plus',
      avatar: '👩‍🦰',
      estrellas: 5,
      texto: 'El chatbot con IA es increíble. Nuestros clientes pueden consultar productos y hacer pedidos en cualquier momento. Redujimos el tiempo de atención en un 60% desde que implementamos SIO.'
    }
  ];

  stats = [
    { valor: '500+', etiqueta: 'Empresas confían en SIO' },
    { valor: '98%', etiqueta: 'Satisfacción de clientes' },
    { valor: '60%', etiqueta: 'Reducción en tiempo operativo' },
    { valor: '24/7', etiqueta: 'Soporte disponible' }
  ];

  getEstrellas(n: number): number[] {
    return Array(n).fill(0);
  }
}
