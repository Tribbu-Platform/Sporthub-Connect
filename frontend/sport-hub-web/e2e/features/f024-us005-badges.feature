@f024-us005
Feature: Componentes Base - Badges de Roles y Estados — F024 US-005
  Como desarrollador frontend
  Quiero crear un componente Badge para roles y estados
  Para mostrar etiquetas visuales consistentes con el estilo glass-tag

  Background:
    Given el frontend está iniciado
    And el usuario navega a la página de badges

  # ── Scenario 1: Owner Badge ──
  Scenario: Should_RenderOwnerBadge_When_VariantIsOwner
    When se inspecciona el badge con data-testid "badge-owner"
    Then el texto del badge debe ser "Owner"
    And el border-radius del badge debe ser "9999px"
    And el fondo del badge debe ser semitransparente (con alpha)
    And el color de texto del badge debe ser diferente del fondo
    And el padding horizontal del badge debe ser al menos 12px
    And el rol ARIA del badge debe ser "status"

  # ── Scenario 2: Captain Badge ──
  Scenario: Should_RenderCaptainBadge_When_VariantIsCaptain
    When se inspecciona el badge con data-testid "badge-captain"
    Then el texto del badge debe ser "Captain"
    And el border-radius del badge debe ser "9999px"
    And el fondo del badge debe ser semitransparente (con alpha)
    And el color de texto del badge debe ser diferente del fondo

  # ── Scenario 3: Coach Badge ──
  Scenario: Should_RenderCoachBadge_When_VariantIsCoach
    When se inspecciona el badge con data-testid "badge-coach"
    Then el texto del badge debe ser "Coach"
    And el border-radius del badge debe ser "9999px"
    And el fondo del badge debe ser semitransparente (con alpha)
    And el color de texto del badge debe ser diferente del fondo

  # ── Scenario 4: Member Badge ──
  Scenario: Should_RenderMemberBadge_When_VariantIsMember
    When se inspecciona el badge con data-testid "badge-member"
    Then el texto del badge debe ser "Member"
    And el border-radius del badge debe ser "9999px"
    And el fondo del badge debe ser semitransparente (con alpha)
    And el color de texto del badge debe ser diferente del fondo

  # ── Scenario 5: Success Badge ──
  Scenario: Should_RenderSuccessBadge_When_VariantIsSuccess
    When se inspecciona el badge con data-testid "badge-success"
    Then el texto del badge debe ser "Activo"
    And el border-radius del badge debe ser "9999px"
    And el fondo del badge debe ser semitransparente (con alpha)
    And el color de texto del badge debe ser diferente del fondo

  # ── Scenario 6: Warning Badge ──
  Scenario: Should_RenderWarningBadge_When_VariantIsWarning
    When se inspecciona el badge con data-testid "badge-warning"
    Then el texto del badge debe ser "Pendiente"
    And el border-radius del badge debe ser "9999px"
    And el fondo del badge debe ser semitransparente (con alpha)
    And el color de texto del badge debe ser diferente del fondo

  # ── Scenario 7: Error Badge ──
  Scenario: Should_RenderErrorBadge_When_VariantIsError
    When se inspecciona el badge con data-testid "badge-error"
    Then el texto del badge debe ser "Error"
    And el border-radius del badge debe ser "9999px"
    And el fondo del badge debe ser semitransparente (con alpha)
    And el color de texto del badge debe ser diferente del fondo

  # ── Scenario 8: Info Badge ──
  Scenario: Should_RenderInfoBadge_When_VariantIsInfo
    When se inspecciona el badge con data-testid "badge-info"
    Then el texto del badge debe ser "Información"
    And el border-radius del badge debe ser "9999px"
    And el fondo del badge debe ser semitransparente (con alpha)
    And el color de texto del badge debe ser diferente del fondo

  # ── Scenario 9: Size variants ──
  Scenario: Should_SupportDifferentSizes_When_SizePropIsProvided
    When se inspecciona el badge con data-testid "badge-size-sm"
    Then el font-size del badge debe ser menor que el badge "badge-size-default"
    And el padding del badge debe ser menor que el badge "badge-size-default"
    When se inspecciona el badge con data-testid "badge-size-lg"
    Then el font-size del badge debe ser mayor que el badge "badge-size-default"
    And el padding del badge debe ser mayor que el badge "badge-size-default"

  # ── Scenario 10: Accessibility ──
  Scenario: Should_BeAccessible_When_RenderedWithScreenReader
    When se inspecciona el badge con data-testid "badge-success"
    Then el badge debe tener un rol ARIA semántico
    And el texto del badge debe ser "Activo"
    And el badge debe ser visible para lectores de pantalla
