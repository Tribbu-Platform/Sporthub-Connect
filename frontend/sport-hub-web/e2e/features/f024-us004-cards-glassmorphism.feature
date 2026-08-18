Feature: Componentes Base - Cards y Glassmorphism — F024 US-004
  Como desarrollador frontend
  Quiero crear un componente Card con efecto glassmorphism y niveles de elevacion
  Para dar profundidad visual y jerarquia clara a los contenedores

  Background:
    Given el frontend esta iniciado
    And el usuario navega a la pagina de cards

  # ─────────────────────────────────────────────────────────────
  # Scenario 1: Default card renders with glassmorphism (Level 2)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderDefaultGlassmorphismCard_When_NoElevationIsSpecified
    When se inspecciona el elemento de card "[data-testid='card-default']"
    Then el background-color debe ser semi-transparente con opacidad ~0.6
    And debe tener "backdrop-filter" con valor "blur(20px)"
    And el border-color debe ser "#1a1c1f"
    And el border-radius debe ser "1rem"

  # ─────────────────────────────────────────────────────────────
  # Scenario 2: Level 0 elevation (base canvas)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderLevel0Elevation_When_ElevationIsLevel0
    When se inspecciona el elemento de card "[data-testid='card-level-0']"
    Then el background-color debe ser "#0c0e11"
    And no debe tener backdrop-filter
    And el box-shadow es "none" (sin sombra)

  # ─────────────────────────────────────────────────────────────
  # Scenario 3: Level 1 elevation (sidebar/navigation)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderLevel1Elevation_When_ElevationIsLevel1
    When se inspecciona el elemento de card "[data-testid='card-level-1']"
    Then el background-color debe ser "#111317"
    And debe tener box-shadow distinto de "none"
    And no debe tener backdrop-filter

  # ─────────────────────────────────────────────────────────────
  # Scenario 4: Level 2 elevation (standard cards - glassmorphism 60%)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderLevel2Elevation_When_ElevationIsLevel2
    When se inspecciona el elemento de card "[data-testid='card-level-2']"
    Then el background-color debe ser semi-transparente con opacidad ~0.6
    And debe tener "backdrop-filter" con valor "blur(20px)"
    And debe tener box-shadow distinto de "none"
    And el border-color debe ser "#1a1c1f"

  # ─────────────────────────────────────────────────────────────
  # Scenario 5: Level 3 elevation (modals/popovers - glassmorphism 80%)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderLevel3Elevation_When_ElevationIsLevel3
    When se inspecciona el elemento de card "[data-testid='card-level-3']"
    Then el background-color debe ser semi-transparente con opacidad ~0.8
    And debe tener "backdrop-filter" con valor "blur(30px)"
    And debe tener box-shadow distinto de "none"
    And el border-color contiene tint esmeralda

  # ─────────────────────────────────────────────────────────────
  # Scenario 6: Card with header containing title and description
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderCardWithHeader_When_HeaderContentIsProvided
    When se inspecciona el elemento de card "[data-testid='card-with-header']"
    Then existe el sub-elemento "[data-testid='card-header-block']"
    And el CardTitle "[data-testid='card-title']" usa tipografia "headline-sm"
    And el CardContent "[data-testid='card-content-block']" contiene "Contenido principal"

  # ─────────────────────────────────────────────────────────────
  # Scenario 7: Card with optional gradient header
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderCardWithOptionalGradientHeader_When_GradientHeaderIsEnabled
    When se inspecciona el elemento de card "[data-testid='card-gradient-header-block']"
    Then el header tiene gradiente de fondo "card-header-gradient"
    And el gradiente respeta el border-radius

  # ─────────────────────────────────────────────────────────────
  # Scenario 8: Fallback solid background
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderSolidFallback_When_BackdropFilterNotSupported
    When se inspecciona el elemento de card "[data-testid='card-fallback']"
    Then el background-color cubre suficientemente para legibilidad
    And el color de texto es legible sobre el fondo

  # ─────────────────────────────────────────────────────────────
  # Scenario 9: Composability with other components (Buttons, Badges)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_BeComposable_When_UsedWithOtherComponents
    When se inspecciona el elemento de card "[data-testid='card-composite']"
    Then el Card contiene un boton "[data-testid='composite-edit-button']"
    And el Card contiene un badge "[data-testid='composite-badge']"
    And el Card contiene un boton secundario "[data-testid='composite-cancel-button']"
    And el espaciado interno de la card es consistente
