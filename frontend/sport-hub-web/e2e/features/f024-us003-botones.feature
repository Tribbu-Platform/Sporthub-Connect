@f024-us003
Feature: Componentes Base - Botones — F024 US-003
  Como desarrollador frontend
  Quiero crear componentes de boton con las variantes del design system
  Para que todas las interacciones del usuario tengan consistencia visual

  Background:
    Given el frontend esta iniciado con los design tokens y Tailwind CSS activos

  # ── Scenario 1: Primary Button Rendering ──
  Scenario: Should_RenderPrimaryButton_When_VariantIsPrimary
    When se renderiza un boton con variante "primary" y texto "Guardar"
    Then el background-color del boton debe ser "#00ff9d"
    And el color de texto del boton debe ser "#007143"
    And el font-weight del boton debe ser "700"
    And el border-radius del boton debe ser "12px"
    And el border-width del boton debe ser "0px"

  # ── Scenario 2: Primary Button Hover State ──
  Scenario: Should_ShowHoverState_When_PrimaryButtonIsHovered
    Given se renderiza un boton con variante "primary" y texto "Guardar"
    When el cursor se posiciona sobre el boton
    Then el box-shadow del boton no debe ser "none"
    And el box-shadow del boton contiene el color esmeralda

  # ── Scenario 3: Primary Button Focus State ──
  Scenario: Should_ShowFocusState_When_PrimaryButtonIsFocused
    Given se renderiza un boton con variante "primary" y texto "Guardar"
    When el boton recibe focus via teclado
    Then el boton debe mostrar un outline-ring visible

  # ── Scenario 4: Primary Button Active State ──
  Scenario: Should_ShowActiveState_When_PrimaryButtonIsPressed
    Given se renderiza un boton con variante "primary" y texto "Guardar"
    When el boton es presionado
    Then la transformacion del boton debe contener "scale"

  # ── Scenario 5: Primary Button Disabled State ──
  Scenario: Should_RenderDisabledState_When_PrimaryButtonIsDisabled
    When se renderiza un boton con variante "primary" deshabilitado y texto "Guardar"
    Then la opacidad del boton debe ser "0.4"
    And el cursor del boton debe ser "not-allowed"
    And el boton debe tener el atributo "disabled"
    And el boton no debe responder a eventos de click

  # ── Scenario 6: Secondary Button Rendering ──
  Scenario: Should_RenderSecondaryButton_When_VariantIsSecondary
    When se renderiza un boton con variante "secondary" y texto "Cancelar"
    Then el background-color del boton debe ser "transparent"
    And el border-color del boton debe ser "#00ff9d"
    And el border-width del boton debe ser "1px"
    And el border-style del boton debe ser "solid"
    And el color de texto del boton debe ser "#00ff9d"
    And el font-weight del boton debe ser "600"

  # ── Scenario 7: Secondary Button Hover State ──
  Scenario: Should_ShowHoverState_When_SecondaryButtonIsHovered
    Given se renderiza un boton con variante "secondary" y texto "Cancelar"
    When el cursor se posiciona sobre el boton
    Then el background-color del boton no debe ser "transparent"
    And el background-color del boton debe contener esmeralda con opacidad

  # ── Scenario 8: Icon Button Rendering ──
  Scenario: Should_RenderIconButton_When_VariantIsIcon
    When se renderiza un boton con variante "icon" y tamano "icon"
    Then el ancho y alto del boton deben ser iguales
    And el border-radius del boton debe ser "9999px"
    And el background-color del boton debe ser "transparent"
    And el boton no debe tener texto visible

  # ── Scenario 9: Icon Button Hover State ──
  Scenario: Should_ShowHoverState_When_IconButtonIsHovered
    Given se renderiza un boton con variante "icon" y tamano "icon"
    When el cursor se posiciona sobre el boton
    Then el background-color del boton no debe ser "transparent"
    And el background-color del boton debe contener esmeralda con opacidad

  # ── Scenario 10: All Button Sizes ──
  Scenario: Should_SupportAllButtonSizes_When_SizePropIsProvided
    When se renderiza un boton con variante "primary" y tamano "sm"
    Then la altura del boton debe ser "32px"
    When se renderiza un boton con variante "primary" y tamano "default"
    Then la altura del boton debe ser "40px"
    When se renderiza un boton con variante "primary" y tamano "lg"
    Then la altura del boton debe ser "48px"
