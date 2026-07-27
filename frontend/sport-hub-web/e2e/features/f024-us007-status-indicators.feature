Feature: Componentes Base - Status Indicators — F024 US-007
  Como desarrollador frontend
  Quiero crear un componente StatusDot con efecto LED glowing
  Para mostrar estados en tiempo real de forma visualmente impactante

  Background:
    Given el frontend esta iniciado
    And el usuario navega a la pagina de status indicators

  # ─────────────────────────────────────────────────────────────
  # Scenario 1: Active variant (esmeralda #00ff9d)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderActiveStatusDot_When_VariantIsActive
    When se inspecciona el elemento "[data-testid='dot-active']"
    Then el background-color computado debe ser "rgb(0, 255, 157)"
    And el box-shadow computado debe contener "rgba(0, 255, 157, 0.5)"
    And el border-radius computado debe ser "9999px"
    And el width computado debe ser "8px"
    And el height computado debe ser "8px"

  # ─────────────────────────────────────────────────────────────
  # Scenario 2: Pending variant (ambar #eab308)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderPendingStatusDot_When_VariantIsPending
    When se inspecciona el elemento "[data-testid='dot-pending']"
    Then el background-color computado debe ser "rgb(234, 179, 8)"
    And el box-shadow computado debe contener "rgba(234, 179, 8, 0.5)"

  # ─────────────────────────────────────────────────────────────
  # Scenario 3: Error variant (rojo #ffb4ab)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderErrorStatusDot_When_VariantIsError
    When se inspecciona el elemento "[data-testid='dot-error']"
    Then el background-color computado debe ser "rgb(255, 180, 171)"
    And el box-shadow computado debe contener "rgba(255, 180, 171, 0.5)"

  # ─────────────────────────────────────────────────────────────
  # Scenario 4: Inactive variant (gris #849587)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderInactiveStatusDot_When_VariantIsInactive
    When se inspecciona el elemento "[data-testid='dot-inactive']"
    Then el background-color computado debe ser "rgb(132, 149, 135)"
    And el box-shadow computado debe contener "rgba(132, 149, 135, 0.5)"

  # ─────────────────────────────────────────────────────────────
  # Scenario 5: Small size (6px)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderSmallStatusDot_When_SizeIsSm
    When se inspecciona el elemento "[data-testid='dot-size-sm']"
    Then el width computado debe ser "6px"
    And el height computado debe ser "6px"

  # ─────────────────────────────────────────────────────────────
  # Scenario 6: Large size (12px)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderLargeStatusDot_When_SizeIsLg
    When se inspecciona el elemento "[data-testid='dot-size-lg']"
    Then el width computado debe ser "12px"
    And el height computado debe ser "12px"

  # ─────────────────────────────────────────────────────────────
  # Scenario 7: Tooltip (title attribute)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_ShowTooltip_When_TooltipTextIsProvided
    When se inspecciona el elemento "[data-testid='dot-tooltip']"
    Then el atributo "title" debe ser "En linea"
    And el atributo "aria-label" debe ser "En linea"

  # ─────────────────────────────────────────────────────────────
  # Scenario 8: Pulsing animation
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_AnimatePulse_When_PulsingPropIsEnabled
    When se inspecciona el elemento "[data-testid='dot-pulsing']"
    Then la clase CSS "animate-pulse" debe estar presente

  # ─────────────────────────────────────────────────────────────
  # Scenario 9: Accessibility (role="status", aria-label)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_BeAccessible_When_RenderedWithoutTooltip
    When se inspecciona el elemento "[data-testid='dot-a11y-active']"
    Then el atributo "role" debe ser "status"
    And el atributo "aria-label" debe ser "Active"
