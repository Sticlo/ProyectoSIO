/**
 * Configuración centralizada del sitio
 * Este archivo permite personalizar rápidamente la plantilla para cada cliente
 */

export const SiteConfig = {
  // Información de la empresa
  branding: {
    name: 'SIO',
    tagline: 'Tu plataforma de gestión empresarial',
    description: 'Soluciones digitales para tu negocio',
    logo: '/assets/logo.png', // Ruta a tu logo
  },

  // Datos de contacto
  contact: {
    email: 'contacto@tuempresa.com',
    phone: '+123 456 7890',
    address: 'Tu dirección aquí',
    social: {
      facebook: 'https://facebook.com/tuempresa',
      instagram: 'https://instagram.com/tuempresa',
      twitter: 'https://twitter.com/tuempresa',
      linkedin: 'https://linkedin.com/company/tuempresa'
    }
  },

  // Configuración del header
  header: {
    promoBanner: 'NUEVA COLECCIÓN 2026 — ENVÍO GRATIS EN TU PRIMERA COMPRA',
    showPromoBanner: true,
    menuItems: [
      { label: 'Inicio', route: '/' },
      { label: 'Productos', route: '/productos' },
      { label: 'Categorías', route: '/categorias' },
      { label: 'Testimonios', route: '/testimonios' }
    ]
  },

  // Contenido de la página de inicio
  home: {
    hero: {
      tag: 'SELECCIÓN CURADA',
      title: 'Diseño que inspira,\ncalidad que perdura',
      description: 'Descubre nuestra colección de productos premium seleccionados con el mejor gusto. Cada pieza cuenta una historia de artesanía y atención al detalle.',
      ctaText: 'Explorar Colección',
      ctaLink: '/productos'
    },

    stats: [
      { value: '10K+', label: 'Clientes Felices' },
      { value: '50K+', label: 'Productos Vendidos' },
      { value: '4.9', label: 'Rating Promedio' },
      { value: '24/7', label: 'Soporte' }
    ],

    features: [
      {
        icon: 'layers',
        title: 'Calidad Premium',
        description: 'Productos seleccionados con los más altos estándares de calidad.'
      },
      {
        icon: 'map-pin',
        title: 'Envíos Rápidos',
        description: 'Entrega en tiempo récord a cualquier parte del país.'
      },
      {
        icon: 'check-circle',
        title: 'Garantía Total',
        description: '100% de satisfacción garantizada o te devolvemos tu dinero.'
      },
      {
        icon: 'message-circle',
        title: 'Atención 24/7',
        description: 'Soporte personalizado siempre disponible cuando lo necesites.'
      }
    ],

    newsletter: {
      title: 'Mantente al día',
      description: 'Suscríbete para recibir las últimas novedades y ofertas exclusivas',
      placeholder: 'Tu correo electrónico',
      buttonText: 'Suscribirse'
    },

    cta: {
      title: 'Comienza tu experiencia',
      description: 'Únete a miles de clientes satisfechos',
      buttonText: 'Ver Productos',
      buttonLink: '/productos'
    }
  },

  // Configuración del footer
  footer: {
    columns: [
      {
        title: null,
        isBrand: true,
        content: 'Tu plataforma de gestión empresarial. Soluciones digitales para tu negocio.'
      },
      {
        title: 'Navegación',
        links: [
          { label: 'Inicio', url: '/' },
          { label: 'Productos', url: '/productos' },
          { label: 'Categorías', url: '/categorias' },
          { label: 'Testimonios', url: '/testimonios' }
        ]
      },
      {
        title: 'Información',
        links: [
          { label: 'Sobre Nosotros', url: '/sobre-nosotros' },
          { label: 'Contacto', url: '/contacto' },
          { label: 'Términos y Condiciones', url: '/terminos' },
          { label: 'Política de Privacidad', url: '/privacidad' }
        ]
      },
      {
        title: 'Contáctanos',
        isContact: true
      }
    ],
    copyright: '© 2026 SIO. Todos los derechos reservados.'
  },

  // Colores del tema (opcional - para futuras mejoras)
  theme: {
    primary: '#1a1a1a',
    secondary: '#667eea',
    accent: '#764ba2',
    background: '#fafafa',
    text: '#333333'
  }
};
