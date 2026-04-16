---
name: diseno-limpio-fullstack
description: "Usa esta skill cuando pidas diseno frontend, UX, programacion limpia, manejo de errores, APIs mantenibles o mejoras de arquitectura en Angular y Node.js. Trigger: diseno visual, pixel perfect, clean code, refactor, UX, API design, error handling."
---

# Diseno Limpio Fullstack

## Objetivo
Aplicar un flujo unico para crear interfaces de alta calidad visual y codigo mantenible en este repo (Angular frontend + Node/Express backend).

## Cuando usar esta skill
- Nuevas pantallas en frontend.
- Refactors visuales o de experiencia de usuario.
- Endpoints nuevos o rediseno de APIs.
- Mejoras de calidad: errores, logs, validaciones, legibilidad.
- Revision de consistencia entre UI, dominio y datos.

## Flujo de trabajo recomendado
1. Definir intencion de la pantalla o feature en una frase.
2. Establecer mini design system antes de codificar: color, tipografia, spacing, estados.
3. Implementar UI por bloques pequenos (hero/listado/form/card/tablas).
4. Validar accesibilidad y responsive en cada bloque.
5. Implementar logica de dominio con funciones pequenas y nombres explicitos.
6. Aplicar manejo de errores tipado y mensajes utiles.
7. Verificar con checklist final de calidad.

## Reglas de Diseno Frontend (Angular)
- Disena con tokens (variables SCSS) antes de hardcodear colores o medidas.
- Mantener jerarquia visual clara: titulo, subtitulo, accion primaria, accion secundaria.
- Estados obligatorios por componente: default, hover, focus, disabled, loading, error, success.
- Responsive minimo: 375, 768, 1024, 1440.
- Contraste minimo WCAG AA.
- Animaciones cortas y con proposito (150-300ms), respetando reduced motion.
- Evitar interfaces genericas; usar una direccion visual consistente por modulo.

## Reglas de Programacion Limpia
- Una funcion, una responsabilidad.
- Nombres semanticos (evitar util, helper, data, tmp).
- Evitar anidaciones profundas; usar early return.
- Limitar efectos colaterales en capas de dominio.
- Validar input en bordes del sistema (controladores, DTOs, forms).
- Preferir composicion sobre bloques monoliticos.
- No duplicar reglas de negocio entre frontend y backend.

## Manejo de errores (backend y frontend)
- Diferenciar errores esperados (validacion, no encontrado, conflicto) de inesperados.
- Estandarizar respuesta de error de API:
  - code
  - message
  - details (opcional)
  - traceId (opcional en produccion)
- Nunca ocultar errores silenciosamente.
- Loguear contexto util sin exponer secretos.
- Aplicar degradacion elegante en UI (fallback y reintento cuando aplique).

## Diseno de API limpio
- Recursos consistentes y pluralizados.
- Metodos HTTP correctos por intencion.
- Paginacion, filtros y orden definidos explicitamente.
- Contratos estables: no romper respuesta sin versionado o migracion.
- Validaciones compartidas y mensajes predecibles.

## Base de datos y consultas
- Para MySQL actual del repo: indice en FK y columnas de filtro real.
- Preferir tipos correctos para dinero y fechas.
- Evitar consultas N+1.
- Si migras a PostgreSQL, aplicar:
  - timestamptz para tiempo
  - numeric para dinero
  - text para strings
  - indices parciales/expresion cuando haya evidencia

## Checklist de entrega
- UI consistente con tokens y estados.
- Responsive validado en 4 breakpoints.
- Accesibilidad basica verificada (teclado, foco, contraste).
- Sin duplicacion de reglas de negocio.
- Errores manejados y observables.
- API/documentacion alineadas con la implementacion.

## Prompt de activacion sugerido
"Aplica la skill diseno-limpio-fullstack para esta tarea. Primero define mini design system, luego implementa UI responsive accesible, despues clean code en logica y manejo de errores estandar."

## Integracion con clonado de referencia web
- Si el usuario pide clonar o reinterpretar una web que le gusto, activar tambien la skill `clone-web-sio`.
- Flujo combinado recomendado:
  1. Recon de la web de referencia (solo estructura y patrones)
  2. Reinterpretacion visual para SIO (sin copiar marca/activos de terceros)
  3. Implementacion Angular por bloques
  4. QA visual, responsive y accesibilidad

Prompt combinado sugerido:
"Aplica diseno-limpio-fullstack y clone-web-sio para esta URL: <url>. Quiero una reinterpretacion profesional para SIO en Angular, con identidad propia y enfoque comercial."

## Fuentes base usadas para esta skill
- https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- https://github.com/vansh-nagar/Pixel-Perfect
- https://github.com/VoltAgent/awesome-design-md
- https://github.com/obra/superpowers
- https://github.com/wshobson/agents
