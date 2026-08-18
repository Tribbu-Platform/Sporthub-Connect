Feature: Tipografia y Jerarquia Visual (Montserrat) — F024 US-009
  Como desarrollador frontend
  Quiero cargar Montserrat y crear la escala tipografica completa del design system
  Para que el texto en toda la aplicacion tenga jerarquia visual consistente

  Background:
    Given el frontend esta iniciado
    And el usuario navega a la pagina de tipografia

  # ─────────────────────────────────────────────────────────────
  # Scenario 1: Montserrat font loading
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_LoadMontserratFont_When_ApplicationStarts
    When se carga la pagina de tipografia
    Then la fuente Montserrat debe estar disponible
    And la variable CSS "--font-montserrat" debe estar definida
    And el body debe usar "Montserrat" como font-family principal

  # ─────────────────────────────────────────────────────────────
  # Scenario 2: Display Large (32px / 700 / 1.2 / -0.02em)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderDisplayLgWithCorrectStyles_When_ClassIsUsed
    When se inspecciona el elemento tipografico "[data-testid='el-display-lg']" en viewport desktop
    Then el font-size computado debe ser "32px"
    And el font-weight computado debe ser "700"
    And el line-height computado debe ser "normal"
    And el letter-spacing computado debe ser "-0.02em"

  # ─────────────────────────────────────────────────────────────
  # Scenario 3: Headline Medium (24px / 700 / 1.3)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderHeadlineMd_When_ClassIsUsed
    When se inspecciona el elemento tipografico "[data-testid='el-headline-md']"
    Then el font-size computado debe ser "24px"
    And el font-weight computado debe ser "700"

  # ─────────────────────────────────────────────────────────────
  # Scenario 4: Headline Small (20px / 600 / 1.4)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderHeadlineSm_When_ClassIsUsed
    When se inspecciona el elemento tipografico "[data-testid='el-headline-sm']"
    Then el font-size computado debe ser "20px"
    And el font-weight computado debe ser "600"

  # ─────────────────────────────────────────────────────────────
  # Scenario 5: Body Large (16px / 400 / 1.6)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderBodyLg_When_ClassIsUsed
    When se inspecciona el elemento tipografico "[data-testid='el-body-lg']"
    Then el font-size computado debe ser "16px"
    And el font-weight computado debe ser "400"

  # ─────────────────────────────────────────────────────────────
  # Scenario 6: Body Medium (14px / 400 / 1.5)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderBodyMd_When_ClassIsUsed
    When se inspecciona el elemento tipografico "[data-testid='el-body-md']"
    Then el font-size computado debe ser "14px"
    And el font-weight computado debe ser "400"

  # ─────────────────────────────────────────────────────────────
  # Scenario 7: Label Caps (11px / 700 / 0.1em / uppercase)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderLabelCapsUppercase_When_ClassIsUsed
    When se inspecciona el elemento tipografico "[data-testid='el-label-caps']"
    Then el font-size computado debe ser "11px"
    And el font-weight computado debe ser "700"
    And el letter-spacing computado debe ser "0.1em"
    And el texto debe estar en uppercase segun text-transform uppercase

  # ─────────────────────────────────────────────────────────────
  # Scenario 8: Meta Small (12px / 500 / 1.4)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderMetaSm_When_ClassIsUsed
    When se inspecciona el elemento tipografico "[data-testid='el-meta-sm']"
    Then el font-size computado debe ser "12px"
    And el font-weight computado debe ser "500"

  # ─────────────────────────────────────────────────────────────
  # Scenario 9: Metric (font-weight 700 for numeric data)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_RenderMetricBold_When_ClassIsUsed
    When se inspecciona el elemento tipografico "[data-testid='el-metric']"
    Then el font-weight computado debe ser "700"
    And el font-size computado debe ser "16px"

  # ─────────────────────────────────────────────────────────────
  # Scenario 10: Headlines scale -15% on mobile (< 768px)
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_ScaleHeadlinesDownOnMobile_When_ViewportIsMobile
    Given el viewport es movil menor a 768px
    When se inspecciona el elemento tipografico "[data-testid='el-display-lg']"
    Then el font-size computado debe ser aproximadamente "27.2px"
    When se inspecciona el elemento tipografico "[data-testid='el-headline-md']"
    Then el font-size computado debe ser aproximadamente "20.4px"
    When se inspecciona el elemento tipografico "[data-testid='el-headline-sm']"
    Then el font-size computado debe ser "17px"

  # ─────────────────────────────────────────────────────────────
  # Scenario 11: Body texts do NOT scale on mobile
  # ─────────────────────────────────────────────────────────────
  Scenario: Should_NotScaleBodyTextOnMobile_When_ViewportIsMobile
    Given el viewport es movil menor a 768px
    When se inspecciona el elemento tipografico "[data-testid='el-body-lg']"
    Then el font-size computado debe ser "16px"
    When se inspecciona el elemento tipografico "[data-testid='el-body-md']"
    Then el font-size computado debe ser "14px"
    When se inspecciona el elemento tipografico "[data-testid='el-meta-sm']"
    Then el font-size computado debe ser "12px"
