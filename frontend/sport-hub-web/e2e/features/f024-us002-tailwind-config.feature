@f024-us002
Feature: Configuracion de Tailwind con Paleta Personalizada — F024 US-002
  Como desarrollador frontend
  Quiero extender Tailwind CSS v4 para usar los design tokens de US-001
  Para poder usar clases utilitarias con la paleta del design system

  Background:
    Given la aplicacion carga correctamente con Tailwind CSS y los design tokens activos

  # ── Scenario 1: Background Color classes ──
  Scenario: Should_GenerateCorrectBgColorClass
    When se renderiza un elemento con la clase "bg-primary-container"
    Then el background-color del elemento con clase Tailwind debe ser "#00ff9d"
    When se renderiza un elemento con la clase "bg-surface-container-lowest"
    Then el background-color del elemento con clase Tailwind debe ser "#0c0e11"
    When se renderiza un elemento con la clase "bg-surface-container-low"
    Then el background-color del elemento con clase Tailwind debe ser "#1a1c1f"
    When se renderiza un elemento con la clase "bg-surface-container"
    Then el background-color del elemento con clase Tailwind debe ser "#1e2023"
    When se renderiza un elemento con la clase "bg-surface-container-high"
    Then el background-color del elemento con clase Tailwind debe ser "#282a2d"
    When se renderiza un elemento con la clase "bg-surface-container-highest"
    Then el background-color del elemento con clase Tailwind debe ser "#333538"
    When se renderiza un elemento con la clase "bg-error-container"
    Then el background-color del elemento con clase Tailwind debe ser "#93000a"

  # ── Scenario 2: Text Color classes ──
  Scenario: Should_GenerateCorrectTextColorClass
    When se renderiza un elemento con la clase "text-on-surface"
    Then el color de texto del elemento con clase Tailwind debe ser "#e2e2e6"
    When se renderiza un elemento con la clase "text-on-surface-variant"
    Then el color de texto del elemento con clase Tailwind debe ser "#b9cbbc"
    When se renderiza un elemento con la clase "text-on-primary-container"
    Then el color de texto del elemento con clase Tailwind debe ser "#007143"
    When se renderiza un elemento con la clase "text-on-secondary-container"
    Then el color de texto del elemento con clase Tailwind debe ser "#b7b8bc"
    When se renderiza un elemento con la clase "text-on-tertiary-container"
    Then el color de texto del elemento con clase Tailwind debe ser "#007231"
    When se renderiza un elemento con la clase "text-on-error-container"
    Then el color de texto del elemento con clase Tailwind debe ser "#ffdad6"
    When se renderiza un elemento con la clase "text-foreground"
    Then el color de texto del elemento con clase Tailwind debe ser "#e2e2e6"

  # ── Scenario 3: Border Color classes ──
  Scenario: Should_GenerateCorrectBorderColorClass
    When se renderiza un elemento con la clase "border-primary-container"
    Then el border-color del elemento con clase Tailwind debe ser "#00ff9d"
    When se renderiza un elemento con la clase "border-ring"
    Then el border-color del elemento con clase Tailwind debe ser "#00ff9d"
    When se renderiza un elemento con la clase "border-outline-variant"
    Then el border-color del elemento con clase Tailwind debe ser "#3b4a3f"
    When se renderiza un elemento con la clase "border-outline"
    Then el border-color del elemento con clase Tailwind debe ser "#849587"

  # ── Scenario 4: Font Family ──
  Scenario: Should_UseCustomFontFamily
    When se renderiza un elemento con la clase "font-sans"
    Then la propiedad "font-family" del elemento con clase Tailwind contiene "Montserrat"
    When se renderiza un elemento con la clase "font-mono"
    Then la propiedad "font-family" del elemento con clase Tailwind contiene "JetBrains Mono"

  # ── Scenario 5: Border Radius ──
  Scenario: Should_UseCustomBorderRadius
    When se renderiza un elemento con la clase "rounded-lg"
    Then el border-radius del elemento con clase Tailwind debe ser "1rem"
    When se renderiza un elemento con la clase "rounded-full"
    Then el border-radius del elemento con clase Tailwind debe ser "9999px"
    When se renderiza un elemento con la clase "rounded-md"
    Then el border-radius del elemento con clase Tailwind debe ser "0.75rem"
    When se renderiza un elemento con la clase "rounded-sm"
    Then el border-radius del elemento con clase Tailwind debe ser "0.25rem"
    When se renderiza un elemento con la clase "rounded-xl"
    Then el border-radius del elemento con clase Tailwind debe ser "1.5rem"

  # ── Scenario 6: Glassmorphism Utilities (Shadows + Backdrop Blur + shadcn/ui compat) ──
  Scenario: Should_GenerateGlassmorphismUtilities
    When se renderiza un elemento con la clase "shadow-level-2"
    Then el box-shadow del elemento con clase Tailwind no debe ser "none"
    And el box-shadow del elemento con clase Tailwind contiene "rgba(0, 0, 0, 0.5)"
    When se renderiza un elemento con la clase "shadow-glow-primary"
    Then el box-shadow del elemento con clase Tailwind contiene el color esmeralda
    When se renderiza un elemento con la clase "shadow-level-3"
    Then el box-shadow del elemento con clase Tailwind contiene el color esmeralda
    When se renderiza un elemento con la clase "backdrop-blur-glass"
    Then el backdrop-filter del elemento con clase Tailwind debe ser "blur(20px)"
    When se renderiza un elemento con la clase "backdrop-blur-glass-modal"
    Then el backdrop-filter del elemento con clase Tailwind debe ser "blur(30px)"
    # shadcn/ui integration: semantic variables
    When se renderiza un elemento con la clase "bg-primary"
    Then el background-color del elemento con clase Tailwind debe ser "#f4fff3"
    When se renderiza un elemento con la clase "text-primary-foreground"
    Then el color de texto del elemento con clase Tailwind debe ser "#007143"
    When se renderiza un elemento con la clase "bg-muted"
    Then el background-color del elemento con clase Tailwind debe ser "#1a1c1f"
