# User Stories: Implementacion del Design System - Look & Feel

> Feature: F024
> Bounded Context: Transversal (Frontend UI)
> Stack: React 19 + TypeScript + Next.js 16 (App Router) + Tailwind CSS v4 + shadcn/ui
> Diseno fuente: `prototipes/stitch_krewletics_sports_community/DESIGN.md` — "Apex Athletic Intelligence"
> Fecha: 2026-07-26

## Resumen de la Feature

Esta feature implementa el sistema de diseno visual completo de SportHub Connect, llamado **"Apex Athletic Intelligence"**. Es un tema dark-mode de alto rendimiento con estetica atletica, acentos verde esmeralda neon (#00ff9d), glassmorphism para profundidad, y tipografia Montserrat geometrica.

El sistema se compone de 9 historias de usuario que construyen progresivamente la capa visual del frontend: desde los tokens atomicos (CSS variables) hasta los componentes compuestos (layout, botones, cards, inputs) y la tipografia.

---

## Dependencias entre Historias de Usuario

```
US-001 (Design Tokens)
  ├──▶ US-002 (Tailwind Config) ──▶ US-003 (Botones)
  │                              ├─▶ US-004 (Cards)
  │                              ├─▶ US-005 (Badges)
  │                              ├─▶ US-006 (Inputs)
  │                              └─▶ US-007 (Status Indicators)
  ├──▶ US-008 (Layout) ── necesita tokens + puede iniciar en paralelo con US-002
  └──▶ US-009 (Tipografia) ── necesita tokens, puede iniciar en paralelo con US-002
```

**Orden recomendado de implementacion**: US-001 → US-009 → US-002 → US-003 + US-004 + US-005 + US-006 + US-007 (paralelo) → US-008 (integrador)

---

## US-001: Design Tokens (CSS Variables)

**Prioridad**: Must have
**Rol**: Desarrollador Frontend / Disenador del Design System
**Entidades afectadas**: N/A (solo CSS)
**Eventos de dominio**: N/A

### Descripcion

Como desarrollador frontend, quiero definir los 45 tokens de color, tipografia, espaciado, bordes, glassmorphism y transiciones como CSS custom properties en el archivo `globals.css`, para que todos los componentes del sistema consuman valores consistentes desde una unica fuente de verdad.

Los tokens deben definirse en el bloque `@layer base` o como variables `:root` accesibles globalmente desde cualquier componente. Incluyen:

- **45 tokens de color** (Material Design 3): surface-dim, surface-bright, surface-container-lowest (#0c0e11), surface-container-low (#1a1c1f), surface-container (#1e2023), surface-container-high (#282a2d), surface-container-highest (#333538), on-surface (#e2e2e6), on-surface-variant (#b9cbbc), inverse-surface (#e2e2e6), inverse-on-surface (#2f3034), outline (#849587), outline-variant (#3b4a3f), surface-tint (#00e38b), primary (#f4fff3), on-primary (#00391f), primary-container (#00ff9d), on-primary-container (#007143), inverse-primary (#006d40), secondary (#c6c6ca), on-secondary (#2f3034), secondary-container (#47494c), on-secondary-container (#b7b8bc), tertiary (#f4fff0), on-tertiary (#003915), tertiary-container (#67fb8c), on-tertiary-container (#007231), error (#ffb4ab), on-error (#690005), error-container (#93000a), on-error-container (#ffdad6), primary-fixed (#56ffa8), primary-fixed-dim (#00e38b), on-primary-fixed (#002110), on-primary-fixed-variant (#00522f), secondary-fixed (#e2e2e6), secondary-fixed-dim (#c6c6ca), on-secondary-fixed (#1a1c1f), on-secondary-fixed-variant (#45474a), tertiary-fixed (#6bff8f), tertiary-fixed-dim (#4ae176), on-tertiary-fixed (#002109), on-tertiary-fixed-variant (#005321), background (#111317), on-background (#e2e2e6), surface-variant (#333538)

- **Tokens de glassmorphism**: `--glass-opacity: 0.6`, `--glass-blur: 20px`, `--glass-border: #1a1c1f`, `--glass-modal-opacity: 0.8`, `--glass-modal-blur: 30px`

- **Tokens de glow/sombras**: `--glow-primary: 0 0 15px rgba(0, 255, 157, 0.3)`, `--glow-primary-strong: 0 0 30px rgba(0, 255, 157, 0.5)`, sombras de elevacion para Level 0 a Level 3

- **Tokens de tipografia**: `--font-family-primary: 'Montserrat'`, `--font-family-mono: 'JetBrains Mono'`

- **Tokens de espaciado**: `--spacing-base: 8px`, `--spacing-gutter: 24px`, `--spacing-margin-mobile: 16px`, `--spacing-margin-desktop: 32px`, `--sidebar-width: 260px`

- **Tokens de bordes**: `--radius-sm: 0.25rem`, `--radius-DEFAULT: 0.5rem`, `--radius-md: 0.75rem`, `--radius-lg: 1rem`, `--radius-xl: 1.5rem`, `--radius-full: 9999px`

- **Tokens de transicion**: `--transition-fast: 150ms ease`, `--transition-base: 200ms ease`, `--transition-slow: 300ms ease`

### Criterios de Aceptacion (Gherkin)

```gherkin
Feature: Design Tokens (CSS Variables) — US-001
  Como desarrollador frontend
  Quiero definir todos los tokens de diseno como CSS custom properties en :root
  Para que los componentes consuman valores consistentes desde una unica fuente de verdad

  Background:
    Given que el proyecto frontend existe en "frontend/sport-hub-web/"
    And el archivo "src/app/globals.css" existe

  Scenario: Should_DefineAll45ColorTokens_When_GlobalsCssIsLoaded
    Given que el archivo "src/app/globals.css" contiene el bloque ":root"
    When se inspeccionan las custom properties del documento en runtime
    Then deben existir las variables "--color-surface", "--color-surface-dim", "--color-surface-bright"
    And debe existir "--color-surface-container-lowest" con valor "#0c0e11"
    And debe existir "--color-surface-container-low" con valor "#1a1c1f"
    And debe existir "--color-surface-container" con valor "#1e2023"
    And debe existir "--color-surface-container-high" con valor "#282a2d"
    And debe existir "--color-surface-container-highest" con valor "#333538"
    And debe existir "--color-on-surface" con valor "#e2e2e6"
    And debe existir "--color-on-surface-variant" con valor "#b9cbbc"
    And debe existir "--color-inverse-surface" con valor "#e2e2e6"
    And debe existir "--color-inverse-on-surface" con valor "#2f3034"
    And debe existir "--color-outline" con valor "#849587"
    And debe existir "--color-outline-variant" con valor "#3b4a3f"
    And debe existir "--color-surface-tint" con valor "#00e38b"
    And debe existir "--color-primary" con valor "#f4fff3"
    And debe existir "--color-on-primary" con valor "#00391f"
    And debe existir "--color-primary-container" con valor "#00ff9d"
    And debe existir "--color-on-primary-container" con valor "#007143"
    And debe existir "--color-inverse-primary" con valor "#006d40"
    And debe existir "--color-secondary" con valor "#c6c6ca"
    And debe existir "--color-on-secondary" con valor "#2f3034"
    And debe existir "--color-secondary-container" con valor "#47494c"
    And debe existir "--color-on-secondary-container" con valor "#b7b8bc"
    And debe existir "--color-tertiary" con valor "#f4fff0"
    And debe existir "--color-on-tertiary" con valor "#003915"
    And debe existir "--color-tertiary-container" con valor "#67fb8c"
    And debe existir "--color-on-tertiary-container" con valor "#007231"
    And debe existir "--color-error" con valor "#ffb4ab"
    And debe existir "--color-on-error" con valor "#690005"
    And debe existir "--color-error-container" con valor "#93000a"
    And debe existir "--color-on-error-container" con valor "#ffdad6"
    And debe existir "--color-primary-fixed" con valor "#56ffa8"
    And debe existir "--color-primary-fixed-dim" con valor "#00e38b"
    And debe existir "--color-on-primary-fixed" con valor "#002110"
    And debe existir "--color-on-primary-fixed-variant" con valor "#00522f"
    And debe existir "--color-secondary-fixed" con valor "#e2e2e6"
    And debe existir "--color-secondary-fixed-dim" con valor "#c6c6ca"
    And debe existir "--color-on-secondary-fixed" con valor "#1a1c1f"
    And debe existir "--color-on-secondary-fixed-variant" con valor "#45474a"
    And debe existir "--color-tertiary-fixed" con valor "#6bff8f"
    And debe existir "--color-tertiary-fixed-dim" con valor "#4ae176"
    And debe existir "--color-on-tertiary-fixed" con valor "#002109"
    And debe existir "--color-on-tertiary-fixed-variant" con valor "#005321"
    And debe existir "--color-background" con valor "#111317"
    And debe existir "--color-on-background" con valor "#e2e2e6"
    And debe existir "--color-surface-variant" con valor "#333538"

  Scenario: Should_DefineGlassmorphismTokens_When_GlobalsCssIsLoaded
    Given que el archivo "src/app/globals.css" contiene el bloque ":root"
    When se inspeccionan las custom properties del documento en runtime
    Then debe existir "--glass-opacity" con valor "0.6"
    And debe existir "--glass-blur" con valor "20px"
    And debe existir "--glass-border" con valor "#1a1c1f"
    And debe existir "--glass-modal-opacity" con valor "0.8"
    And debe existir "--glass-modal-blur" con valor "30px"

  Scenario: Should_DefineGlowTokens_When_GlobalsCssIsLoaded
    Given que el archivo "src/app/globals.css" contiene el bloque ":root"
    When se inspeccionan las custom properties del documento en runtime
    Then debe existir "--glow-primary" con el valor conteniendo "rgba(0, 255, 157"
    And debe existir "--glow-primary-strong" con el valor conteniendo "rgba(0, 255, 157"
    And debe existir "--shadow-level-0"
    And debe existir "--shadow-level-1"
    And debe existir "--shadow-level-2"
    And debe existir "--shadow-level-3"

  Scenario: Should_DefineSpacingTokens_When_GlobalsCssIsLoaded
    Given que el archivo "src/app/globals.css" contiene el bloque ":root"
    When se inspeccionan las custom properties del documento en runtime
    Then debe existir "--spacing-base" con valor "8px"
    And debe existir "--spacing-gutter" con valor "24px"
    And debe existir "--spacing-margin-mobile" con valor "16px"
    And debe existir "--spacing-margin-desktop" con valor "32px"
    And debe existir "--sidebar-width" con valor "260px"

  Scenario: Should_DefineRadiusTokens_When_GlobalsCssIsLoaded
    Given que el archivo "src/app/globals.css" contiene el bloque ":root"
    When se inspeccionan las custom properties del documento en runtime
    Then debe existir "--radius-sm" con valor "0.25rem"
    And debe existir "--radius-DEFAULT" con valor "0.5rem"
    And debe existir "--radius-md" con valor "0.75rem"
    And debe existir "--radius-lg" con valor "1rem"
    And debe existir "--radius-xl" con valor "1.5rem"
    And debe existir "--radius-full" con valor "9999px"

  Scenario: Should_DefineTransitionTokens_When_GlobalsCssIsLoaded
    Given que el archivo "src/app/globals.css" contiene el bloque ":root"
    When se inspeccionan las custom properties del documento en runtime
    Then debe existir "--transition-fast" con valor "150ms ease"
    And debe existir "--transition-base" con valor "200ms ease"
    And debe existir "--transition-slow" con valor "300ms ease"

  Scenario: Should_DefineTypographyTokens_When_GlobalsCssIsLoaded
    Given que el archivo "src/app/globals.css" contiene el bloque ":root"
    When se inspeccionan las custom properties del documento en runtime
    Then debe existir "--font-family-primary" con valor "'Montserrat', sans-serif"
    And debe existir "--font-family-mono" con valor "'JetBrains Mono', monospace"
```

### Impacto Tecnico

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `src/app/globals.css` | **Reemplazar** | Sustituir el bloque `@theme` actual (tema shadcn/ui claro) por el bloque `:root` completo con los 45 tokens de color, glassmorphism, espaciado, bordes, sombras, tipografia y transiciones |
| `src/app/globals.css` | **Agregar** | Estilos base globales: `body` con `background-color: var(--color-background)` y `color: var(--color-on-background)`, `*` con `border-color: var(--color-outline-variant)` |

### Definicion de Terminado (DoD)

- [x] Los 45 tokens de color del DESIGN.md estan definidos como CSS custom properties en `:root`
- [x] Los tokens de glassmorphism (`--glass-*`) estan definidos
- [x] Los tokens de glow/sombras (`--glow-*`, `--shadow-level-*`) estan definidos
- [x] Los tokens de espaciado (`--spacing-*`, `--sidebar-width`) estan definidos
- [x] Los tokens de bordes redondeados (`--radius-*`) estan definidos
- [x] Los tokens de transicion (`--transition-*`) estan definidos
- [x] Los tokens de tipografia (`--font-family-*`) estan definidos
- [x] Los estilos base del body y border-color global usan las variables
- [x] El comando `npm run dev` inicia sin errores de CSS
- [x] Las variables son accesibles via `getComputedStyle(document.documentElement)` en el navegador

---

## US-002: Configuracion de Tailwind con Paleta Personalizada

**Prioridad**: Must have
**Rol**: Desarrollador Frontend
**Depende de**: US-001 (Design Tokens)
**Entidades afectadas**: N/A (configuracion)
**Eventos de dominio**: N/A

### Descripcion

Como desarrollador frontend, quiero extender la configuracion de Tailwind CSS v4 para que utilice los design tokens definidos en US-001 como su paleta nativa, permitiendo usar clases utilitarias como `bg-primary-container`, `text-on-surface`, `font-headline`, `rounded-lg`, `shadow-level-2` y `backdrop-blur-glass` directamente en los componentes React.

La configuracion debe realizarse mediante el bloque `@theme` de Tailwind v4 en `globals.css` (no via `tailwind.config.ts`), asegurando que:

- Los colores del design system se expongan como clases Tailwind
- Las fuentes Montserrat y JetBrains Mono se configuren como `fontFamily`
- Los border-radius, box-shadow, y backdrop-blur se extiendan con los tokens
- shadcn/ui herede la paleta personalizada via las variables CSS que espera

### Criterios de Aceptacion (Gherkin)

```gherkin
Feature: Configuracion de Tailwind con Paleta Personalizada — US-002
  Como desarrollador frontend
  Quiero extender Tailwind CSS v4 para usar los design tokens de US-001
  Para poder usar clases utilitarias con la paleta del design system

  Background:
    Given que los design tokens de US-001 estan definidos en ":root" de "globals.css"
    And el proyecto usa Tailwind CSS v4 con "@theme" en "globals.css"

  Scenario: Should_ExposeAllColorTokens_When_TailwindThemeIsExtended
    Given que el bloque "@theme" en "globals.css" esta configurado correctamente
    When se usa la clase "bg-primary-container" en un elemento HTML
    Then el background-color computado debe ser "#00ff9d"
    When se usa la clase "text-on-surface" en un elemento HTML
    Then el color computado debe ser "#e2e2e6"
    When se usa la clase "bg-surface-container-lowest" en un elemento HTML
    Then el background-color computado debe ser "#0c0e11"

  Scenario: Should_ConfigureMontserratAsDefaultFont_When_TailwindThemeIsExtended
    Given que el bloque "@theme" en "globals.css" esta configurado correctamente
    When se usa la clase "font-sans" en un elemento HTML
    Then la propiedad "font-family" computada debe contener "Montserrat"
    When se usa la clase "font-mono" en un elemento HTML
    Then la propiedad "font-family" computada debe contener "JetBrains Mono"

  Scenario: Should_ConfigureCustomBorderRadius_When_TailwindThemeIsExtended
    Given que el bloque "@theme" en "globals.css" esta configurado correctamente
    When se usa la clase "rounded-lg" en un elemento HTML
    Then el border-radius computado debe ser "1rem" (16px)
    When se usa la clase "rounded-full" en un elemento HTML
    Then el border-radius computado debe ser "9999px"

  Scenario: Should_ConfigureGlassmorphismBoxShadows_When_TailwindThemeIsExtended
    Given que el bloque "@theme" en "globals.css" esta configurado correctamente
    When se usa la clase "shadow-level-2" en un elemento HTML
    Then el elemento debe tener un box-shadow aplicado
    When se usa la clase "shadow-glow-primary" en un elemento HTML
    Then el elemento debe tener un box-shadow que contenga el color esmeralda

  Scenario: Should_ConfigureBackdropBlurForGlassmorphism_When_TailwindThemeIsExtended
    Given que el bloque "@theme" en "globals.css" esta configurado correctamente
    When se usa la clase "backdrop-blur-glass" en un elemento HTML
    Then el elemento debe tener "backdrop-filter: blur(20px)"
    When se usa la clase "backdrop-blur-glass-modal" en un elemento HTML
    Then el elemento debe tener "backdrop-filter: blur(30px)"

  Scenario: Should_IntegrateShadcnUI_When_CSSVariablesMatchExpectedNames
    Given que el bloque "@theme" en "globals.css" esta configurado correctamente
    When se renderiza un componente shadcn/ui Button con variante "default"
    Then el boton debe usar el color "primary-container" (#00ff9d) como fondo
    And el texto debe usar "on-primary-container" (#007143) como color
    When se renderiza un componente shadcn/ui Card
    Then la card debe usar los colores de superficie del design system
```

### Impacto Tecnico

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `src/app/globals.css` | **Modificar** | Expandir el bloque `@theme` para incluir: `--color-*` mapeando cada token de US-001, `--font-sans` y `--font-mono`, `--radius-*`, `--shadow-*` (incluyendo glows), `--backdrop-blur-*` |
| `tailwind.config.ts` | **Evaluar** | Si Tailwind v4 esta usando CSS-based config (`@theme`), verificar si `tailwind.config.ts` sigue siendo necesario o puede eliminarse/simplificarse |

### Definicion de Terminado (DoD)

- [ ] Los colores del design system son usables via clases Tailwind (`bg-{color}`, `text-{color}`, `border-{color}`)
- [ ] Las fuentes Montserrat y JetBrains Mono son usables via `font-sans` y `font-mono`
- [ ] Los border-radius del design system son usables via `rounded-{size}`
- [ ] Las sombras de elevacion son usables via `shadow-level-{0|1|2|3}`
- [ ] El glow esmeralda es usable via `shadow-glow-primary`
- [ ] El backdrop-blur de glassmorphism es usable via `backdrop-blur-glass`
- [ ] Los componentes de shadcn/ui existentes renderizan correctamente con la nueva paleta
- [ ] No hay errores de compilacion de Tailwind (`npm run build` exitoso)
- [ ] No hay clases Tailwind no utilizadas que generen warnings

---

## US-003: Componentes Base - Botones

**Prioridad**: Must have
**Rol**: Desarrollador Frontend / Usuario Final
**Depende de**: US-002 (Tailwind Config)
**Entidades afectadas**: N/A (componentes UI)
**Eventos de dominio**: N/A

### Descripcion

Como desarrollador frontend, quiero crear componentes de boton reutilizables que implementen las variantes definidas en el design system (Primary, Secondary/Ghost, Icon) usando shadcn/ui Button como base, para que todas las interacciones del usuario tengan consistencia visual y los estados (hover, focus, active, disabled) esten correctamente implementados.

Cada variante debe:
- **Primary**: Fondo solido esmeralda `#00ff9d` (#primary-container), texto negro/oscuro bold, sin borde. En hover: glow exterior esmeralda al 30%. En focus: outline visible + glow. En active: escala 0.98. En disabled: opacidad 40%.
- **Secondary/Ghost**: Fondo transparente, borde 1px esmeralda, texto esmeralda. En hover: fondo esmeralda al 10% opacity. En focus: outline + glow. En disabled: opacidad 40%.
- **Icon**: Circular (w-10 h-10), fondo transparente. En hover: fondo esmeralda al 15% opacity con transicion suave. En focus: outline circular. En disabled: opacidad 40%.

### Criterios de Aceptacion (Gherkin)

```gherkin
Feature: Componentes Base - Botones — US-003
  Como desarrollador frontend
  Quiero crear componentes de boton con las variantes del design system
  Para que todas las interacciones del usuario tengan consistencia visual

  Background:
    Given que los design tokens y la configuracion de Tailwind estan disponibles
    And el componente Button de shadcn/ui esta instalado en el proyecto

  Scenario: Should_RenderPrimaryButton_When_VariantIsPrimary
    Given que se renderiza "<Button variant="primary">Guardar</Button>"
    When se inspecciona el elemento renderizado
    Then el background-color debe ser "#00ff9d" (primary-container)
    And el color de texto debe ser oscuro (on-primary-container)
    And el font-weight debe ser "700" (bold)
    And el border-radius debe ser "0.75rem" (radius-md)
    And no debe tener borde visible

  Scenario: Should_ShowHoverState_When_PrimaryButtonIsHovered
    Given que se renderiza "<Button variant="primary">Guardar</Button>"
    When el cursor se posiciona sobre el boton (hover)
    Then el boton debe mostrar un box-shadow (glow esmeralda) al 30% de opacidad
    And la transicion debe durar 200ms (transition-base)

  Scenario: Should_ShowFocusState_When_PrimaryButtonIsFocused
    Given que se renderiza "<Button variant="primary">Guardar</Button>"
    When el boton recibe focus via teclado (Tab)
    Then debe mostrar un outline visible (2px, color primary-container)
    And debe mostrar el glow esmeralda
    And el outline-offset debe ser 2px

  Scenario: Should_ShowActiveState_When_PrimaryButtonIsPressed
    Given que se renderiza "<Button variant="primary">Guardar</Button>"
    When el boton es presionado (active)
    Then la transformacion debe ser "scale(0.98)"
    And la transicion debe ser inmediata (< 100ms)

  Scenario: Should_RenderDisabledState_When_PrimaryButtonIsDisabled
    Given que se renderiza "<Button variant="primary" disabled>Guardar</Button>"
    When se inspecciona el elemento renderizado
    Then la opacidad debe ser 0.4 (40%)
    And el cursor debe ser "not-allowed"
    And el elemento debe tener el atributo "disabled"
    And no debe responder a eventos de click

  Scenario: Should_RenderSecondaryButton_When_VariantIsSecondary
    Given que se renderiza "<Button variant="secondary">Cancelar</Button>"
    When se inspecciona el elemento renderizado
    Then el background-color debe ser "transparent"
    And debe tener un borde de 1px solido con color esmeralda (#00ff9d)
    And el color de texto debe ser esmeralda (#00ff9d)
    And el font-weight debe ser "600" (semibold)

  Scenario: Should_ShowHoverState_When_SecondaryButtonIsHovered
    Given que se renderiza "<Button variant="secondary">Cancelar</Button>"
    When el cursor se posiciona sobre el boton (hover)
    Then el background-color debe cambiar a esmeralda con 10% de opacidad
    And la transicion debe ser suave (200ms ease)

  Scenario: Should_RenderIconButton_When_VariantIsIcon
    Given que se renderiza "<Button variant="icon" size="icon"><SettingsIcon /></Button>"
    When se inspecciona el elemento renderizado
    Then el ancho y alto deben ser iguales (aspecto cuadrado)
    And el border-radius debe ser "9999px" (fully rounded)
    And el background-color debe ser "transparent"
    And no debe tener texto visible (solo icono)

  Scenario: Should_ShowHoverState_When_IconButtonIsHovered
    Given que se renderiza "<Button variant="icon" size="icon"><SettingsIcon /></Button>"
    When el cursor se posiciona sobre el boton (hover)
    Then el background-color debe cambiar a esmeralda con 15% de opacidad
    And la transicion debe ser suave (200ms ease)

  Scenario: Should_SupportAllButtonSizes_When_SizePropIsProvided
    Given que se renderiza "<Button variant="primary" size="sm">Pequeno</Button>"
    When se inspecciona el elemento renderizado
    Then la altura debe ser menor que un boton size "default"
    And el padding horizontal debe ser proporcional
    When se renderiza "<Button variant="primary" size="lg">Grande</Button>"
    Then la altura debe ser mayor que un boton size "default"
```

### Impacto Tecnico

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `src/components/ui/button.tsx` | **Crear/Modificar** | Componente Button basado en shadcn/ui. Agregar variantes `primary`, `secondary`, `ghost`, `icon`. Estilos con Tailwind usando los tokens del design system |
| `src/components/ui/button.test.tsx` | **Crear** | Tests unitarios con Vitest + Testing Library para cada variante y estado |
| `src/components/ui/button.stories.tsx` | **Crear** (opcional) | Stories para documentacion visual si se usa Storybook |

### Definicion de Terminado (DoD)

- [ ] El componente Button exporta variantes: `primary`, `secondary`, `ghost`, `icon`
- [ ] La variante `primary` tiene fondo `#00ff9d`, texto oscuro bold, sin borde
- [ ] La variante `secondary/ghost` tiene fondo transparente, borde 1px esmeralda, texto esmeralda
- [ ] La variante `icon` es circular, transparente, con hover tint esmeralda al 15%
- [ ] Todos los estados (hover, focus, active, disabled) funcionan correctamente en cada variante
- [ ] El estado `focus` muestra outline visible para accesibilidad de teclado (WCAG 2.1 AA)
- [ ] El estado `disabled` aplica opacidad 40%, cursor not-allowed, y `aria-disabled`
- [ ] Los tamanos `sm`, `default`, `lg`, `icon` funcionan en todas las variantes
- [ ] Tests unitarios cubren todas las variantes y estados (coverage >= 80%)
- [ ] El componente es compatible con `asChild` de Radix (herencia shadcn/ui)

---

## US-004: Componentes Base - Cards y Glassmorphism

**Prioridad**: Must have
**Rol**: Desarrollador Frontend / Usuario Final
**Depende de**: US-002 (Tailwind Config)
**Entidades afectadas**: N/A (componentes UI)
**Eventos de dominio**: N/A

### Descripcion

Como desarrollador frontend, quiero crear un componente Card con efecto glassmorphism que soporte multiples niveles de elevacion (Level 0 a Level 3), para que los contenedores de contenido tengan profundidad visual y jerarquia clara segun el diseno "Apex Athletic Intelligence".

El componente debe implementar:
- **Glassmorphism**: fondo semi-transparente (`surface-container-low` al 60% opacity), `backdrop-filter: blur(20px)`, borde 1px solid `#1a1c1f`, border-radius 1rem
- **Header con gradiente**: opcional, gradiente secundario oscuro para anclar titulos
- **Elevacion Level 0** (Base): Sin card, fondo `#0c0e11` (la pagina misma)
- **Elevacion Level 1**: Sidebar/navegacion, fondo `#111317`, sin blur
- **Elevacion Level 2**: Cards/contenedores estandar, glassmorphism 60% opacity + blur(20px)
- **Elevacion Level 3**: Modales/popovers, glassmorphism 80% opacity + blur(30px) + borde con tint esmeralda al 20%

### Criterios de Aceptacion (Gherkin)

```gherkin
Feature: Componentes Base - Cards y Glassmorphism — US-004
  Como desarrollador frontend
  Quiero crear un componente Card con efecto glassmorphism y niveles de elevacion
  Para dar profundidad visual y jerarquia clara a los contenedores

  Background:
    Given que los design tokens y la configuracion de Tailwind estan disponibles
    And el componente Card de shadcn/ui esta instalado en el proyecto

  Scenario: Should_RenderDefaultGlassmorphismCard_When_NoElevationIsSpecified
    Given que se renderiza "<Card><CardContent>Contenido</CardContent></Card>"
    When se inspecciona el elemento renderizado
    Then el background-color debe ser semi-transparente (opacidad ~60%)
    And debe tener "backdrop-filter: blur(20px)" aplicado
    And debe tener un borde de 1px solido con color "#1a1c1f"
    And el border-radius debe ser "1rem" (radius-lg)
    And el contenido interno debe ser visible y legible

  Scenario: Should_RenderLevel0Elevation_When_ElevationIsLevel0
    Given que se renderiza "<Card elevation={0}>Base Canvas</Card>"
    When se inspecciona el elemento renderizado
    Then el background-color debe ser "#0c0e11" (surface-container-lowest)
    And no debe tener backdrop-filter (sin blur)
    And no debe tener sombra o borde prominente

  Scenario: Should_RenderLevel1Elevation_When_ElevationIsLevel1
    Given que se renderiza "<Card elevation={1}>Sidebar</Card>"
    When se inspecciona el elemento renderizado
    Then el background-color debe ser "#111317" (background/surface)
    And la sombra debe ser "shadow-level-1"
    And el z-index debe ser mayor que el contenido Level 0

  Scenario: Should_RenderLevel2Elevation_When_ElevationIsLevel2
    Given que se renderiza "<Card elevation={2}>Dashboard Card</Card>"
    When se inspecciona el elemento renderizado
    Then el background-color debe ser semi-transparente (opacidad 60%)
    And debe tener "backdrop-filter: blur(20px)"
    And debe tener la sombra "shadow-level-2"
    And el borde debe ser 1px solid "#1a1c1f"

  Scenario: Should_RenderLevel3Elevation_When_ElevationIsLevel3
    Given que se renderiza "<Card elevation={3}>Modal Content</Card>"
    When se inspecciona el elemento renderizado
    Then el background-color debe tener opacidad ~80%
    And debe tener "backdrop-filter: blur(30px)"
    And debe tener la sombra "shadow-level-3"
    And el borde debe tener un tint esmeralda (#00ff9d) al 20% de opacidad
    And el z-index debe ser el mas alto entre los niveles

  Scenario: Should_RenderCardWithHeader_When_HeaderContentIsProvided
    Given que se renderiza:
      """
      <Card>
        <CardHeader>
          <CardTitle>Titulo de Seccion</CardTitle>
          <CardDescription>Descripcion secundaria</CardDescription>
        </CardHeader>
        <CardContent>Contenido principal</CardContent>
      </Card>
      """
    When se inspecciona el elemento renderizado
    Then debe existir un elemento CardHeader con el titulo "Titulo de Seccion"
    And debe existir un elemento CardContent con "Contenido principal"
    And el CardTitle debe usar la tipografia "headline-sm" (20px, weight 600)

  Scenario: Should_RenderCardWithOptionalGradientHeader_When_GradientHeaderIsEnabled
    Given que se renderiza "<Card elevation={2} gradientHeader={true}>...</Card>"
    When se inspecciona el CardHeader
    Then el header debe tener un gradiente de fondo (oscuro a mas oscuro)
    And el gradiente no debe desbordar el border-radius de la card

  Scenario: Should_NotApplyBackdropBlur_When_BrowserDoesNotSupportIt
    Given que el navegador no soporta "backdrop-filter"
    When se renderiza "<Card elevation={2}>Fallback Content</Card>"
    Then el background debe ser un color solido opaco como fallback
    And el contenido debe permanecer completamente legible

  Scenario: Should_BeComposable_When_UsedWithOtherComponents
    Given que se renderiza:
      """
      <Card elevation={2}>
        <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
        <CardContent>
          <Button variant="primary">Editar</Button>
          <Badge variant="success">Activo</Badge>
        </CardContent>
        <CardFooter>
          <Button variant="secondary">Cancelar</Button>
        </CardFooter>
      </Card>
      """
    When se inspecciona el elemento renderizado
    Then todos los sub-componentes deben renderizarse correctamente
    And los botones y badges deben ser interactivos
    And el espaciado interno (padding) debe ser consistente
```

### Impacto Tecnico

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `src/components/ui/card.tsx` | **Crear/Modificar** | Componente Card con sub-componentes (CardHeader, CardTitle, CardDescription, CardContent, CardFooter). Prop `elevation` (0-3) y `gradientHeader` (boolean). Basado en shadcn/ui Card |
| `src/components/ui/card.test.tsx` | **Crear** | Tests unitarios para cada nivel de elevacion, glassmorphism, header gradiente, composicion |
| `src/app/globals.css` | **Modificar** | Agregar clases utilitarias `.glass-2` y `.glass-3` con las reglas completas de glassmorphism (background, backdrop-filter, border) para reutilizacion |

### Definicion de Terminado (DoD)

- [ ] El componente Card soporta 4 niveles de elevacion (0, 1, 2, 3) via prop `elevation`
- [ ] Level 2 aplica glassmorphism: 60% opacity + blur(20px) + borde #1a1c1f + radius 1rem
- [ ] Level 3 aplica glassmorphism: 80% opacity + blur(30px) + borde con tint esmeralda 20%
- [ ] El header con gradiente es opcional y no rompe el border-radius
- [ ] Sub-componentes (CardHeader, CardTitle, CardDescription, CardContent, CardFooter) funcionan
- [ ] Hay fallback solido para navegadores que no soportan backdrop-filter
- [ ] Compatible con el resto de componentes del design system (botones, badges, inputs)
- [ ] Tests unitarios cubren todos los niveles de elevacion y variantes
- [ ] El componente soporta la prop `className` para estilos adicionales

---

## US-005: Componentes Base - Badges de Roles y Estados

**Prioridad**: Must have
**Rol**: Desarrollador Frontend / Usuario Final
**Depende de**: US-002 (Tailwind Config)
**Entidades afectadas**: N/A (componentes UI)
**Eventos de dominio**: N/A

### Descripcion

Como desarrollador frontend, quiero crear un componente Badge que renderice etiquetas visuales para roles de comunidad (Owner, Captain, Coach, Member) y estados (success, warning, error, info), siguiendo el patron de "glass-tag" del design system: fondo semi-transparente derivado del color de estado al 15% de opacidad, texto de alta saturacion, y forma pill (fully rounded).

Las variantes deben ser:
- **Roles**: `owner` (gold/dorado), `captain` (esmeralda), `coach` (azul/tertiary), `member` (gris/secundario). Cada uno usa el color de su estado al 15% opacity en el fondo y el color saturado en el texto.
- **Estados**: `success` (esmeralda), `warning` (amarillo/ambar), `error` (rojo), `info` (azul/tertiary). Misma logica de opacidad.
- **Forma**: Siempre pill (fully rounded, `border-radius: 9999px`).
- **Tamanos**: `sm`, `default`, `lg`.

### Criterios de Aceptacion (Gherkin)

```gherkin
Feature: Componentes Base - Badges de Roles y Estados — US-005
  Como desarrollador frontend
  Quiero crear un componente Badge para roles y estados
  Para mostrar etiquetas visuales consistentes con el estilo glass-tag

  Background:
    Given que los design tokens y la configuracion de Tailwind estan disponibles

  Scenario: Should_RenderOwnerBadge_When_VariantIsOwner
    Given que se renderiza "<Badge variant="owner">Owner</Badge>"
    When se inspecciona el elemento renderizado
    Then el texto debe ser "Owner"
    And el border-radius debe ser "9999px" (fully rounded)
    And el fondo debe tener opacidad reducida (~15%) del color de owner
    And el color de texto debe ser saturado (alta legibilidad)
    And el padding horizontal debe ser al menos 12px

  Scenario: Should_RenderCaptainBadge_When_VariantIsCaptain
    Given que se renderiza "<Badge variant="captain">Captain</Badge>"
    When se inspecciona el elemento renderizado
    Then el fondo debe ser esmeralda al 15% de opacidad
    And el texto debe ser esmeralda saturado (#00ff9d o similar)
    And la forma debe ser pill (fully rounded)

  Scenario: Should_RenderCoachBadge_When_VariantIsCoach
    Given que se renderiza "<Badge variant="coach">Coach</Badge>"
    When se inspecciona el elemento renderizado
    Then el fondo debe derivarse del color tertiary (azul/verde) al 15% opacity
    And el texto debe ser tertiary saturado
    And la forma debe ser pill

  Scenario: Should_RenderMemberBadge_When_VariantIsMember
    Given que se renderiza "<Badge variant="member">Member</Badge>"
    When se inspecciona el elemento renderizado
    Then el fondo debe derivarse del color secondary (gris) al 15% opacity
    And el texto debe ser secondary saturado (on-secondary-container)
    And la forma debe ser pill

  Scenario: Should_RenderSuccessBadge_When_VariantIsSuccess
    Given que se renderiza "<Badge variant="success">Activo</Badge>"
    When se inspecciona el elemento renderizado
    Then el fondo debe ser esmeralda/verde al 15% opacity
    And el texto debe ser esmeralda saturado
    And la forma debe ser pill

  Scenario: Should_RenderWarningBadge_When_VariantIsWarning
    Given que se renderiza "<Badge variant="warning">Pendiente</Badge>"
    When se inspecciona el elemento renderizado
    Then el fondo debe ser amarillo/ambar al 15% opacity
    And el texto debe ser amarillo saturado

  Scenario: Should_RenderErrorBadge_When_VariantIsError
    Given que se renderiza "<Badge variant="error">Error</Badge>"
    When se inspecciona el elemento renderizado
    Then el fondo debe ser rojo (error-container) al 15% de opacidad
    And el texto debe ser rojo saturado (on-error-container)

  Scenario: Should_RenderInfoBadge_When_VariantIsInfo
    Given que se renderiza "<Badge variant="info">Informacion</Badge>"
    When se inspecciona el elemento renderizado
    Then el fondo debe ser tertiary al 15% opacity
    And el texto debe ser tertiary saturado

  Scenario: Should_SupportDifferentSizes_When_SizePropIsProvided
    Given que se renderiza "<Badge variant="success" size="sm">Pequeno</Badge>"
    When se inspecciona el elemento renderizado
    Then el font-size debe ser menor que el tamano default
    And el padding debe ser menor
    When se renderiza "<Badge variant="success" size="lg">Grande</Badge>"
    Then el font-size debe ser mayor que el tamano default

  Scenario: Should_BeAccessible_When_RenderedWithScreenReader
    Given que se renderiza "<Badge variant="success">Activo</Badge>"
    When un lector de pantalla inspecciona el elemento
    Then el elemento debe tener un rol semanticamente apropiado (status o generic + aria-label)
    And el texto debe ser directamente legible (no solo color como indicador)
```

### Impacto Tecnico

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `src/components/ui/badge.tsx` | **Crear/Modificar** | Componente Badge con variantes `owner`, `captain`, `coach`, `member`, `success`, `warning`, `error`, `info`. Tamanos `sm`, `default`, `lg`. Basado en shadcn/ui Badge |
| `src/components/ui/badge.test.tsx` | **Crear** | Tests unitarios para cada variante y tamano |

### Definicion de Terminado (DoD)

- [ ] El componente Badge soporta 4 variantes de rol: `owner`, `captain`, `coach`, `member`
- [ ] El componente Badge soporta 4 variantes de estado: `success`, `warning`, `error`, `info`
- [ ] Cada variante usa fondo al 15% opacity del color correspondiente y texto saturado
- [ ] Todas las variantes tienen forma pill (`border-radius: 9999px`)
- [ ] Soportan tamanos: `sm`, `default`, `lg`
- [ ] El componente es accesible (el color no es el unico medio de transmitir informacion)
- [ ] Tests unitarios cubren todas las variantes y tamanos
- [ ] El componente acepta children (texto o iconos) y la prop `className`

---

## US-006: Componentes Base - Input Fields

**Prioridad**: Must have
**Rol**: Desarrollador Frontend / Usuario Final
**Depende de**: US-002 (Tailwind Config)
**Entidades afectadas**: N/A (componentes UI)
**Eventos de dominio**: N/A

### Descripcion

Como desarrollador frontend, quiero crear un componente Input que implemente el estilo del design system: fondo oscuro `#0c0e11` con borde sutil, transicion de borde a esmeralda `#00ff9d` en focus con glow exterior, y estados visuales para error y disabled. El componente debe basarse en shadcn/ui Input para mantener compatibilidad con React Hook Form y accesibilidad.

Estados requeridos:
- **Default**: Fondo `#0c0e11` (surface-container-lowest), borde 1px `outline-variant` (#3b4a3f), texto `on-surface` (#e2e2e6)
- **Focus**: Borde cambia a `primary-container` (#00ff9d), glow exterior (`box-shadow` con esmeralda al 20-30% opacity)
- **Error**: Borde cambia a `error` (#ffb4ab), glow exterior rojo al 20% opacity, texto de ayuda en rojo
- **Disabled**: Opacidad 40%, cursor not-allowed, sin eventos de interaccion
- **Placeholder**: Color `on-surface-variant` (#b9cbbc) con opacidad 60%

### Criterios de Aceptacion (Gherkin)

```gherkin
Feature: Componentes Base - Input Fields — US-006
  Como desarrollador frontend
  Quiero crear un componente Input con el estilo oscuro y glow esmeralda del design system
  Para que los campos de formulario tengan consistencia visual y buena usabilidad

  Background:
    Given que los design tokens y la configuracion de Tailwind estan disponibles
    And el componente Input de shadcn/ui esta instalado en el proyecto

  Scenario: Should_RenderDefaultInput_When_NoSpecialStateIsActive
    Given que se renderiza "<Input placeholder="Email" />"
    When se inspecciona el elemento renderizado
    Then el background-color debe ser "#0c0e11" (surface-container-lowest)
    And el borde debe ser 1px solid con color "#3b4a3f" (outline-variant)
    And el color de texto debe ser "#e2e2e6" (on-surface)
    And el placeholder debe decir "Email"
    And el border-radius debe ser "0.75rem" (radius-md)

  Scenario: Should_ShowFocusState_When_InputIsFocused
    Given que se renderiza "<Input placeholder="Email" />"
    When el input recibe focus (click o Tab)
    Then el borde debe cambiar a "#00ff9d" (primary-container)
    And la transicion del borde debe ser suave (200ms ease)
    And debe aparecer un box-shadow (glow esmeralda al 20-30% de opacidad)
    And el outline por defecto del navegador debe estar suprimido

  Scenario: Should_ShowErrorState_When_InputIsInvalid
    Given que se renderiza "<Input aria-invalid={true} />"
    When se inspecciona el elemento renderizado
    Then el borde debe ser de color rojo (error, #ffb4ab)
    And debe aparecer un box-shadow rojo al 20% de opacidad
    And el atributo "aria-invalid" debe ser "true"

  Scenario: Should_ShowDisabledState_When_InputIsDisabled
    Given que se renderiza "<Input disabled placeholder="No editable" />"
    When se inspecciona el elemento renderizado
    Then la opacidad debe ser 0.4 (40%)
    And el cursor debe ser "not-allowed"
    And el elemento debe tener el atributo "disabled"
    And no debe responder a eventos de focus o click

  Scenario: Should_StylePlaceholder_When_InputHasPlaceholderText
    Given que se renderiza "<Input placeholder="Buscar..." />"
    When se inspecciona el placeholder
    Then el color debe ser "#b9cbbc" (on-surface-variant) con opacidad ~60%
    And el font-style no debe ser italic (mantener consistencia)

  Scenario: Should_TransitionSmoothly_When_StateChanges
    Given que se renderiza "<Input placeholder="Email" />"
    When el input pasa de default → focus → error → default
    Then cada cambio de estado debe animarse con una transicion de 200ms ease
    And no debe haber saltos bruscos en el renderizado

  Scenario: Should_BeCompatibleWithReactHookForm_When_UsedInForm
    Given que se usa React Hook Form con un esquema Zod
    And se renderiza el Input dentro de un formulario con validacion
    When se ingresa texto invalido y se dispara la validacion
    Then el Input debe reflejar el estado de error (borde rojo + glow rojo)
    And el mensaje de error debe mostrarse debajo del Input
    When se corrige el texto a un valor valido
    Then el Input debe volver al estado default o focus

  Scenario: Should_BeAccessible_When_UsedWithLabel
    Given que se renderiza:
      """
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="correo@ejemplo.com" />
      </div>
      """
    When un lector de pantalla inspecciona el formulario
    Then el Label debe estar asociado al Input via "htmlFor" / "id"
    And el Input debe ser focusable via teclado (Tab)
```

### Impacto Tecnico

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `src/components/ui/input.tsx` | **Crear/Modificar** | Componente Input basado en shadcn/ui. Estados visuales: default, focus, error, disabled. Glow esmeralda en focus. Placeholder con estilo. Compatible con React Hook Form |
| `src/components/ui/input.test.tsx` | **Crear** | Tests unitarios para estados, accesibilidad, compatibilidad con RHF |
| `src/components/ui/label.tsx` | **Verificar** | Asegurar que el Label usa los colores y tipografia del design system |

### Definicion de Terminado (DoD)

- [ ] El Input tiene fondo `#0c0e11`, borde `#3b4a3f`, texto `#e2e2e6` en estado default
- [ ] En focus, el borde cambia a `#00ff9d` con glow exterior (box-shadow esmeralda al 20-30%)
- [ ] La transicion de borde y glow en focus es suave (200ms ease)
- [ ] Estado de error: borde rojo + glow rojo al 20% + atributo `aria-invalid`
- [ ] Estado disabled: opacidad 40%, cursor not-allowed, no interactivo
- [ ] El placeholder usa `on-surface-variant` al 60% de opacidad
- [ ] Compatible con React Hook Form (recibe y propaga `ref`, `onChange`, `onBlur`)
- [ ] Accesible: funciona con Label asociado, navegacion por teclado, atributos ARIA
- [ ] Tests unitarios cubren todos los estados y la integracion con RHF
- [ ] El border-radius es `radius-md` (0.75rem) para sensacion tactil

---

## US-007: Componentes Base - Status Indicators

**Prioridad**: Should have
**Rol**: Desarrollador Frontend / Usuario Final
**Depende de**: US-002 (Tailwind Config)
**Entidades afectadas**: N/A (componentes UI)
**Eventos de dominio**: N/A

### Descripcion

Como desarrollador frontend, quiero crear un componente StatusDot que renderice un indicador circular pequeno (8px) con efecto LED glowing (box-shadow del mismo color al 50% opacity), para mostrar estados en tiempo real como: activo (esmeralda), pendiente (amarillo), error (rojo), inactivo (gris).

El componente debe:
- Renderizar un circulo de 8x8px
- Tener un box-shadow del mismo color al 50% opacity para simular un LED
- Soportar variantes de color: `active` (esmeralda #00ff9d), `pending` (amarillo #eab308), `error` (rojo #ffb4ab), `inactive` (gris #849587)
- Opcionalmente mostrar un tooltip con texto descriptivo (usando el atributo `title` nativo o un tooltip personalizado)
- Soportar tamanos: `sm` (6px), `default` (8px), `lg` (12px)

### Criterios de Aceptacion (Gherkin)

```gherkin
Feature: Componentes Base - Status Indicators — US-007
  Como desarrollador frontend
  Quiero crear un componente StatusDot con efecto LED glowing
  Para mostrar estados en tiempo real de forma visualmente impactante

  Background:
    Given que los design tokens y la configuracion de Tailwind estan disponibles

  Scenario: Should_RenderActiveStatusDot_When_VariantIsActive
    Given que se renderiza "<StatusDot variant="active" />"
    When se inspecciona el elemento renderizado
    Then debe ser un circulo de 8px de diametro (width y height = 8px)
    And el background-color debe ser "#00ff9d" (esmeralda)
    And debe tener un box-shadow del mismo color esmeralda al 50% de opacidad
    And el border-radius debe ser "9999px"

  Scenario: Should_RenderPendingStatusDot_When_VariantIsPending
    Given que se renderiza "<StatusDot variant="pending" />"
    When se inspecciona el elemento renderizado
    Then el background-color debe ser amarillo/ambar (#eab308 o similar)
    And debe tener un box-shadow del mismo color amarillo al 50% de opacidad

  Scenario: Should_RenderErrorStatusDot_When_VariantIsError
    Given que se renderiza "<StatusDot variant="error" />"
    When se inspecciona el elemento renderizado
    Then el background-color debe ser rojo (#ffb4ab o similar)
    And debe tener un box-shadow del mismo color rojo al 50% de opacidad

  Scenario: Should_RenderInactiveStatusDot_When_VariantIsInactive
    Given que se renderiza "<StatusDot variant="inactive" />"
    When se inspecciona el elemento renderizado
    Then el background-color debe ser gris (#849587 o similar)
    And debe tener un box-shadow del mismo color gris al 50% de opacidad

  Scenario: Should_RenderSmallStatusDot_When_SizeIsSm
    Given que se renderiza "<StatusDot variant="active" size="sm" />"
    When se inspecciona el elemento renderizado
    Then el diametro debe ser 6px (width y height = 6px)

  Scenario: Should_RenderLargeStatusDot_When_SizeIsLg
    Given que se renderiza "<StatusDot variant="active" size="lg" />"
    When se inspecciona el elemento renderizado
    Then el diametro debe ser 12px (width y height = 12px)

  Scenario: Should_ShowTooltip_When_TooltipTextIsProvided
    Given que se renderiza "<StatusDot variant="active" tooltip="En linea" />"
    When el cursor se posiciona sobre el StatusDot (hover)
    Then debe mostrarse un tooltip con el texto "En linea"
    And el atributo "title" debe ser "En linea" (fallback nativo)

  Scenario: Should_AnimatePulse_When_PulsingPropIsEnabled
    Given que se renderiza "<StatusDot variant="active" pulsing={true} />"
    When se inspecciona el elemento renderizado
    Then debe tener una animacion CSS de pulso aplicada
    And la animacion debe ser sutil (cambio de opacidad del glow)

  Scenario: Should_BeAccessible_When_RenderedWithoutTooltip
    Given que se renderiza "<StatusDot variant="active" />"
    When un lector de pantalla inspecciona el elemento
    Then debe tener un "aria-label" o "role" que describa el estado
    And no debe ser un elemento puramente decorativo sin informacion semantica
```

### Impacto Tecnico

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `src/components/ui/status-dot.tsx` | **Crear** | Componente StatusDot con variantes `active`, `pending`, `error`, `inactive`. Props: `size` (sm/default/lg), `tooltip` (string opcional), `pulsing` (boolean) |
| `src/components/ui/status-dot.test.tsx` | **Crear** | Tests unitarios para cada variante, tamano, tooltip, animacion, accesibilidad |

### Definicion de Terminado (DoD)

- [ ] El StatusDot renderiza un circulo de 8px (default) con border-radius 9999px
- [ ] Las 4 variantes de color (`active`, `pending`, `error`, `inactive`) funcionan correctamente
- [ ] Cada variante tiene un box-shadow del mismo color al 50% opacity (efecto LED)
- [ ] Los tamanos `sm` (6px), `default` (8px), `lg` (12px) funcionan
- [ ] El tooltip opcional se muestra en hover (atributo `title` como fallback)
- [ ] La animacion `pulsing` opcional aplica una animacion CSS de pulso sutil
- [ ] El componente es accesible (tiene `role="status"` y `aria-label`)
- [ ] Tests unitarios cubren todas las variantes, tamanos y props opcionales

---

## US-008: Layout Principal - Sidebar + Main Content

**Prioridad**: Must have
**Rol**: Desarrollador Frontend / Usuario Final
**Depende de**: US-001 (Design Tokens), US-009 (Tipografia) — puede iniciar en paralelo con US-002 a US-007
**Entidades afectadas**: N/A (layout)
**Eventos de dominio**: N/A

### Descripcion

Como desarrollador frontend, quiero reemplazar el layout actual (header horizontal simple) por el layout principal del design system: un sidebar fijo de 260px a la izquierda con fondo `#111317` (Level 1), y un area de contenido principal con padding responsive (32px desktop, 16px mobile), gutter de 24px entre modulos. La sidebar debe colapsar en mobile (hamburger menu) usando un drawer o panel deslizante.

Requerimientos especificos:
- **Sidebar**: Fijo a la izquierda, ancho 260px, altura 100vh, fondo `#111317` (surface/Level 1). Contiene logo, navegacion principal, y footer con perfil de usuario.
- **Main Content**: Ocupa el resto del viewport (`ml-[260px]` en desktop). Padding: 32px desktop, 16px mobile. Los modulos internos tienen gutter de 24px entre ellos.
- **Mobile**: La sidebar colapsa a un menu hamburger. Al hacer tap en el icono, se despliega como overlay/drawer sobre el contenido.
- **Transicion**: La sidebar y el contenido deben transicionar suavemente cuando se colapsa/expande.

### Criterios de Aceptacion (Gherkin)

```gherkin
Feature: Layout Principal - Sidebar + Main Content — US-008
  Como desarrollador frontend
  Quiero implementar un layout con sidebar fijo y contenido principal
  Para que la navegacion sea persistente y el contenido tenga espaciado consistente

  Background:
    Given que los design tokens y la tipografia Montserrat estan disponibles
    And la aplicacion se ejecuta en un viewport desktop (>= 1024px)

  Scenario: Should_RenderSidebar_When_ViewportIsDesktop
    Given que el viewport es mayor o igual a 1024px
    When la pagina principal se renderiza
    Then debe existir un elemento sidebar en el lado izquierdo
    And el ancho del sidebar debe ser 260px
    And la altura debe ser 100vh (altura completa del viewport)
    And el background-color debe ser "#111317"
    And la posicion debe ser "fixed" (permanece visible al hacer scroll)

  Scenario: Should_RenderMainContent_When_ViewportIsDesktop
    Given que el viewport es mayor o igual a 1024px
    When la pagina principal se renderiza
    Then el contenido principal debe ocupar el espacio restante (a la derecha del sidebar)
    And el margin-left debe ser 260px (ancho del sidebar)
    And el padding debe ser 32px en todos los lados
    And el ancho debe ser "calc(100vw - 260px)"

  Scenario: Should_HideSidebar_When_ViewportIsMobile
    Given que el viewport es menor a 1024px (mobile/tablet)
    When la pagina principal se renderiza
    Then la sidebar NO debe ser visible por defecto
    And debe aparecer un icono de menu hamburguer en la esquina superior izquierda
    And el contenido principal debe ocupar el 100% del ancho
    And el padding del contenido debe ser 16px

  Scenario: Should_ToggleSidebar_When_HamburgerIsClickedOnMobile
    Given que el viewport es menor a 1024px
    And la pagina principal esta renderizada con la sidebar oculta
    When el usuario hace click en el icono de menu hamburguer
    Then la sidebar debe mostrarse como overlay/drawer sobre el contenido
    And debe tener un fondo semi-transparente (overlay) detras
    And la transicion debe ser suave (300ms ease)
    When el usuario hace click fuera de la sidebar o en el boton cerrar
    Then la sidebar debe ocultarse nuevamente

  Scenario: Should_ApplyGutterBetweenContentModules_When_MultipleCardsExist
    Given que el viewport es desktop
    And el contenido principal contiene multiples Cards o modulos
    When se inspecciona el espaciado entre el primer y segundo modulo
    Then el gap vertical entre modulos debe ser 24px (gutter)
    And el gap horizontal entre modulos en un grid debe ser 24px

  Scenario: Should_ContainLogoAndNavigation_When_SidebarIsRendered
    Given que el viewport es desktop
    When se inspecciona el contenido de la sidebar
    Then debe contener el logo de SportHub Connect en la parte superior
    And debe contener enlaces de navegacion (Dashboard, Comunidad, Eventos, etc.)
    And debe contener la foto/avatar del usuario y su nombre en la parte inferior
    And los enlaces activos deben tener un indicador visual (acento esmeralda)

  Scenario: Should_ScrollContentIndependently_When_ContentIsLongerThanViewport
    Given que el contenido principal es mas largo que el viewport
    When el usuario hace scroll hacia abajo
    Then el contenido principal debe desplazarse (scroll)
    And la sidebar debe permanecer fija (no hace scroll)
    And el scroll debe ser fluido

  Scenario: Should_BeResponsive_When_ViewportResizes
    Given que el viewport es desktop (>= 1024px)
    And la sidebar es visible
    When el viewport se redimensiona a < 1024px
    Then la sidebar debe ocultarse automaticamente
    And debe aparecer el icono de menu hamburguer
    And el padding del contenido debe cambiar de 32px a 16px
```

### Impacto Tecnico

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `src/app/layout.tsx` | **Reemplazar** | Sustituir el layout actual (header horizontal + footer) por el nuevo layout sidebar + main content. Importar fuentes Montserrat |
| `src/components/layout/sidebar.tsx` | **Crear** | Componente Sidebar: fijo 260px, fondo Level 1, logo, navegacion, perfil. Estado colapsado en mobile |
| `src/components/layout/sidebar-nav.tsx` | **Crear** | Navegacion interna de la sidebar con links activos y acento esmeralda |
| `src/components/layout/main-content.tsx` | **Crear** | Componente wrapper del contenido principal con padding responsive y gutter |
| `src/components/layout/mobile-sidebar.tsx` | **Crear** | Drawer/overlay de la sidebar para mobile con toggle y transicion |
| `src/app/globals.css` | **Modificar** | Agregar reglas para sidebar, transiciones, breakpoints responsive |

### Definicion de Terminado (DoD)

- [ ] Sidebar fijo de 260px a la izquierda, con fondo `#111317` (Level 1)
- [ ] Sidebar contiene: logo, navegacion principal, avatar/nombre de usuario
- [ ] Links de navegacion activos muestran indicador esmeralda
- [ ] Main content con padding 32px (desktop) y 16px (mobile)
- [ ] Gutter de 24px entre modulos en el contenido principal
- [ ] En mobile (< 1024px), sidebar se oculta y aparece menu hamburguer
- [ ] Menu hamburguer despliega sidebar como overlay/drawer con transicion suave
- [ ] La sidebar no hace scroll, el contenido principal si
- [ ] Transiciones suaves al colapsar/expandir (300ms ease)
- [ ] El layout funciona en viewports: 320px (mobile), 768px (tablet), 1024px+ (desktop)
- [ ] Accesible: navegacion por teclado en sidebar, focus trap en mobile drawer
- [ ] No hay regresion visual en las paginas existentes (login, registro) que usan layout propio

---

## US-009: Tipografia y Jerarquia Visual (Montserrat)

**Prioridad**: Must have
**Rol**: Desarrollador Frontend / Usuario Final
**Depende de**: US-001 (Design Tokens) — puede iniciar en paralelo con US-002
**Entidades afectadas**: N/A (tipografia)
**Eventos de dominio**: N/A

### Descripcion

Como desarrollador frontend, quiero cargar la fuente Montserrat (desde Google Fonts o local) y crear clases utilitarias CSS para la escala tipografica completa del design system (7 niveles), asegurando que numeros/metricas usen fontWeight 700, labels usen uppercase, y headlines escalen 15% menos en mobile.

Niveles tipograficos a implementar:
- `display-lg`: 32px, weight 700, line-height 1.2, letter-spacing -0.02em
- `headline-md`: 24px, weight 700, line-height 1.3
- `headline-sm`: 20px, weight 600, line-height 1.4
- `body-lg`: 16px, weight 400, line-height 1.6
- `body-md`: 14px, weight 400, line-height 1.5
- `label-caps`: 11px, weight 700, line-height 1.2, letter-spacing 0.1em, uppercase
- `meta-sm`: 12px, weight 500, line-height 1.4

Reglas adicionales:
- Numeros/metricas (XP, scores, stats): fontWeight 700
- Labels: uppercase automatico
- Mobile (< 768px): headlines escalan -15% (display-lg: 27.2px, headline-md: 20.4px, headline-sm: 17px)

### Criterios de Aceptacion (Gherkin)

```gherkin
Feature: Tipografia y Jerarquia Visual (Montserrat) — US-009
  Como desarrollador frontend
  Quiero cargar Montserrat y crear la escala tipografica completa del design system
  Para que el texto en toda la aplicacion tenga jerarquia visual consistente

  Background:
    Given que los design tokens estan disponibles en "globals.css"

  Scenario: Should_LoadMontserratFont_When_ApplicationStarts
    Given que la fuente Montserrat esta configurada via next/font/google en layout.tsx
    When la aplicacion se carga en el navegador
    Then la fuente Montserrat debe estar disponible para su uso
    And la variable CSS "--font-montserrat" debe estar definida
    And el body debe usar "Montserrat" como font-family principal
    And la carga debe ser optimizada (display: swap, subsets: latin)

  Scenario: Should_ApplyDisplayLg_When_ClassIsUsed
    Given que se renderiza "<h1 className="text-display-lg">Titulo Principal</h1>"
    When se inspecciona el elemento renderizado en viewport desktop
    Then el font-size debe ser "32px"
    And el font-weight debe ser "700"
    And el line-height debe ser "1.2"
    And el letter-spacing debe ser "-0.02em"
    And la font-family debe ser "Montserrat"

  Scenario: Should_ApplyHeadlineMd_When_ClassIsUsed
    Given que se renderiza "<h2 className="text-headline-md">Subtitulo</h2>"
    When se inspecciona el elemento renderizado
    Then el font-size debe ser "24px"
    And el font-weight debe ser "700"
    And el line-height debe ser "1.3"

  Scenario: Should_ApplyHeadlineSm_When_ClassIsUsed
    Given que se renderiza "<h3 className="text-headline-sm">Seccion</h3>"
    When se inspecciona el elemento renderizado
    Then el font-size debe ser "20px"
    And el font-weight debe ser "600"
    And el line-height debe ser "1.4"

  Scenario: Should_ApplyBodyLg_When_ClassIsUsed
    Given que se renderiza "<p className="text-body-lg">Parrafo de cuerpo grande</p>"
    When se inspecciona el elemento renderizado
    Then el font-size debe ser "16px"
    And el font-weight debe ser "400"
    And el line-height debe ser "1.6"

  Scenario: Should_ApplyBodyMd_When_ClassIsUsed
    Given que se renderiza "<p className="text-body-md">Texto estandar</p>"
    When se inspecciona el elemento renderizado
    Then el font-size debe ser "14px"
    And el font-weight debe ser "400"
    And el line-height debe ser "1.5"

  Scenario: Should_ApplyLabelCaps_When_ClassIsUsed
    Given que se renderiza "<span className="text-label-caps">CATEGORIA</span>"
    When se inspecciona el elemento renderizado
    Then el font-size debe ser "11px"
    And el font-weight debe ser "700"
    And el line-height debe ser "1.2"
    And el letter-spacing debe ser "0.1em"
    And el texto debe estar en uppercase (text-transform: uppercase)

  Scenario: Should_ApplyMetaSm_When_ClassIsUsed
    Given que se renderiza "<span className="text-meta-sm">hace 5 minutos</span>"
    When se inspecciona el elemento renderizado
    Then el font-size debe ser "12px"
    And el font-weight debe ser "500"
    And el line-height debe ser "1.4"

  Scenario: Should_ApplyBoldWeight_When_ElementContainsNumericData
    Given que se renderiza "<span className="text-metric">1,250 XP</span>"
    When se inspecciona el elemento renderizado con la clase "text-metric"
    Then el font-weight debe ser "700"
    And el font-size debe ser el de body-lg o mayor
    And la font-family debe ser "Montserrat"

  Scenario: Should_ScaleHeadlinesDown_When_ViewportIsMobile
    Given que el viewport es menor a 768px
    When se renderiza "<h1 className="text-display-lg">Titulo</h1>"
    Then el font-size computado debe ser aproximadamente 27.2px (32px * 0.85)
    When se renderiza "<h2 className="text-headline-md">Subtitulo</h2>"
    Then el font-size computado debe ser aproximadamente 20.4px (24px * 0.85)
    When se renderiza "<h3 className="text-headline-sm">Seccion</h3>"
    Then el font-size computado debe ser 17px (20px * 0.85)

  Scenario: Should_NotScaleBodyText_When_ViewportIsMobile
    Given que el viewport es menor a 768px
    When se renderiza "<p className="text-body-lg">Parrafo</p>"
    Then el font-size debe permanecer en 16px (sin escalar)
    And el body-md debe permanecer en 14px
    And el meta-sm debe permanecer en 12px
```

### Impacto Tecnico

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `src/app/layout.tsx` | **Modificar** | Reemplazar fuente Inter por Montserrat via `next/font/google`. Configurar `subsets: ['latin']`, `display: 'swap'`, `variable: '--font-montserrat'` |
| `src/app/globals.css` | **Modificar** | Agregar clases utilitarias para los 7 niveles tipograficos. Agregar media query para escalado -15% de headlines en mobile. Agregar clase `.text-metric` para datos numericos |
| `src/app/globals.css` | **Modificar** | Actualizar el body y la configuracion de `fontFamily` en `@theme` para usar Montserrat |
| `src/types/typography.ts` | **Crear** (opcional) | Tipos TypeScript si se requiere un sistema de variantes tipograficas programatico |

### Definicion de Terminado (DoD)

- [ ] La fuente Montserrat se carga correctamente (sin FOIT/FOUT notable gracias a `display: swap`)
- [ ] Los 7 niveles tipograficos (`display-lg`, `headline-md`, `headline-sm`, `body-lg`, `body-md`, `label-caps`, `meta-sm`) existen como clases CSS
- [ ] Cada nivel aplica los valores correctos de font-size, font-weight, line-height y letter-spacing
- [ ] `label-caps` aplica `text-transform: uppercase` y `letter-spacing: 0.1em`
- [ ] La clase `.text-metric` aplica `font-weight: 700` para datos numericos
- [ ] En mobile (< 768px), los headlines escalan -15% (display-lg, headline-md, headline-sm)
- [ ] Los textos de cuerpo (body-lg, body-md, meta-sm) NO escalan en mobile
- [ ] La configuracion de `next/font/google` es correcta (sin errores de build)
- [ ] Montserrat se aplica como fuente por defecto en todos los elementos (via `body`)
- [ ] No quedan referencias a la fuente Inter en el layout ni en globals.css
- [ ] La carga de la fuente no impacta negativamente el LCP (Large Contentful Paint)

---

## Resumen de HUs y Prioridades

| HU | Titulo | Prioridad | Depende de |
|----|--------|-----------|------------|
| US-001 | Design Tokens (CSS Variables) | Must have | — |
| US-002 | Configuracion de Tailwind con Paleta Personalizada | Must have | US-001 |
| US-003 | Componentes Base - Botones | Must have | US-002 |
| US-004 | Componentes Base - Cards y Glassmorphism | Must have | US-002 |
| US-005 | Componentes Base - Badges de Roles y Estados | Must have | US-002 |
| US-006 | Componentes Base - Input Fields | Must have | US-002 |
| US-007 | Componentes Base - Status Indicators | Should have | US-002 |
| US-008 | Layout Principal - Sidebar + Main Content | Must have | US-001, US-009 |
| US-009 | Tipografia y Jerarquia Visual (Montserrat) | Must have | US-001 |

---

## Mapeo a Bounded Contexts

Esta feature es **transversal al frontend** y no pertenece a un bounded context del backend especifico. Todos los componentes creados aqui seran consumidos por las pantallas y funcionalidades de los bounded contexts de negocio (Community, Event Planning, Gamification, etc.) en features posteriores.

## Eventos de Dominio

N/A — Esta feature es puramente de presentacion (UI). No genera ni consume eventos de dominio del backend.

---

## Referencia al Diseno Fuente

> **Archivo**: `prototipes/stitch_krewletics_sports_community/DESIGN.md`
> **Sistema**: "Apex Athletic Intelligence"
> **Estilo**: High-Tech Athletic — Deep Dark + Emerald Neon + Glassmorphism
