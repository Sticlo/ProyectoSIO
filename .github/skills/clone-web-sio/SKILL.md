---
name: clone-web-sio
description: "Usa esta skill para clonar y redisenar un sitio de referencia en este repo Angular. Trigger: clonar pagina, reverse engineer web, redisenar sitio, replicar landing, copiar estructura de web."
---

# Clone Web SIO

## Objetivo
Convertir una web de referencia en una version propia para SIO con diseno profesional, codigo limpio y enfoque comercial.

## Alcance
- Analiza estructura visual, layout, jerarquia, ritmo de espaciado, bloques y estados.
- No copiar logos, texto, imagenes de marca o assets con copyright.
- Reinterpretar estilo para SIO con identidad propia.

## Entradas requeridas
1. URL objetivo (o varias URLs)
2. Objetivo de negocio (ej: leads, ventas, portafolio)
3. Pagina a construir primero (ej: Home)
4. Nivel de similitud permitido (bajo, medio, alto en estructura)

## Flujo recomendado
1. Recon
- Capturar estructura de la pagina: hero, prueba social, servicios, CTA, footer.
- Mapear tokens visuales: color, tipografia, radios, sombras, espaciado.

2. Redefinir para SIO
- Crear mini design system propio en tokens SCSS.
- Definir narrativa de marca SIO para copy de cada bloque.

3. Implementar en Angular
- Crear template por bloques reutilizables.
- Mantener responsive en 375, 768, 1024 y 1440.
- Asegurar estados hover, focus, disabled y loading.

4. QA visual y tecnico
- Revisar contraste, legibilidad, jerarquia y espaciado.
- Revisar lint/build y errores de template.

## Reglas
- No usar texto ni identidad de marca original.
- No usar capturas directas como producto final.
- No hacer copy-paste literal de codigo de terceros.
- Mantener SIO visible como marca principal.

## Prompt base
"Aplica clone-web-sio sobre esta URL: <url>. Quiero una reinterpretacion profesional para SIO en Angular, con layout equivalente pero identidad propia. Entrega: (1) mapa de bloques, (2) design tokens, (3) implementacion por fases, (4) checklist QA."
