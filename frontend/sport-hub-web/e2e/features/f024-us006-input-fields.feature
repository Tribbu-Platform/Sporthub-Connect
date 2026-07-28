Feature: Componentes Base - Input Fields — F024 US-006
  Como desarrollador frontend
  Quiero crear un componente Input con el estilo oscuro y glow esmeralda del design system
  Para que los campos de formulario tengan consistencia visual y buena usabilidad

  Background:
    Given el frontend está iniciado
    And el usuario navega a la página de inputs

  # ─────────────────────────────────────────────────────────────
  # Scenario 1: Default state
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderDefaultInput_When_NoSpecialStateIsActive
    When se inspecciona el elemento "[data-testid='input-default']"
    Then el background-color computado debe ser "#0c0e11"
    And el border-color computado debe ser "#3b4a3f"
    And el color computado debe ser "#e2e2e6"
    And el placeholder del elemento "[data-testid='input-default']" debe ser "Email"
    And el border-radius computado debe ser "0.75rem"

  # ─────────────────────────────────────────────────────────────
  # Scenario 2: Focus state (border esmeralda + glow)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_ShowFocusState_When_InputIsFocused
    When se hace focus en el elemento "[data-testid='input-default']"
    Then el border-color computado debe ser "#00ff9d"
    And el box-shadow computado debe contener "rgba(0, 255, 157"
    And el outline computado debe ser "none" o "0px"
    And la transicion "transition" computada debe contener "border-color"
    And el indicador de focus "focus-indicator-default" debe estar visible

  # ─────────────────────────────────────────────────────────────
  # Scenario 3: Error state (red border + red glow)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_ShowErrorState_When_InputIsInvalid
    When se inspecciona el elemento "[data-testid='input-error']"
    Then el border-color computado debe ser "#ffb4ab"
    And el box-shadow computado debe contener "rgba(255, 180, 171"
    And el atributo "aria-invalid" del input debe ser "true"

  # ─────────────────────────────────────────────────────────────
  # Scenario 4: Disabled state
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_ShowDisabledState_When_InputIsDisabled
    When se inspecciona el elemento "[data-testid='input-disabled']"
    Then la opacidad computada debe ser menor que "0.5"
    And el cursor computado debe ser "not-allowed"
    And el atributo "disabled" debe estar presente
    And el elemento "[data-testid='input-disabled']" no debe ser interactuable

  # ─────────────────────────────────────────────────────────────
  # Scenario 5: Placeholder styling
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_StylePlaceholder_When_InputHasPlaceholderText
    When se inspecciona el elemento "[data-testid='input-placeholder']"
    Then el placeholder debe tener color "#b9cbbc" con opacidad reducida
    And el placeholder no debe estar en italica

  # ─────────────────────────────────────────────────────────────
  # Scenario 6: Smooth transitions
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_TransitionSmoothly_When_StateChanges
    When se inspecciona el elemento "[data-testid='input-transition']"
    Then la propiedad "transition" computada debe contener "0.2s"
    And la propiedad "transition-property" computada debe contener "border-color"
    And la propiedad "transition-property" computada debe contener "box-shadow"

  # ─────────────────────────────────────────────────────────────
  # Scenario 7: React Hook Form compatibility
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_BeCompatibleWithReactHookForm_When_UsedInForm
    When se ingresa "x" en el input "[data-testid='input-rhf-email']"
    And se hace click en el boton "[data-testid='btn-rhf-validate']"
    Then el elemento "[data-testid='input-rhf-email']" debe tener el atributo "aria-invalid" igual a "true"
    And el elemento "[data-testid='input-rhf-email-error']" debe estar visible
    And el color computado del elemento "[data-testid='input-rhf-email-error']" debe ser "#ffb4ab"
    When se ingresa "test@example.com" en el input "[data-testid='input-rhf-email']"
    And se hace click en el boton "[data-testid='btn-rhf-validate']"
    Then el elemento "[data-testid='input-rhf-email']" debe tener el atributo "aria-invalid" igual a "false"
    And el mensaje de error "[data-testid='input-rhf-email-error']" no debe estar presente

  # ─────────────────────────────────────────────────────────────
  # Scenario 8: Accessibility (Label association + keyboard)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_BeAccessible_When_UsedWithLabel
    When se inspecciona el elemento "[data-testid='label-a11y']"
    Then el atributo "for" del elemento label debe ser "input-a11y"
    When se inspecciona el elemento "[data-testid='input-a11y']"
    Then el atributo "id" del input debe ser "input-a11y"
    And el input debe ser focusable via teclado
