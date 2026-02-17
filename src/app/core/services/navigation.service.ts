import { Injectable, signal, computed } from '@angular/core';

export interface NavigationItem {
  title: string;
  description: string;
  route: string;
  keywords: string[];
  section?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  // Todas las páginas y secciones navegables del sitio
  // Basado en elementos reales de la UI (navbar, botones, links visibles)
  private navigationItems: NavigationItem[] = [
    // Páginas principales del navbar
    {
      title: 'Inicio',
      description: 'Página principal del sitio',
      route: '/',
      keywords: ['inicio', 'home', 'principal', 'portada', 'bienvenida'],
      section: 'Navegación',
      icon: 'home'
    },
    {
      title: 'Productos',
      description: 'Catálogo de productos disponibles',
      route: '/productos',
      keywords: ['productos', 'catalogo', 'catálogo', 'tienda', 'comprar', 'artículos', 'items'],
      section: 'Navegación',
      icon: 'grid'
    },
    {
      title: 'Servicios',
      description: 'Nuestros servicios digitales',
      route: '/servicios',
      keywords: ['servicios', 'soluciones', 'desarrollo', 'web', 'apps'],
      section: 'Navegación',
      icon: 'briefcase'
    },
    {
      title: 'Nosotros',
      description: 'Conoce nuestro equipo',
      route: '/nosotros',
      keywords: ['nosotros', 'equipo', 'empresa', 'quienes somos', 'about'],
      section: 'Navegación',
      icon: 'users'
    },
    {
      title: 'Contacto',
      description: 'Contáctanos',
      route: '/contacto',
      keywords: ['contacto', 'soporte', 'ayuda', 'contact', 'comunicarse'],
      section: 'Navegación',
      icon: 'mail'
    },
    
    // Autenticación y cuenta
    {
      title: 'Iniciar Sesión',
      description: 'Acceder a tu cuenta',
      route: '/login',
      keywords: ['login', 'entrar', 'sesión', 'sesion', 'acceder', 'ingresar', 'autenticación'],
      section: 'Cuenta',
      icon: 'login'
    },
    {
      title: 'Registrarse',
      description: 'Crear una cuenta nueva',
      route: '/register',
      keywords: ['registro', 'registrarse', 'cuenta nueva', 'crear cuenta', 'signup', 'unirse'],
      section: 'Cuenta',
      icon: 'user-plus'
    },
    {
      title: 'Panel de Administración',
      description: 'Administrar productos y configuración',
      route: '/admin',
      keywords: ['admin', 'administrar', 'administrador', 'panel', 'gestión', 'gestion', 'configuración', 'configuracion', 'dashboard'],
      section: 'Administración',
      icon: 'settings'
    },
    
    // Carrito de compras
    {
      title: 'Carrito de Compras',
      description: 'Ver productos en el carrito y finalizar compra',
      route: '#cart',
      keywords: ['carrito', 'cart', 'compras', 'bolsa', 'cesta', 'checkout', 'pagar'],
      section: 'Compras',
      icon: 'cart'
    },
    
    // Filtros y ordenamiento de productos
    {
      title: 'Buscar Productos',
      description: 'Buscar en el catálogo de productos',
      route: '/productos',
      keywords: ['buscar', 'búsqueda', 'search', 'encontrar', 'filtrar', 'filtros'],
      section: 'Herramientas',
      icon: 'search'
    },
    {
      title: 'Ordenar por Precio (Menor a Mayor)',
      description: 'Ver productos del más económico al más caro',
      route: '/productos?sort=price-asc',
      keywords: ['precio', 'barato', 'económico', 'economico', 'menor precio', 'más barato', 'ordenar'],
      section: 'Herramientas',
      icon: 'dollar'
    },
    {
      title: 'Ordenar por Precio (Mayor a Menor)',
      description: 'Ver productos del más caro al más económico',
      route: '/productos?sort=price-desc',
      keywords: ['precio', 'caro', 'más caro', 'mayor precio', 'ordenar'],
      section: 'Herramientas',
      icon: 'dollar'
    },
    {
      title: 'Productos Mejor Valorados',
      description: 'Ver productos con mejor calificación',
      route: '/productos?sort=rating',
      keywords: ['valorados', 'rating', 'calificación', 'calificacion', 'mejor', 'top', 'mejores', 'estrellas', 'populares'],
      section: 'Herramientas',
      icon: 'star'
    },
    {
      title: 'Ordenar por Nombre',
      description: 'Ver productos ordenados alfabéticamente',
      route: '/productos?sort=name',
      keywords: ['nombre', 'alfabético', 'alfabetico', 'a-z', 'ordenar', 'alfabéticamente'],
      section: 'Herramientas',
      icon: 'list'
    }
  ];

  searchQuery = signal('');

  // Resultados filtrados basados en la búsqueda
  searchResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    
    if (!query) {
      // Si no hay búsqueda, mostrar accesos rápidos principales
      return this.navigationItems.filter(item => 
        ['Inicio', 'Productos', 'Carrito de Compras', 'Iniciar Sesión'].includes(item.title)
      ).slice(0, 6);
    }

    // Buscar en título, descripción y keywords
    const results = this.navigationItems.filter(item => {
      const searchText = `${item.title} ${item.description} ${item.keywords.join(' ')}`.toLowerCase();
      return searchText.includes(query);
    });

    // Ordenar por relevancia (título primero, luego keywords, luego descripción)
    return results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(query) ? 1 : 0;
      const bTitle = b.title.toLowerCase().includes(query) ? 1 : 0;
      const aKeywords = a.keywords.some(k => k.includes(query)) ? 0.5 : 0;
      const bKeywords = b.keywords.some(k => k.includes(query)) ? 0.5 : 0;
      
      return (bTitle + bKeywords) - (aTitle + aKeywords);
    }).slice(0, 8);
  });

  getAllItems(): NavigationItem[] {
    return this.navigationItems;
  }

  getItemsBySection(section: string): NavigationItem[] {
    return this.navigationItems.filter(item => item.section === section);
  }
}
