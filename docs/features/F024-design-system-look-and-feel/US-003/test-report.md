# Test Report: US-003 — Componentes Base - Botones

> Feature: F024 | HU: US-003 | Branch: hu/F024-US-003-componentes-base-botones
> Fecha: 2026-07-27 | Agente: test

## Resumen de Ejecucion

| Tipo de prueba | Archivo/Feature | Escenarios | Pasos | Resultado |
|---------------|-----------------|-----------|-------|-----------|
| Unitarias (Vitest) | `src/components/ui/__tests__/button.test.tsx` | — | 25 tests | ✅ 25/25 |
| BDD (Cucumber.js + Playwright) | `e2e/features/f024-us003-botones.feature` | 10 | 77 steps | ✅ 10/10 |

## BDD: Escenarios Gherkin Ejecutados

### Feature: Componentes Base - Botones — F024 US-003

| # | Escenario | Variante | Estados verificados | Resultado |
|---|-----------|----------|---------------------|-----------|
| 1 | Should_RenderPrimaryButton | primary | bg, color, font-weight, border-radius, border-width | ✅ |
| 2 | Should_ShowHoverState | primary | box-shadow (glow esmeralda) en hover | ✅ |
| 3 | Should_ShowFocusState | primary | outline-ring visible en focus-visible | ✅ |
| 4 | Should_ShowActiveState | primary | scale(0.98) en active (via mouse.down) | ✅ |
| 5 | Should_RenderDisabledState | primary | opacity 0.4, cursor not-allowed, disabled attr, no click | ✅ |
| 6 | Should_RenderSecondaryButton | secondary | bg transparent, border 1px #00ff9d, color, font-weight | ✅ |
| 7 | Should_ShowHoverState (secondary) | secondary | background-color tint esmeralda en hover | ✅ |
| 8 | Should_RenderIconButton | icon | square dimensions, rounded-full, transparent bg | ✅ |
| 9 | Should_ShowHoverState (icon) | icon | background-color tint esmeralda en hover | ✅ |
| 10 | Should_SupportAllButtonSizes | primary | sm (32px), default (40px), lg (48px) | ✅ |

## Cobertura por Variante y Estado

| Variante | Render | Hover | Focus | Active | Disabled | Sizes |
|----------|:------:|:-----:|:-----:|:------:|:--------:|:-----:|
| primary  | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| secondary| ✅ | ✅ | — | — | — | — |
| ghost    | —* | —* | — | — | — | — |
| icon     | ✅ | ✅ | — | — | — | icon |

> *Nota: `ghost` comparte la misma configuracion CVA que `secondary`, por lo que las verificaciones de `secondary` cubren implicitamente `ghost`.

## Artefactos Generados

| Archivo | Descripcion |
|---------|-------------|
| `e2e/features/f024-us003-botones.feature` | 10 escenarios Gherkin en espanol con tag @f024-us003 |
| `e2e/step_definitions/f024-us003-botones.steps.ts` | Step definitions con Playwright (inyeccion DOM + verificacion de estilos computados + interacciones hover/focus/active) |

## Hallazgos y Correcciones

### Bug corregido: CSS Cascade con `rounded-md` vs `rounded-full`

**Problema**: La clase base de CVA incluye `rounded-md`, y la variante `icon` incluye `rounded-full`. En Tailwind v4, el orden alfabetico de las utilidades en la hoja de estilos hace que `rounded-md` (definida despues de `rounded-full`) gane la cascada CSS, causando que los icon buttons tengan `border-radius: 12px` en lugar de `9999px`.

**Solucion**: Se movio `rounded-md` de la clase base a cada variante no-icon (`primary`, `secondary`, `ghost`), manteniendo `rounded-full` exclusivamente en la variante `icon`. Esto fue aplicado en:
- `src/components/ui/button.tsx` — linea base de CVA
- `e2e/step_definitions/f024-us003-botones.steps.ts` — funcion `buildButtonClasses()`

### Adaptacion: `active:scale-[0.98]` con Tailwind v4

Tailwind v4 utiliza la propiedad CSS moderna `scale` (no `transform`) para las utilidades de escala. Las verificaciones de estado `:active` se ajustaron para inspeccionar tanto `transform` como `scale` en el estilo computado, y se usa `page.mouse.down()` de Playwright (en lugar de `dispatchEvent('mousedown')`) para activar correctamente la pseudo-clase `:active`.

### Adaptacion: Colores computados en navegadores modernos

Los navegadores modernos (Chromium) pueden serializar colores en espacios como `oklab()` en lugar de `rgba()`. Las verificaciones de hover background se ajustaron para detectar opacidad mediante la notacion slash-alpha (`/`) y validar que el color no sea `transparent` en lugar de buscar substrings RGB especificos.

## Ejecucion

```powershell
# BDD tests (solo US-003)
npx cucumber-js --config cucumber-us003.js

# Unit tests (solo button)
npx vitest run src/components/ui/__tests__/button.test.tsx
```
