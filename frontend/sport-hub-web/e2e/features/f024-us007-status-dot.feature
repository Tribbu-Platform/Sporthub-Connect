@f024-us007
Feature: Componentes Base - Status Indicators — F024 US-007
  Como desarrollador frontend
  Quiero crear un componente StatusDot con efecto LED glowing
  Para mostrar estados en tiempo real de forma visualmente impactante

  Background:
    Given el frontend esta iniciado
    And el usuario navega a la pagina de status dot

  # ─────────────────────────────────────────────────────────────
  # Scenario 1: Active variant (esmeralda #00ff9d)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderActiveStatusDot_When_VariantIsActive
    When se inspecciona el status dot "[data-testid='status-dot-active'][data-size='default']"
    Then el background-color debe ser el color esmeralda "#00ff9d"
    And el box-shadow debe contener el color esmeralda "#00ff9d"
    And el border-radius debe ser "9999px" (circulo perfecto)
    And el diametro debe ser "8px"

  # ─────────────────────────────────────────────────────────────
  # Scenario 2: Pending variant (amarillo #eab308)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderPendingStatusDot_When_VariantIsPending
    When se inspecciona el status dot "[data-testid='status-dot-pending']"
    Then el background-color debe ser el color amarillo "#eab308"
    And el box-shadow debe contener el color amarillo "#eab308"

  # ─────────────────────────────────────────────────────────────
  # Scenario 3: Error variant (rojo #ffb4ab)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderErrorStatusDot_When_VariantIsError
    When se inspecciona el status dot "[data-testid='status-dot-error']"
    Then el background-color debe ser el color rojo "#ffb4ab"
    And el box-shadow debe contener el color rojo "#ffb4ab"

  # ─────────────────────────────────────────────────────────────
  # Scenario 4: Inactive variant (gris #849587)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderInactiveStatusDot_When_VariantIsInactive
    When se inspecciona el status dot "[data-testid='status-dot-inactive']"
    Then el background-color debe ser el color gris "#849587"
    And el box-shadow debe contener el color gris "#849587"

  # ─────────────────────────────────────────────────────────────
  # Scenario 5: Small size (6px)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderSmallStatusDot_When_SizeIsSm
    When se inspecciona el status dot "[data-testid='status-dot-active'][data-size='sm']"
    Then el diametro debe ser "6px"

  # ─────────────────────────────────────────────────────────────
  # Scenario 6: Large size (12px)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderLargeStatusDot_When_SizeIsLg
    When se inspecciona el status dot "[data-testid='status-dot-active'][data-size='lg']"
    Then el diametro debe ser "12px"

  # ─────────────────────────────────────────────────────────────
  # Scenario 7: Tooltip on hover
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_ShowTooltip_When_TooltipTextIsProvided
    When se inspecciona el status dot "[data-testid='section-tooltip'] [data-testid='status-dot-active']"
    Then el title del status dot debe ser "En linea"

  # ─────────────────────────────────────────────────────────────
  # Scenario 8: Pulsing animation
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_AnimatePulse_When_PulsingPropIsEnabled
    When se inspecciona el status dot "[data-testid='status-dot-active'][data-pulsing='true']"
    Then debe tener una animacion CSS aplicada
    And la animacion debe ser "status-dot-pulse"

  # ─────────────────────────────────────────────────────────────
  # Scenario 9: Accessibility
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_BeAccessible_When_RenderedWithoutTooltip
    When se inspecciona el status dot "[data-testid='status-dot-active'][data-size='default']"
    Then debe tener role "status"
    And debe tener un atributo "aria-label" definido
