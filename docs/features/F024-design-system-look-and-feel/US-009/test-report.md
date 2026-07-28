# Test Report: US-009 — Tipografia y Jerarquia Visual (Montserrat)

> Feature: F024 — Design System Look & Feel
> HU: US-009
> Fecha: 2026-07-26
> Agente: test (BDD)

## Resumen de ejecucion

| Metrica | Valor |
|---------|-------|
| Escenarios BDD ejecutados | 11 |
| Escenarios aprobados | **11** ✅ |
| Escenarios fallidos | **0** |
| Tasa de aprobacion | **100%** |
| Tiempo de ejecucion | ~2.5 min (incluye startup del frontend) |

## Escenarios BDD (Gherkin → Playwright)

| # | Escenario | Resultado |
|---|-----------|-----------|
| 1 | **Should_LoadMontserratFont_When_ApplicationStarts** | ✅ PASSED |
| 2 | **Should_RenderDisplayLgWithCorrectStyles_When_ClassIsUsed** | ✅ PASSED |
| 3 | **Should_RenderHeadlineMd_When_ClassIsUsed** | ✅ PASSED |
| 4 | **Should_RenderHeadlineSm_When_ClassIsUsed** | ✅ PASSED |
| 5 | **Should_RenderBodyLg_When_ClassIsUsed** | ✅ PASSED |
| 6 | **Should_RenderBodyMd_When_ClassIsUsed** | ✅ PASSED |
| 7 | **Should_RenderLabelCapsUppercase_When_ClassIsUsed** | ✅ PASSED |
| 8 | **Should_RenderMetaSm_When_ClassIsUsed** | ✅ PASSED |
| 9 | **Should_RenderMetricBold_When_ClassIsUsed** | ✅ PASSED |
| 10 | **Should_ScaleHeadlinesDownOnMobile_When_ViewportIsMobile** | ✅ PASSED |
| 11 | **Should_NotScaleBodyTextOnMobile_When_ViewportIsMobile** | ✅ PASSED |

## Verificaciones por escenario

### 1. Should_LoadMontserratFont
- ✅ Fuente Montserrat disponible via `--font-montserrat` CSS variable
- ✅ `body` usa `Montserrat` como `font-family` principal
- ✅ Variable CSS definida correctamente

### 2-9. Clases tipograficas (desktop)
- ✅ `text-display-lg`: 32px / 700 / line-height 1.2 (-0.64px computed) / letter-spacing -0.02em (-0.64px computed)
- ✅ `text-headline-md`: 24px / 700
- ✅ `text-headline-sm`: 20px / 600
- ✅ `text-body-lg`: 16px / 400
- ✅ `text-body-md`: 14px / 400
- ✅ `text-label-caps`: 11px / 700 / letter-spacing 0.1em (1.1px computed) / text-transform uppercase
- ✅ `text-meta-sm`: 12px / 500
- ✅ `text-metric`: font-weight 700 / font-size 16px

### 10. Should_ScaleHeadlinesDownOnMobile
- ✅ Viewport 375x812 (< 768px): `text-display-lg` → 27.2px
- ✅ Viewport 375x812 (< 768px): `text-headline-md` → 20.4px
- ✅ Viewport 375x812 (< 768px): `text-headline-sm` → 17px

### 11. Should_NotScaleBodyTextOnMobile
- ✅ Viewport 375x812: `text-body-lg` permanece en 16px
- ✅ Viewport 375x812: `text-body-md` permanece en 14px
- ✅ Viewport 375x812: `text-meta-sm` permanece en 12px

## Artefactos generados

| Archivo | Descripcion |
|---------|-------------|
| `e2e/features/f024-us009-typography.feature` | 11 escenarios Gherkin |
| `e2e/step_definitions/f024-us009-typography.steps.ts` | Step definitions con Playwright |
| `e2e/support/world.ts` | Actualizado con `currentSelector` |
| `src/app/bdd-typography/page.tsx` | Pagina de test BDD para tipografia |

## Tecnologia utilizada

- **BDD Engine**: `@cucumber/cucumber` v13.2.0
- **Browser Automation**: Playwright v1.50.0 (Chromium headless)
- **Frontend**: Next.js 16.2.10 (Turbopack dev server)
- **Step definitions**: TypeScript con `tsx`

## Notas

- Las fallas reportadas en la suite completa (9/47 escenarios) corresponden a otras HUs (US-002, US-007) y son pre-existentes, no relacionadas con US-009.
- Se corrigio un error en `layout.tsx` (`ssr: false` no permitido en Server Components de Next.js 16) que impedia el arranque del servidor de desarrollo.
- Se manejo la conversion `em → px` en `letter-spacing` porque `getComputedStyle` serializa a pixeles.
- La pagina BDD (`/bdd-typography`) se creo fuera de carpetas con prefijo `_` para que Next.js la sirva como ruta publica.
