# SIO – Sistema Interno Operativo

SIO (Sistema Interno Operativo) es una plataforma digital diseñada para ayudar a las empresas a **ordenar, controlar y centralizar sus procesos internos** de forma simple, flexible y escalable.

SIO nace para resolver un problema común en muchas organizaciones: la dependencia excesiva de herramientas dispersas como **Excel, WhatsApp, correos electrónicos y procesos manuales**, que terminan generando errores, pérdida de tiempo y falta de control sobre el negocio.

No es una página web, ni un software genérico complejo.  
**SIO es un sistema interno operativo**, pensado para adaptarse a la realidad de cada negocio.

---

## 🎯 ¿A quién está dirigido?

SIO está orientado principalmente a negocios que:

- No cuentan con un sistema interno formal
- Gestionan pedidos, trabajos o servicios de forma manual
- Operan con herramientas básicas (cuadernos, Excel, WhatsApp)
- Venden por Marketplace o canales informales
- Necesitan orden antes que marketing

Ejemplos:
- Fabricantes pequeños (bolsas plásticas, instrumentos, productos)
- Tiendas de ropa
- Panaderías
- Talleres
- Negocios operativos tradicionales

---

## 🧠 Problema que resuelve

Antes de SIO, muchos negocios funcionan así:

- Pedidos por WhatsApp o llamadas
- Seguimiento verbal
- Información dispersa
- Dependencia de personas específicas
- Errores, reprocesos y olvidos

Con SIO:

- Todo entra por un solo lugar
- Cada proceso sigue un flujo claro
- Cada cambio queda registrado
- El negocio gana control y visibilidad

---

## 🧩 Concepto central

SIO se basa en una idea simple y universal:

> Todo negocio gestiona procesos.

Un proceso puede ser:
- un pedido  
- una orden  
- un servicio  
- un trabajo  
- un caso  

Independientemente del nombre, todos los procesos:
1. Se registran  
2. Se gestionan  
3. Cambian de estado  
4. Se cierran  

SIO organiza este ciclo de forma clara y trazable.

---

## 🏗️ ¿Qué es SIO?

- Un sistema interno, no una página web
- Una base operativa para el negocio
- Una herramienta de control diario
- Un punt
o de partida para escalar

---

## 🚀 Desarrollo

Este proyecto está construido con Angular 21 y utiliza las mejores prácticas de desarrollo.

### Requisitos Previos

- Node.js (v18 o superior)
- npm (v9 o superior)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Sticlo/ProyectoSIO.git
cd ProyectoSIO

# Instalar dependencias
npm install
```

### Comandos Disponibles

```bash
# Iniciar servidor de desarrollo
npm start
# La aplicación estará disponible en http://localhost:4200

# Compilar para producción
npm run build:prod

# Compilar para desarrollo
npm run build:dev

# Ejecutar pruebas
npm test

# Ejecutar linter
npm run lint
```

### Estructura del Proyecto

```
src/
├── app/
│   ├── core/              # Servicios singleton, guards, interceptors
│   ├── shared/            # Componentes, directivas y pipes compartidos
│   ├── features/          # Módulos de funcionalidades
│   ├── layout/            # Componentes de layout (header, footer, sidebar)
│   └── app.component.ts
├── assets/                # Recursos estáticos
├── environments/          # Configuración de entornos
└── styles/                # Estilos globales
```

### Características Técnicas

- ✅ Angular 21 con componentes standalone
- ✅ Routing configurado con lazy loading
- ✅ SCSS como preprocesador de estilos
- ✅ TypeScript en modo strict
- ✅ Path aliases configurados (@core, @shared, @features, @layout)
- ✅ Estructura modular y escalable
- ✅ Interceptores HTTP configurados
- ✅ Guards de autenticación
- ✅ Servicios de API y Storage
- ✅ Variables y mixins SCSS globales

---

## 📝 Licencia

© 2024 SIO - Sistema Interno Operativo. Todos los derechos reservados.
