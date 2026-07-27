Feature: Design Tokens (CSS Variables) — F024 US-001
  Como desarrollador frontend
  Quiero definir todos los tokens de diseño como CSS custom properties en :root
  Para que los componentes consuman valores consistentes desde una única fuente de verdad

  Background:
    Given el frontend está iniciado
    And el usuario navega a la página principal

  Scenario: Should_DefineAll47ColorTokens_When_GlobalsCssIsLoaded
    When se cargan los estilos del documento
    Then debe existir "--color-surface" con valor "#111317"
    And debe existir "--color-surface-dim" con valor "#111317"
    And debe existir "--color-surface-bright" con valor "#37393d"
    And debe existir "--color-surface-container-lowest" con valor "#0c0e11"
    And debe existir "--color-surface-container-low" con valor "#1a1c1f"
    And debe existir "--color-surface-container" con valor "#1e2023"
    And debe existir "--color-surface-container-high" con valor "#282a2d"
    And debe existir "--color-surface-container-highest" con valor "#333538"
    And debe existir "--color-on-surface" con valor "#e2e2e6"
    And debe existir "--color-on-surface-variant" con valor "#b9cbbc"
    And debe existir "--color-surface-variant" con valor "#333538"
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
    And debe existir "--color-primary-fixed" con valor "#56ffa8"
    And debe existir "--color-primary-fixed-dim" con valor "#00e38b"
    And debe existir "--color-on-primary-fixed" con valor "#002110"
    And debe existir "--color-on-primary-fixed-variant" con valor "#00522f"
    And debe existir "--color-secondary" con valor "#c6c6ca"
    And debe existir "--color-on-secondary" con valor "#2f3034"
    And debe existir "--color-secondary-container" con valor "#47494c"
    And debe existir "--color-on-secondary-container" con valor "#b7b8bc"
    And debe existir "--color-secondary-fixed" con valor "#e2e2e6"
    And debe existir "--color-secondary-fixed-dim" con valor "#c6c6ca"
    And debe existir "--color-on-secondary-fixed" con valor "#1a1c1f"
    And debe existir "--color-on-secondary-fixed-variant" con valor "#45474a"
    And debe existir "--color-tertiary" con valor "#f4fff0"
    And debe existir "--color-on-tertiary" con valor "#003915"
    And debe existir "--color-tertiary-container" con valor "#67fb8c"
    And debe existir "--color-on-tertiary-container" con valor "#007231"
    And debe existir "--color-tertiary-fixed" con valor "#6bff8f"
    And debe existir "--color-tertiary-fixed-dim" con valor "#4ae176"
    And debe existir "--color-on-tertiary-fixed" con valor "#002109"
    And debe existir "--color-on-tertiary-fixed-variant" con valor "#005321"
    And debe existir "--color-error" con valor "#ffb4ab"
    And debe existir "--color-on-error" con valor "#690005"
    And debe existir "--color-error-container" con valor "#93000a"
    And debe existir "--color-on-error-container" con valor "#ffdad6"
    And debe existir "--color-background" con valor "#111317"
    And debe existir "--color-on-background" con valor "#e2e2e6"

  Scenario: Should_DefineGlassmorphismTokens_When_GlobalsCssIsLoaded
    When se cargan los estilos del documento
    Then debe existir "--glass-opacity" con valor "0.6"
    And debe existir "--glass-blur" con valor "20px"
    And debe existir "--glass-border" con valor "#1a1c1f"
    And debe existir "--glass-modal-opacity" con valor "0.8"
    And debe existir "--glass-modal-blur" con valor "30px"

  Scenario: Should_DefineGlowTokens_When_GlobalsCssIsLoaded
    When se cargan los estilos del documento
    Then debe existir "--glow-primary" cuyo valor contiene "rgba(0, 255, 157"
    And debe existir "--glow-primary-strong" cuyo valor contiene "rgba(0, 255, 157"
    And debe existir "--shadow-level-0"
    And debe existir "--shadow-level-1"
    And debe existir "--shadow-level-2"
    And debe existir "--shadow-level-3"

  Scenario: Should_DefineSpacingTokens_When_GlobalsCssIsLoaded
    When se cargan los estilos del documento
    Then debe existir "--spacing-base" con valor "8px"
    And debe existir "--spacing-gutter" con valor "24px"
    And debe existir "--spacing-margin-mobile" con valor "16px"
    And debe existir "--spacing-margin-desktop" con valor "32px"
    And debe existir "--sidebar-width" con valor "260px"

  Scenario: Should_DefineRadiusTokens_When_GlobalsCssIsLoaded
    When se cargan los estilos del documento
    Then debe existir "--radius-sm" con valor "0.25rem"
    And debe existir "--radius-DEFAULT" con valor "0.5rem"
    And debe existir "--radius-md" con valor "0.75rem"
    And debe existir "--radius-lg" con valor "1rem"
    And debe existir "--radius-xl" con valor "1.5rem"
    And debe existir "--radius-full" con valor "9999px"

  Scenario: Should_DefineTransitionTokens_When_GlobalsCssIsLoaded
    When se cargan los estilos del documento
    Then debe existir "--transition-fast" con valor "150ms ease"
    And debe existir "--transition-base" con valor "200ms ease"
    And debe existir "--transition-slow" con valor "300ms ease"

  Scenario: Should_DefineTypographyTokens_When_GlobalsCssIsLoaded
    When se cargan los estilos del documento
    Then debe existir "--font-family-primary" con valor "'Montserrat', sans-serif"
    And debe existir "--font-family-mono" con valor "'JetBrains Mono', monospace"
