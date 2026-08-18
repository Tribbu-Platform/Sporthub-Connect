Feature: Layout Principal - Sidebar + Main Content — F024 US-008
  Como desarrollador frontend
  Quiero verificar el layout con sidebar fijo y contenido principal
  Para asegurar que la navegacion sea persistente y el contenido tenga espaciado consistente

  Background:
    Given el frontend está iniciado
    And las APIs del backend están mockeadas

  Scenario: Should_RenderSidebarAt260pxOnDesktop
    Given el viewport es escritorio de 1280x720
    When el usuario navega a la página principal
    Then el sidebar debe ser visible
    And el ancho del sidebar debe ser 260px
    And la altura del sidebar debe ser igual al viewport (100vh)
    And el background-color del sidebar debe ser "#111317"
    And la posicion del sidebar debe ser "fixed"

  Scenario: Should_CollapseSidebarOnMobile
    Given el viewport es mobile de 375x812
    When el usuario navega a la página principal
    Then el sidebar no debe ser visible por defecto
    And el contenido principal debe ocupar el 100% del ancho
    And el padding del contenido principal debe ser 16px

  Scenario: Should_ShowHamburgerMenuOnMobile
    Given el viewport es mobile de 375x812
    When el usuario navega a la página principal
    Then debe aparecer un icono de menu hamburguer
    And el boton hamburguer debe tener el atributo aria-label "Abrir menu"
    And el boton hamburguer debe ser visible

  Scenario: Should_ApplyCorrectMainContentPadding
    Given el viewport es escritorio de 1280x720
    When el usuario navega a la página principal
    Then el margin-left del contenido principal debe ser 260px
    And el padding del contenido principal debe ser 32px

  Scenario: Should_ApplyGutterBetweenModules
    Given el viewport es escritorio de 1280x720
    And el usuario navega a la página principal
    And existen modulos de contenido en el area principal
    When se inspecciona el contenedor principal de contenido
    Then el gap entre modulos debe ser 24px

  Scenario: Should_NotScrollSidebar
    Given el viewport es escritorio de 1280x720
    And el usuario navega a la página principal
    And existe contenido que excede la altura del viewport
    When el usuario hace scroll hacia abajo
    Then el sidebar no debe cambiar su posicion
    And el contenido principal debe desplazarse verticalmente

  Scenario: Should_ScrollMainContent
    Given el viewport es escritorio de 1280x720
    And el usuario navega a la página principal
    And existe contenido que excede la altura del viewport
    When el usuario hace scroll hacia abajo
    Then el contenido principal debe permitir scroll
    And el scroll debe ser fluido
