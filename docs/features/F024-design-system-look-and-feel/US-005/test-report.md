# Test Report — US-005: Badges de Roles y Estados

> Feature: F024 — Design System Look & Feel
> HU ID: US-005
> Branch: `hu/F024-US-005-componentes-base-badges-de-roles-y-estados`
> Fecha: 2026-07-27

## Resumen de Ejecucion

| Metrica | Resultado |
|---------|-----------|
| **Unit Tests (Vitest)** | 15/15 passed |
| **BDD Scenarios (Cucumber.js + Playwright)** | 10/10 passed |
| **Total Steps BDD** | 92/92 passed |
| **Cobertura** | Todo el componente Badge cubierto |

## 1. Pruebas Unitarias (Vitest + Testing Library)

Archivo: `frontend/sport-hub-web/src/components/ui/__tests__/badge.test.tsx`

### Role variants (4 tests)
- `Should_RenderOwnerBadge_When_VariantIsOwner` — Gold/amber colors, pill shape, padding >= 12px
- `Should_RenderCaptainBadge_When_VariantIsCaptain` — Esmeralda colors, pill shape
- `Should_RenderCoachBadge_When_VariantIsCoach` — Tertiary colors, pill shape
- `Should_RenderMemberBadge_When_VariantIsMember` — Secondary/gray colors, pill shape

### Status variants (4 tests)
- `Should_RenderSuccessBadge_When_VariantIsSuccess` — Emerald, pill shape
- `Should_RenderWarningBadge_When_VariantIsWarning` — Amber, pill shape
- `Should_RenderErrorBadge_When_VariantIsError` — Red, pill shape
- `Should_RenderInfoBadge_When_VariantIsInfo` — Tertiary, pill shape

### Sizes (3 tests)
- sm < default (font-size + padding)
- lg > default (font-size + padding)
- Default size: padding >= 12px

### Accessibility (4 tests)
- ARIA role `status` verificada
- Texto legible directamente
- Soporte para className custom sin romper estilos base
- Soporte para renderizado con iconos

## 2. BDD — Automatizacion de Criterios de Aceptacion

**Herramientas**: `@cucumber/cucumber` v13.x + Playwright v1.50  
**Feature file**: `e2e/features/f024-us005-badges.feature`  
**Step definitions**: `e2e/step_definitions/f024-us005-badges.steps.ts`  
**Test page**: `src/app/bdd-badges/page.tsx`  
**Reporte HTML**: `e2e/reports/cucumber-report-f024-us005.html`  
**Reporte JSON**: `e2e/reports/cucumber-f024-us005.json`

### Escenarios BDD (10/10 passed)

| # | Scenario | Steps | Status |
|---|----------|-------|--------|
| 1 | `Should_RenderOwnerBadge_When_VariantIsOwner` | 7 | ✅ Passed |
| 2 | `Should_RenderCaptainBadge_When_VariantIsCaptain` | 5 | ✅ Passed |
| 3 | `Should_RenderCoachBadge_When_VariantIsCoach` | 5 | ✅ Passed |
| 4 | `Should_RenderMemberBadge_When_VariantIsMember` | 5 | ✅ Passed |
| 5 | `Should_RenderSuccessBadge_When_VariantIsSuccess` | 5 | ✅ Passed |
| 6 | `Should_RenderWarningBadge_When_VariantIsWarning` | 4 | ✅ Passed |
| 7 | `Should_RenderErrorBadge_When_VariantIsError` | 4 | ✅ Passed |
| 8 | `Should_RenderInfoBadge_When_VariantIsInfo` | 4 | ✅ Passed |
| 9 | `Should_SupportDifferentSizes_When_SizePropIsProvided` | 5 | ✅ Passed |
| 10 | `Should_BeAccessible_When_RenderedWithScreenReader` | 4 | ✅ Passed |

### Que se verifica en cada escenario

- **Badges de rol** (Owner, Captain, Coach, Member): Texto correcto, border-radius 9999px (pill shape), fondo semitransparente (alpha en rgba/hsla), color de texto saturado diferente del fondo
- **Badges de estado** (Success, Warning, Error, Info): Mismas verificaciones visuales (pill, glass-tag)
- **Tamanos**: sm < default < lg tanto en font-size como en padding
- **Accesibilidad**: Rol ARIA `status` presente, texto legible directamente, elemento visible para lectores de pantalla (sin `aria-hidden`, sin `display:none`, con dimensiones > 0)

## 3. Artefactos generados

| Archivo | Proposito |
|---------|-----------|
| `e2e/features/f024-us005-badges.feature` | 10 escenarios Gherkin con Background compartido |
| `e2e/step_definitions/f024-us005-badges.steps.ts` | 16 step definitions (Given/When/Then) con Playwright |
| `src/app/bdd-badges/page.tsx` | Pagina de test fixture que renderiza todas las variantes |
| `e2e/reports/cucumber-report-f024-us005.html` | Reporte HTML de ejecucion BDD |
| `e2e/reports/cucumber-f024-us005.json` | Reporte JSON para CI/CD |

## 4. Configuracion de ejecucion

La ejecucion BDD usa un config especifico (`cucumber-us005.js`) que carga solo las step definitions relevantes para evitar conflictos con otras HUs que tienen errores de compilacion en sus step definitions.

Para integrar en CI/CD, se recomienda reparar los step definitions de las otras HUs y unificar bajo el archivo `cucumber.js` principal.

### Comandos

```bash
# Ejecutar BDD solo para US-005
npx cucumber-js -c cucumber-us005.js

# Ejecutar unit tests
npm test

# Ejecutar con reporte HTML
npx cucumber-js -c cucumber-us005.js --format html:e2e/reports/cucumber-report-f024-us005.html
```
