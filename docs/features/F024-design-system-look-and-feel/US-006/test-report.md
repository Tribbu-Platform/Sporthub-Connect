# Test Report: Componentes Base - Input Fields (US-006)

> Feature: F024 - Design System "Apex Athletic Intelligence"
> HU: US-006 - Input Fields
> Branch: hu/F024-US-006-componentes-base-input-fields
> Fecha: 2026-07-27

## 1. Resumen de Ejecucion

| Metrica | Valor |
|---------|-------|
| **Total escenarios BDD** | 8 |
| **Escenarios pasados** | 8 (100%) |
| **Escenarios fallidos** | 0 |
| **Total pasos** | 74 |
| **Pasos pasados** | 74 (100%) |
| **Tiempo de ejecucion** | ~12s |

## 2. Escenarios BDD (Cucumber.js + Playwright)

### Scenario 1: Should_RenderDefaultInput_When_NoSpecialStateIsActive ✅
Verifica que el Input en estado default renderiza:
- `background-color: #0c0e11` (surface-container-lowest)
- `border-color: #3b4a3f` (outline-variant)
- `color: #e2e2e6` (on-surface)
- Placeholder correcto ("Email")
- `border-radius: 0.75rem` (radius-md)

### Scenario 2: Should_ShowFocusState_When_InputIsFocused ✅
Verifica que al hacer focus:
- `border-color` cambia a `#00ff9d` (primary-container)
- `box-shadow` contiene `rgba(0, 255, 157` (glow esmeralda)
- El outline del navegador esta suprimido
- La transicion `transition` contiene `border-color`

### Scenario 3: Should_ShowErrorState_When_InputIsInvalid ✅
Verifica el estado de error:
- `border-color: #ffb4ab` (error)
- `box-shadow` contiene `rgba(255, 180, 171` (glow rojo)
- `aria-invalid="true"`

### Scenario 4: Should_ShowDisabledState_When_InputIsDisabled ✅
Verifica el estado disabled:
- `opacity < 0.5` (40%)
- `cursor: not-allowed`
- Atributo `disabled` presente
- El elemento no es interactuable

### Scenario 5: Should_StylePlaceholder_When_InputHasPlaceholderText ✅
Verifica el estilo del placeholder:
- Color con alpha (opacidad reducida al 60%)
- No esta en italica

### Scenario 6: Should_TransitionSmoothly_When_StateChanges ✅
Verifica las transiciones:
- `transition` contiene `0.2s` (200ms)
- `transition-property` contiene `border-color`
- `transition-property` contiene `box-shadow`

### Scenario 7: Should_BeCompatibleWithReactHookForm_When_UsedInForm ✅
Verifica compatibilidad con React Hook Form + Zod:
- Al ingresar valor invalido ("x"), el input muestra `aria-invalid="true"`
- El mensaje de error es visible
- El mensaje de error tiene color `#ffb4ab`
- Al corregir el valor ("test@example.com"), el input vuelve a `aria-invalid="false"`
- El mensaje de error desaparece

### Scenario 8: Should_BeAccessible_When_UsedWithLabel ✅
Verifica accesibilidad:
- Label tiene `for="input-a11y"`
- Input tiene `id="input-a11y"`
- El input es focusable (via `.focus()`)

## 3. Artefactos Generados

| Archivo | Descripcion |
|---------|-------------|
| `e2e/features/f024-us006-input-fields.feature` | Archivo .feature con 8 escenarios Gherkin |
| `e2e/step_definitions/f024-us006-input-fields.steps.ts` | 22 step definitions para Playwright |
| `src/app/bdd-inputs/page.tsx` | Pagina de prueba BDD con Input en todos los estados |

## 4. Tecnologia Utilizada

| Herramienta | Version | Uso |
|-------------|---------|-----|
| @cucumber/cucumber | ^13.2.0 | Engine BDD |
| @playwright/test | ^1.50.0 | Automatizacion de navegador |
| React Hook Form | ^7.82.0 | Formularios en test page |
| Zod | ^3.24.0 | Validacion en test page |
| @hookform/resolvers | ^5.4.0 | Integracion RHF + Zod |

## 5. Cobertura de Estados del Input

| Estado | Verificado BDD | Detalles |
|--------|---------------|----------|
| Default | ✅ | Fondo, borde, texto, placeholder, border-radius |
| Focus | ✅ | Borde esmeralda, glow box-shadow, outline suprimido, transicion |
| Error | ✅ | Borde rojo, glow rojo, aria-invalid |
| Disabled | ✅ | Opacidad 40%, cursor not-allowed, no interactivo, atributo disabled |
| Placeholder | ✅ | Color con opacidad reducida, no italic |
| Transiciones | ✅ | 200ms ease, border-color y box-shadow |
| RHF Compat | ✅ | Validacion, error message, correccion |
| Accesibilidad | ✅ | Label association, focusable |

## 6. Observaciones

- El placeholder se renderiza con color en espacio OKLab en Chrome (no rgba), el step definition maneja ambos formatos.
- Los tiempos de transicion son normalizados por el navegador (`200ms` → `0.2s`), el step definition acepta ambos.
- La pagina BDD (`/bdd-inputs`) usa `'use client'` para React Hook Form y hooks de estado. Los estilos se aplican via clases Tailwind + inline styles para simplicidad.
- Los steps de atributos usan nombres unicos (`"del input"`, `"del elemento label"`) para evitar ambiguedad con otros step definitions de F024.
