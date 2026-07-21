Feature: US-001 - Registro con Email y Contrasena
  Como usuario no registrado
  Quiero crear una cuenta con email y contrasena
  Para acceder a la plataforma y explorar comunidades deportivas

  Background:
    Given el usuario navega a la pagina de registro

  Scenario: Should_RegisterSuccessfully_When_ValidEmailAndPassword
    Given un email "maria@example.com" que no existe en el sistema
    And una contrasena que cumple requisitos de seguridad: "Maria2026!Segura"
    And el usuario acepta los terminos y condiciones
    When el usuario completa el formulario de registro con esos datos
    Then el sistema crea la cuenta exitosamente
    And se envia un email de verificacion a "maria@example.com"
    And el usuario queda autenticado en la plataforma
    And se registra el evento de dominio "UserRegistered"

  Scenario: Should_RejectRegistration_When_EmailAlreadyExists
    Given un email "juan@example.com" que ya esta registrado y verificado
    And una contrasena valida
    And el usuario acepta los terminos y condiciones
    When el usuario intenta registrarse con "juan@example.com"
    Then el sistema rechaza el registro con el error "El email ya esta registrado"
    And no se crea ningun usuario en el sistema

  Scenario: Should_RejectRegistration_When_EmailAlreadyExistsButNotVerified
    Given un email "carlos@example.com" que ya esta registrado pero no verificado
    And una contrasena valida
    And el usuario acepta los terminos y condiciones
    When el usuario intenta registrarse con "carlos@example.com"
    Then el sistema rechaza el registro con el error "El email ya esta registrado"
    And no se crea ningun usuario en el sistema

  Scenario: Should_RejectRegistration_When_PasswordTooShort
    Given un email nuevo "test@example.com"
    And el usuario acepta los terminos y condiciones
    When el usuario intenta registrarse con contrasena corta: "Abc12"
    Then el sistema rechaza el registro con el error "La contraseña debe tener al menos 8 caracteres"

  Scenario: Should_RejectRegistration_When_PasswordWithoutSpecialChar
    Given un email nuevo "test@example.com"
    And el usuario acepta los terminos y condiciones
    When el usuario intenta registrarse con contrasena sin especial: "Maria2026"
    Then el sistema rechaza el registro con el error "Debe contener al menos un carácter especial"

  Scenario: Should_RejectRegistration_When_InvalidEmailFormat
    Given un email con formato invalido "email-invalido"
    And una contrasena valida
    And el usuario acepta los terminos y condiciones
    When el usuario intenta registrarse
    Then el sistema rechaza el registro con el error "Ingresa un email válido"

  Scenario: Should_RejectRegistration_When_EmptyFields
    Given un formulario de registro vacio
    And el usuario acepta los terminos y condiciones
    When el usuario intenta enviar el formulario sin completar campos obligatorios
    Then el sistema muestra errores de validacion: "Ingresa un email válido" y "La contraseña debe tener al menos 8 caracteres"
