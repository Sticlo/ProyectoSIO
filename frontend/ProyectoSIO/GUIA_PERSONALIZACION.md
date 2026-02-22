# 🎨 Guía de Personalización de Plantilla SIO

Esta guía te ayudará a personalizar rápidamente la plantilla para cada cliente.

## 📋 Índice

1. [Branding y Header](#branding-y-header)
2. [Contenido de la Landing Page](#contenido-de-la-landing-page)
3. [Productos/Servicios](#productosservicios)
4. [Testimonios](#testimonios)
5. [Estadísticas](#estadísticas)
6. [Colores y Estilos](#colores-y-estilos)
7. [Footer](#footer)

---

## 🏷️ Branding y Header

**Archivo:** `src/app/layout/header/header.ts`

```typescript
// Cambiar nombre de la marca
brandName = 'TU_MARCA_AQUÍ';

// Cambiar mensaje promocional
promoBanner = 'TU MENSAJE PROMOCIONAL';

// Personalizar menú
menuItems: MenuItem[] = [
  { label: 'Inicio', route: '/' },
  { label: 'Servicios', route: '/servicios' },
  { label: 'Contacto', route: '/contacto' }
];
```

---

## 🏠 Contenido de la Landing Page

**Archivo:** `src/app/features/home/home.html`

### Hero Section
Busca la sección `<section class="hero-section">` y modifica:

- **Tag (línea ~7):** `<span class="hero-tag">TU CATEGORÍA</span>`
- **Título (línea ~8-11):** El título principal
- **Descripción (línea ~12-16):** La descripción del negocio
- **Botón (línea ~17):** Texto del call-to-action

### Características
En `<section class="features-section">` personaliza los 4 cards con:
- Icono SVG
- Título de la característica
- Descripción

---

## 🛍️ Productos/Servicios

**Archivo:** `src/app/features/home/home.ts`

```typescript
featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Nombre del Producto',
    description: 'Descripción breve del producto o servicio',
    price: 299.99,
    badge: 'Nuevo' // Opcional: 'Nuevo', 'Popular', 'Oferta', etc.
  },
  // Agregar más productos...
];
```

**Para agregar imágenes reales:**
```typescript
{
  id: '1',
  name: 'Producto',
  description: 'Descripción',
  price: 299.99,
  image: '/assets/images/producto1.jpg' // Ruta a tu imagen
}
```

---

## 💬 Testimonios

**Archivo:** `src/app/features/home/home.ts`

```typescript
testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Nombre del Cliente',
    role: 'Cargo',
    company: 'Empresa',
    content: 'Opinión o testimonio del cliente...',
    rating: 5, // De 1 a 5
    avatar: '/assets/images/avatar1.jpg' // Opcional
  },
  // Agregar más testimonios...
];
```

---

## 📊 Estadísticas

**Archivo:** `src/app/features/home/home.ts`

```typescript
stats = [
  { value: '100+', label: 'Clientes' },
  { value: '500+', label: 'Proyectos' },
  { value: '5.0', label: 'Rating' },
  { value: '24/7', label: 'Soporte' }
];
```

---

## 🎨 Colores y Estilos

### Colores Principales

**Archivos a modificar:**

1. **Header** - `src/app/layout/header/header.scss`
   - Banner: `background-color: #TU_COLOR;`
   - Hover links: `color: #TU_COLOR;`

2. **Botones** - `src/app/shared/components/button/button.component.ts`
   - Primary: `background-color: #TU_COLOR;`
   - Hover: `background-color: #TU_COLOR_HOVER;`

3. **Secciones** - `src/app/features/home/home.scss`
   - Stats: `background: linear-gradient(135deg, #COLOR1 0%, #COLOR2 100%);`
   - Newsletter: `background: linear-gradient(135deg, #COLOR1 0%, #COLOR2 100%);`

### Tipografía

Para cambiar la fuente principal, edita `src/styles.scss`:

```scss
body {
  font-family: 'Tu Fuente', sans-serif;
}

.hero-title, .section-title {
  font-family: 'Tu Fuente Título', serif;
}
```

---

## 📄 Footer

**Archivo:** `src/app/layout/footer/footer.html`

Personaliza las 4 columnas del footer:

1. **Marca y descripción:** Líneas 4-9
2. **Navegación:** Líneas 11-19
3. **Información legal:** Líneas 21-29
4. **Contacto:** Líneas 31-38

```html
<div class="footer-section">
  <h3 class="footer-brand">TU_MARCA</h3>
  <p class="footer-description">
    Tu descripción empresarial
  </p>
</div>
```

**Copyright (línea 43):**
```html
<p>&copy; 2026 TU_EMPRESA. Todos los derechos reservados.</p>
```

---

## 🚀 Checklist Rápida

- [ ] Cambiar nombre de marca en `header.ts`
- [ ] Actualizar mensaje promocional
- [ ] Modificar hero section (título, descripción, CTA)
- [ ] Agregar productos/servicios con precios reales
- [ ] Incluir testimonios de clientes
- [ ] Actualizar estadísticas
- [ ] Personalizar colores corporativos
- [ ] Configurar información del footer
- [ ] Agregar datos de contacto reales
- [ ] Agregar logo e imágenes (si aplica)

---

## 📸 Agregar Imágenes

1. Coloca las imágenes en `src/assets/images/`
2. Referencia en el código: `/assets/images/tu-imagen.jpg`

Ubicaciones comunes:
- **Logo:** `src/app/layout/header/header.html`
- **Hero:** `src/app/features/home/home.html` (línea ~19)
- **Productos:** Array `featuredProducts` con property `image`
- **Testimonios:** Array `testimonials` con property `avatar`

---

## 🎯 Tips de Personalización

### Para E-commerce
- Enfócate en productos destacados
- Agrega badges: "Nuevo", "Oferta", "Popular"
- Coloca precios reales
- Incluye más testimonios

### Para Servicios
- Cambia "Productos" por "Servicios"
- Personaliza iconos de características
- Enfócate en beneficios
- Agrega casos de éxito

### Para Corporativo
- Usa colores sobrios
- Enfócate en estadísticas
- Agrega logos de clientes
- Testimonios corporativos

---

## 📞 Soporte

Si necesitas ayuda adicional o funcionalidades específicas, contacta al equipo de desarrollo.

**¡Happy Coding! 🚀**
