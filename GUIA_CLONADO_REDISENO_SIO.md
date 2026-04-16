# Guia de clonado y rediseno para SIO (Angular)

Esta guia adapta la idea de ai-website-cloner-template al stack de este repo.

## 1) Brief minimo
Completa antes de iniciar:
- URL objetivo:
- Objetivo de negocio:
- Pagina inicial:
- Nivel de similitud estructural (bajo/medio/alto):
- Elementos obligatorios de SIO (logo, tono, CTA):

## 2) Pipeline recomendado
1. Recon de referencia
- Extrae secciones y orden visual.
- Mapea tokens visuales (color, tipografia, espacios, radios, sombras).

2. Reinterpretacion SIO
- Reescribe copy con enfoque SIO.
- Ajusta paleta y tipografia a marca propia.

3. Implementacion Angular
- Construye por bloques: Hero, Valor, Servicios, Prueba social, CTA.
- Mantiene responsive y accesibilidad.

4. QA
- Contraste y jerarquia visual.
- Estados interactivos completos.
- Validacion de templates/errores.

## 3) Archivos de soporte en este repo
- Skill: .github/skills/clone-web-sio/SKILL.md
- Prompt: .github/prompts/clonar-redisenar-web.prompt.md
- Skill principal: .github/skills/diseno-limpio-fullstack/SKILL.md

## 4) Prompt rapido
Usa este texto en Copilot Chat:

Aplica clone-web-sio y diseno-limpio-fullstack para esta URL: <url>.
Quiero una reinterpretacion profesional para SIO en Angular.
Empieza por Home y entrega:
1) mapa de bloques,
2) design tokens,
3) implementacion por fases,
4) checklist QA.

## 5) Notas importantes
- Clonar estructura no significa copiar marca o assets.
- Mantener siempre logo e identidad SIO.
- No hacer copia literal de texto o codigo de terceros.
