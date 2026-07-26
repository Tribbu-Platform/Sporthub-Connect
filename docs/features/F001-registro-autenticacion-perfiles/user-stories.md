# User Stories: Registro, Autenticacion y Perfiles de Usuario

> **Feature:** F001
> **Bounded Context:** Identity & Users (Core)
> **Prioridad:** Must Have (MVP v1.0)
> **Fecha:** 2026-07-19
> **Estimación:** 4 semanas
> **Dependencias:** Ninguna (primera feature del proyecto)
> **Stack:** .NET 10 + ASP.NET Core Minimal API + Auth0 + EF Core + PostgreSQL (schema `identity`)

---

## US-001: Registro con Email y Contraseña

**Prioridad:** Must Have

**Descripción:** Como usuario no registrado, quiero crear una cuenta en SportHub Connect usando mi dirección de email y una contraseña segura, para poder acceder a la plataforma y empezar a explorar comunidades deportivas.

**Entidades afectadas:** User (Agregado UserProfile)

**Eventos de dominio:** `UserRegistered` (publicado en RabbitMQ → consumido por Gamification para badge de bienvenida y Notifications para email de verificación)

**Reglas de negocio cubiertas:** BR-001 (Email único), BR-002 (Verificación de email)

**Notas técnicas:**
- La contraseña se almacena hasheada con BCrypt (nunca en texto plano).
- Auth0 se utiliza como Identity Provider externo; el registro crea el usuario tanto en Auth0 como en la base de datos local (schema `identity`).
- El usuario se crea con `IsActive = true` pero `EmailVerified = false`.
- Se genera un token de verificación de email que se envía por correo.

### Criterios de aceptación (Gherkin)

```gherkin
Feature: US-001 - Registro con Email y Contraseña
  Como usuario no registrado
  Quiero crear una cuenta con email y contraseña
  Para acceder a la plataforma y explorar comunidades deportivas

  Scenario: Should_RegisterSuccessfully_When_ValidEmailAndPassword
    Given un email "maria@example.com" que no existe en el sistema
    And una contraseña que cumple los requisitos de seguridad ("Maria2026!Segura")
    When el usuario completa el formulario de registro con esos datos
    Then el sistema crea la cuenta exitosamente
    And se envía un email de verificación a "maria@example.com"
    And el usuario queda autenticado en la plataforma
    And se registra el evento de dominio "UserRegistered"

  Scenario: Should_RejectRegistration_When_EmailAlreadyExists
    Given un email "juan@example.com" que ya está registrado y verificado
    And una contraseña válida
    When el usuario intenta registrarse con "juan@example.com"
    Then el sistema rechaza el registro con el error "El email ya está registrado"
    And no se crea ningún usuario en el sistema

  Scenario: Should_RejectRegistration_When_EmailAlreadyExistsButNotVerified
    Given un email "carlos@example.com" que ya está registrado pero no verificado
    When el usuario intenta registrarse con "carlos@example.com"
    Then el sistema rechaza el registro con el error "El email ya está registrado"
    And se informa al usuario que puede reenviar el email de verificación

  Scenario: Should_RejectRegistration_When_PasswordTooShort
    Given un email nuevo "test@example.com"
    When el usuario intenta registrarse con una contraseña de 5 caracteres ("Abc12")
    Then el sistema rechaza el registro con el error "La contraseña debe tener al menos 8 caracteres"

  Scenario: Should_RejectRegistration_When_PasswordWithoutSpecialChar
    Given un email nuevo "test@example.com"
    When el usuario intenta registrarse con la contraseña "Maria2026" (sin caracter especial)
    Then el sistema rechaza el registro con el error "La contraseña debe contener al menos un carácter especial"

  Scenario: Should_RejectRegistration_When_InvalidEmailFormat
    Given un email con formato inválido "email-invalido"
    When el usuario intenta registrarse
    Then el sistema rechaza el registro con el error "El formato del email no es válido"

  Scenario: Should_RejectRegistration_When_EmptyFields
    Given un formulario de registro vacío
    When el usuario intenta enviar el formulario sin completar campos obligatorios
    Then el sistema muestra errores de validación: "El email es obligatorio" y "La contraseña es obligatoria"
```

---

## US-002: Verificación de Email

**Prioridad:** Must Have

**Descripción:** Como usuario recién registrado, quiero verificar mi dirección de email mediante un enlace seguro enviado a mi correo, para confirmar que soy el propietario del email y poder unirme a comunidades deportivas.

**Entidades afectadas:** User (estado EmailVerified)

**Eventos de dominio:** Ninguno adicional (el `UserRegistered` ya fue publicado)

**Reglas de negocio cubiertas:** BR-002 (Verificación de email - usuario no verificado no puede unirse a comunidades)

**Notas técnicas:**
- Token de verificación con expiración de 24 horas (JWT firmado internamente o token aleatorio almacenado en BD).
- Endpoint `GET /api/identity/verify-email?token={token}`.
- Reenvío de email de verificación permitido cada 60 segundos (rate limiting).
- El usuario no verificado puede iniciar sesión y explorar, pero no unirse a comunidades.

### Criterios de aceptación (Gherkin)

```gherkin
Feature: US-002 - Verificación de Email
  Como usuario registrado con email no verificado
  Quiero verificar mi email mediante un enlace seguro
  Para confirmar mi identidad y poder unirme a comunidades

  Scenario: Should_VerifyEmail_When_ValidToken
    Given un usuario "ana@example.com" recién registrado con email no verificado
    And un token de verificación válido generado durante el registro
    When el usuario hace clic en el enlace de verificación con ese token
    Then el sistema marca el email como verificado
    And el usuario puede iniciar sesión sin restricciones
    And el usuario ahora puede unirse a comunidades

  Scenario: Should_RejectVerification_When_InvalidToken
    Given un usuario registrado con email no verificado
    When el usuario utiliza un token inválido o alterado "token-falso-123"
    Then el sistema muestra el error "El enlace de verificación no es válido"
    And el email permanece sin verificar

  Scenario: Should_RejectVerification_When_TokenExpired
    Given un usuario registrado con email no verificado
    And un token de verificación generado hace 25 horas (expirado)
    When el usuario intenta verificar con ese token expirado
    Then el sistema muestra el error "El enlace de verificación ha expirado"
    And ofrece la opción de reenviar un nuevo email de verificación

  Scenario: Should_ResendVerificationEmail_When_Requested
    Given un usuario "luis@example.com" con email no verificado
    When el usuario solicita reenviar el email de verificación
    Then el sistema genera un nuevo token de verificación
    And envía un nuevo email de verificación a "luis@example.com"
    And el token anterior queda invalidado

  Scenario: Should_LimitResendRate_When_RequestedTooFrequently
    Given un usuario que acaba de solicitar un reenvío de verificación hace 30 segundos
    When el usuario solicita otro reenvío
    Then el sistema rechaza con el error "Debe esperar 60 segundos antes de solicitar otro reenvío"

  Scenario: Should_BlockCommunityJoin_When_EmailNotVerified
    Given un usuario "pedro@example.com" con email no verificado
    When el usuario intenta unirse a una comunidad
    Then el sistema rechaza la acción con el error "Debe verificar su email antes de unirse a una comunidad"
    And el usuario solo puede navegar y explorar comunidades
```

---

## US-003: Inicio de Sesión (Email/Password)

**Prioridad:** Must Have

**Descripción:** Como usuario registrado con email verificado, quiero iniciar sesión en la plataforma utilizando mi email y contraseña, para acceder a mi perfil y a las funcionalidades de la plataforma.

**Entidades afectadas:** User (LastLoginAt)

**Eventos de dominio:** Ninguno

**Reglas de negocio cubiertas:** BR-002 (verificación de email como prerrequisito para funcionalidades completas)

**Notas técnicas:**
- Autenticación delegada a Auth0 (OAuth2 + OIDC).
- El login devuelve un access_token (JWT) y un refresh_token.
- El JWT incluye claims: `sub`, `email`, `email_verified`, `roles`, `name`.
- Rate limiting: máximo 5 intentos fallidos por minuto.
- Bloqueo temporal de cuenta tras 10 intentos fallidos consecutivos (15 minutos).

### Criterios de aceptación (Gherkin)

```gherkin
Feature: US-003 - Inicio de Sesión con Email y Contraseña
  Como usuario registrado
  Quiero iniciar sesión con mi email y contraseña
  Para acceder a mi perfil y funcionalidades de la plataforma

  Scenario: Should_LoginSuccessfully_When_CredentialsAreValid
    Given un usuario "sofia@example.com" registrado y con email verificado
    And la contraseña correcta "Sofia2026!Clave"
    When el usuario inicia sesión con esas credenciales
    Then el sistema autentica al usuario correctamente
    And devuelve un access_token JWT válido
    And devuelve un refresh_token
    And el JWT contiene los claims: sub, email, email_verified, roles, name
    And se actualiza el campo LastLoginAt del usuario

  Scenario: Should_RejectLogin_When_InvalidPassword
    Given un usuario "sofia@example.com" registrado
    When el usuario intenta iniciar sesión con contraseña incorrecta "ClaveIncorrecta1"
    Then el sistema rechaza la autenticación con el error "Email o contraseña incorrectos"
    And no se devuelve ningún token

  Scenario: Should_RejectLogin_When_EmailNotExists
    Given un email "noexiste@example.com" que no está registrado
    When el usuario intenta iniciar sesión con cualquier contraseña
    Then el sistema rechaza con el error "Email o contraseña incorrectos"
    And no se revela si el email existe o no (protección contra enumeración)

  Scenario: Should_TemporarilyBlockAccount_AfterTooManyFailedAttempts
    Given un usuario "carlos@example.com"
    When el usuario falla la autenticación 10 veces consecutivas
    Then la cuenta se bloquea temporalmente por 15 minutos
    And el sistema muestra el error "Demasiados intentos fallidos. Intente nuevamente en 15 minutos"

  Scenario: Should_AllowLogin_After_AccountUnblocked
    Given un usuario "carlos@example.com" con cuenta bloqueada temporalmente
    And han pasado más de 15 minutos desde el bloqueo
    When el usuario intenta iniciar sesión con credenciales correctas
    Then el sistema autentica al usuario correctamente
    And el contador de intentos fallidos se reinicia

  Scenario: Should_RejectLogin_When_AccountDeactivated
    Given un usuario "inactivo@example.com" con cuenta desactivada (IsActive = false)
    When el usuario intenta iniciar sesión con credenciales correctas
    Then el sistema rechaza con el error "Su cuenta ha sido desactivada. Contacte al soporte"
```

---

## US-004: Registro e Inicio de Sesión con OAuth2 (Google, Microsoft, Facebook, Instagram)

**Prioridad:** Must Have

**Descripción:** Como usuario, quiero registrarme e iniciar sesión en SportHub Connect utilizando mi cuenta de Google, Microsoft, Facebook o Instagram, para evitar crear y recordar una contraseña adicional.

**Entidades afectadas:** User (AuthProvider)

**Eventos de dominio:** `UserRegistered` (si es primera vez que el usuario ingresa con OAuth2)

**Reglas de negocio cubiertas:** BR-001 (Email único - incluso entre proveedores)

**Notas técnicas:**
- Implementar flujo Authorization Code + PKCE desde el frontend hacia Auth0.
- Auth0 redirige al callback URL configurado. Facebook e Instagram se configuran como Social Connections en Auth0.
- Si el email del proveedor OAuth2 ya existe como cuenta local, se vincula (merge de cuentas tras autenticación adicional).
- El campo `AuthProvider` en User puede ser: `Email`, `Google`, `Microsoft`, `Facebook`, `Instagram`.
- Instagram usa Basic Display API para obtener email del usuario (requiere permiso `email`). Si Instagram no provee email, se solicita al usuario completarlo manualmente.
- `CreatedAt` se almacena la primera vez que el usuario completa el registro OAuth.

### Criterios de aceptación (Gherkin)

```gherkin
Feature: US-004 - Registro e Inicio de Sesión con OAuth2
  Como usuario
  Quiero registrarme e iniciar sesión usando mi cuenta de Google o Microsoft
  Para acceder a la plataforma sin gestionar una contraseña adicional

  Scenario: Should_RegisterWithGoogle_When_FirstTimeUser
    Given un usuario con email "ana.gomez@gmail.com" que no existe en el sistema
    When el usuario selecciona "Registrarse con Google"
    And autentica exitosamente en Google
    Then el sistema crea una nueva cuenta con AuthProvider = "Google"
    And el email se marca como verificado automáticamente
    And el usuario queda autenticado en la plataforma
    And se redirige al usuario a completar su perfil deportivo

  Scenario: Should_RegisterWithMicrosoft_When_FirstTimeUser
    Given un usuario con email "carlos@outlook.com" que no existe en el sistema
    When el usuario selecciona "Registrarse con Microsoft"
    And autentica exitosamente en Microsoft
    Then el sistema crea una nueva cuenta con AuthProvider = "Microsoft"
    And el email se marca como verificado automáticamente
    And el usuario queda autenticado en la plataforma

  Scenario: Should_LoginWithGoogle_When_ExistingOAuthUser
    Given un usuario "ana.gomez@gmail.com" registrado previamente con Google
    When el usuario selecciona "Iniciar sesión con Google"
    And autentica exitosamente en Google
    Then el sistema autentica al usuario sin crear una cuenta nueva
    And devuelve un access_token JWT válido

  Scenario: Should_RejectOAuth_When_EmailAlreadyExistsWithDifferentProvider
    Given un email "juan@example.com" registrado previamente con Email/Password
    When el usuario intenta registrarse con Google usando "juan@example.com"
    Then el sistema muestra el error "Este email ya está registrado con otro método de inicio de sesión"
    And ofrece la opción de iniciar sesión con email/contraseña o vincular cuentas

  Scenario: Should_LinkOAuthAccount_When_UserAlreadyAuthenticated
    Given un usuario "maria@example.com" autenticado con Email/Password
    When el usuario va a configuración y selecciona "Vincular cuenta de Google"
    And autentica exitosamente en Google con "maria@gmail.com"
    Then el sistema vincula la cuenta de Google al perfil existente
    And el usuario puede iniciar sesión con ambos métodos

  Scenario: Should_RejectOAuth_When_GoogleReturnsInvalidData
    Given un intento de autenticación con Google que devuelve un token inválido
    When el callback OAuth se procesa con un código de autorización inválido
    Then el sistema rechaza la autenticación con el error "Error al autenticar con Google. Intente nuevamente"

  Scenario: Should_RegisterWithFacebook_When_FirstTimeUser
    Given un usuario con email "ana.facebook@example.com" que no existe en el sistema
    When el usuario selecciona "Registrarse con Facebook"
    And autentica exitosamente en Facebook
    Then el sistema crea una nueva cuenta con AuthProvider = "Facebook"
    And el email se marca como verificado automáticamente
    And el usuario queda autenticado en la plataforma
    And se redirige al usuario a completar su perfil deportivo

  Scenario: Should_RegisterWithInstagram_When_FirstTimeUserWithEmail
    Given un usuario con email "foto.insta@example.com" que no existe en el sistema
    When el usuario selecciona "Registrarse con Instagram"
    And autentica exitosamente en Instagram
    And Instagram provee el email del usuario
    Then el sistema crea una nueva cuenta con AuthProvider = "Instagram"
    And el email se marca como verificado automáticamente
    And el usuario queda autenticado en la plataforma

  Scenario: Should_PromptEmail_When_InstagramDoesNotProvideEmail
    Given un usuario que no existe en el sistema
    When el usuario selecciona "Registrarse con Instagram"
    And autentica exitosamente en Instagram
    And Instagram NO provee el email del usuario
    Then el sistema solicita al usuario que ingrese su email manualmente
    And el sistema valida que el email ingresado no exista en el sistema
    And el email se marca como verificado automáticamente
    And el usuario queda autenticado en la plataforma

  Scenario: Should_LoginWithFacebook_When_ExistingOAuthUser
    Given un usuario "ana.facebook@example.com" registrado previamente con Facebook
    When el usuario selecciona "Iniciar sesión con Facebook"
    And autentica exitosamente en Facebook
    Then el sistema autentica al usuario sin crear una cuenta nueva
    And devuelve un access_token JWT válido

  Scenario: Should_RejectOAuth_When_EmailAlreadyExistsWithDifferentProvider_Facebook
    Given un email "juan@example.com" registrado previamente con Google
    When el usuario intenta registrarse con Facebook usando "juan@example.com"
    Then el sistema muestra el error "Este email ya está registrado con otro método de inicio de sesión"
    And ofrece la opción de iniciar sesión con el proveedor original o vincular cuentas

  Scenario: Should_RejectFacebookOAuth_When_FacebookReturnsInvalidToken
    Given un intento de autenticación con Facebook que devuelve un token inválido
    When el callback OAuth se procesa con un código de autorización inválido
    Then el sistema rechaza la autenticación con el error "Error al autenticar con Facebook. Intente nuevamente"
```

---

## US-005: Recuperación de Contraseña

**Prioridad:** Should Have

**Descripción:** Como usuario registrado con email/contraseña que ha olvidado su contraseña, quiero solicitar un enlace de restablecimiento de contraseña, para poder recuperar el acceso a mi cuenta.

**Entidades afectadas:** User

**Eventos de dominio:** Ninguno

**Reglas de negocio cubiertas:** BR-001 (validación de existencia del email)

**Notas técnicas:**
- Endpoint `POST /api/identity/forgot-password` y `POST /api/identity/reset-password`.
- Token de reset con expiración de 1 hora.
- No revelar si el email existe o no (seguridad: siempre mostrar "Si el email existe, recibirás un enlace").
- Rate limiting: máximo 1 solicitud de reset cada 60 segundos por email.

### Criterios de aceptación (Gherkin)

```gherkin
Feature: US-005 - Recuperación de Contraseña
  Como usuario registrado que olvidó su contraseña
  Quiero solicitar un enlace de restablecimiento de contraseña
  Para recuperar el acceso a mi cuenta

  Scenario: Should_SendResetLink_When_EmailExists
    Given un usuario "laura@example.com" registrado con email/contraseña
    When el usuario solicita restablecer su contraseña ingresando "laura@example.com"
    Then el sistema envía un email con un enlace de restablecimiento a "laura@example.com"
    And el enlace contiene un token válido por 1 hora

  Scenario: Should_NotReveal_When_EmailDoesNotExist
    Given un email "noexiste@example.com" no registrado en el sistema
    When el usuario solicita restablecer contraseña para ese email
    Then el sistema muestra el mensaje "Si el email existe, recibirás un enlace de restablecimiento"
    And no se envía ningún correo electrónico
    And no se revela si el email está registrado o no

  Scenario: Should_ResetPassword_When_ValidToken
    Given un usuario con un token de restablecimiento válido y no expirado
    When el usuario ingresa una nueva contraseña "NuevaClave2026!Segura"
    And confirma la nueva contraseña
    Then el sistema actualiza la contraseña del usuario
    And el token de restablecimiento se invalida
    And el usuario puede iniciar sesión con la nueva contraseña

  Scenario: Should_RejectReset_When_TokenExpired
    Given un usuario con un token de restablecimiento generado hace 2 horas (expirado)
    When el usuario intenta restablecer su contraseña con ese token
    Then el sistema muestra el error "El enlace de restablecimiento ha expirado. Solicite uno nuevo"

  Scenario: Should_RejectReset_When_TokenAlreadyUsed
    Given un usuario que ya restableció su contraseña exitosamente con un token
    When el usuario intenta usar el mismo token nuevamente
    Then el sistema muestra el error "Este enlace ya ha sido utilizado"

  Scenario: Should_RejectReset_When_NewPasswordDoesNotMeetPolicy
    Given un usuario con un token de restablecimiento válido
    When el usuario intenta establecer una contraseña débil "12345"
    Then el sistema rechaza con el error "La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y carácter especial"

  Scenario: Should_LimitResetRequests_When_TooFrequent
    Given un usuario "pablo@example.com"
    When el usuario solicita restablecimiento de contraseña 3 veces en menos de 60 segundos
    Then el sistema rechaza la tercera solicitud con el error "Demasiadas solicitudes. Intente nuevamente en 60 segundos"
```

---

## US-006: Creación y Edición de Perfil Deportivo

**Prioridad:** Must Have

**Descripción:** Como usuario autenticado, quiero crear y editar mi perfil deportivo con mi nombre público, foto, biografía y deporte principal, para que otros miembros de la comunidad puedan conocerme.

**Entidades afectadas:** Profile (Agregado SportProfile dentro de UserProfile)

**Value Objects:** PrimarySport (deporte principal)

**Eventos de dominio:** `ProfileUpdated`

**Reglas de negocio cubiertas:** BR-004 (Un perfil por usuario)

**Notas técnicas:**
- El perfil se crea automáticamente al registrarse (con valores por defecto).
- `DisplayName` no puede estar vacío (mínimo 2 caracteres, máximo 50).
- `AvatarUrl` se almacena como URL del CDN (la imagen se sube a Blob Storage).
- `Bio` máximo 500 caracteres.
- `PrimarySport` proviene de un catálogo de deportes del sistema.
- Endpoint: `PUT /api/identity/profile`.

### Criterios de aceptación (Gherkin)

```gherkin
Feature: US-006 - Creación y Edición de Perfil Deportivo
  Como usuario autenticado
  Quiero crear y editar mi perfil deportivo
  Para que otros miembros puedan conocerme en la plataforma

  Scenario: Should_CreateProfileWithDefaults_When_UserRegisters
    Given un usuario "andres@example.com" que acaba de registrarse
    When el usuario accede a la plataforma por primera vez
    Then el sistema crea automáticamente un perfil con valores por defecto
    And el DisplayName se inicializa con la parte local del email ("andres")
    And se solicita al usuario que complete su perfil

  Scenario: Should_UpdateProfile_When_ValidDataProvided
    Given un usuario autenticado "andres@example.com" con perfil existente
    When el usuario actualiza su perfil con DisplayName "Andrés López", Bio "Amante del fútbol y el running", PrimarySport "Fútbol"
    Then el sistema guarda los cambios correctamente
    And el perfil refleja los nuevos valores
    And se registra el evento de dominio "ProfileUpdated"

  Scenario: Should_RejectProfileUpdate_When_DisplayNameTooShort
    Given un usuario autenticado
    When el usuario intenta establecer DisplayName con un solo carácter "A"
    Then el sistema rechaza con el error "El nombre visible debe tener al menos 2 caracteres"

  Scenario: Should_RejectProfileUpdate_When_DisplayNameTooLong
    Given un usuario autenticado
    When el usuario intenta establecer DisplayName con 60 caracteres "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ12345678"
    Then el sistema rechaza con el error "El nombre visible no puede exceder los 50 caracteres"

  Scenario: Should_RejectProfileUpdate_When_BioTooLong
    Given un usuario autenticado
    When el usuario intenta establecer una Bio de 600 caracteres
    Then el sistema rechaza con el error "La biografía no puede exceder los 500 caracteres"

  Scenario: Should_UpdateAvatar_When_ValidImageUploaded
    Given un usuario autenticado
    When el usuario sube una imagen de perfil válida (menos de 5 MB, formato PNG/JPG)
    Then el sistema almacena la imagen en Blob Storage
    And actualiza el AvatarUrl del perfil con la URL del CDN
    And el perfil muestra la nueva imagen

  Scenario: Should_RejectAvatarUpload_When_FileTooLarge
    Given un usuario autenticado
    When el usuario intenta subir una imagen de 10 MB
    Then el sistema rechaza con el error "La imagen no debe superar los 5 MB"

  Scenario: Should_RejectAvatarUpload_When_InvalidFormat
    Given un usuario autenticado
    When el usuario intenta subir un archivo GIF como avatar
    Then el sistema rechaza con el error "Formato no soportado. Use PNG o JPG"

  Scenario: Should_NotCreateDuplicateProfile_When_UserAlreadyHasProfile
    Given un usuario autenticado que ya tiene un perfil deportivo
    When el sistema intenta crear un segundo perfil para el mismo usuario
    Then el sistema rechaza la operación (invariante BR-004: un perfil por usuario)
    And el perfil original permanece intacto
```

---

## US-007: Auto-evaluación de Nivel de Habilidad (SkillLevel)

**Prioridad:** Must Have

**Descripción:** Como usuario, quiero auto-evaluar mi nivel de habilidad deportiva (Principiante, Intermedio, Avanzado, Experto, Profesional) en mi perfil, para que los demás miembros y capitanes puedan ubicarme mejor en equipos y actividades.

**Entidades afectadas:** Profile (SkillLevel value object dentro del agregado UserProfile)

**Value Objects:** SkillLevel (SelfAssessedLevel, AssessedAt)

**Eventos de dominio:** `SkillLevelChanged`

**Reglas de negocio cubiertas:** BR-003 (SkillLevel auto-evaluado - no requiere validación externa)

**Notas técnicas:**
- El cambio de SkillLevel se registra con fecha (`AssessedAt`) para tracking histórico.
- El usuario puede cambiar su SkillLevel las veces que desee (sin restricción de tiempo en MVP).
- Se almacena el nivel actual más reciente; no hay historial persistente en MVP (solo event sourcing opcional futuro).
- Los niveles se tipifican como enum: `Beginner`, `Intermediate`, `Advanced`, `Expert`, `Professional`.

### Criterios de aceptación (Gherkin)

```gherkin
Feature: US-007 - Auto-evaluación de Nivel de Habilidad (SkillLevel)
  Como usuario autenticado
  Quiero auto-evaluar mi nivel de habilidad deportiva
  Para que otros miembros y capitanes puedan ubicarme mejor en actividades

  Scenario: Should_SetSkillLevel_When_FirstTimeEvaluation
    Given un usuario "diego@example.com" sin SkillLevel definido
    When el usuario selecciona nivel "Intermedio" en su perfil
    Then el sistema guarda SkillLevel con valor "Intermediate"
    And se registra la fecha de evaluación (AssessedAt)
    And el perfil muestra el nivel "Intermedio"
    And se publica el evento de dominio "SkillLevelChanged"

  Scenario: Should_UpdateSkillLevel_When_UserReevaluates
    Given un usuario "diego@example.com" con SkillLevel "Intermediate" evaluado hace 3 meses
    When el usuario actualiza su SkillLevel a "Avanzado"
    Then el sistema actualiza el nivel a "Advanced"
    And se actualiza la fecha de evaluación (AssessedAt)
    And se publica el evento de dominio "SkillLevelChanged"

  Scenario: Should_StoreOnlyCurrentLevel_When_MultipleUpdates
    Given un usuario que ha cambiado su SkillLevel 5 veces en el pasado
    When el usuario consulta su perfil
    Then el sistema muestra únicamente el nivel más reciente ("Professional")
    And no se almacena el historial completo de cambios en la misma entidad

  Scenario: Should_AcceptAnySkillLevel_WithoutExternalValidation
    Given un usuario principiante "juan@example.com"
    When el usuario se auto-evalúa como "Profesional"
    Then el sistema acepta la auto-evaluación sin requerir validación externa (BR-003)
    And el perfil muestra "Profesional"
    And no se requiere verificación por parte de ningún coach o admin

  Scenario: Should_IncludeSkillLevel_When_ViewingProfile
    Given un usuario con SkillLevel "Advanced"
    When otro usuario consulta su perfil público
    Then el perfil muestra el nivel de habilidad "Avanzado" junto con la fecha de última evaluación

  Scenario: Should_DisplayAllLevelOptions_When_SelectingSkillLevel
    Given un usuario editando su perfil
    When el usuario accede al selector de nivel de habilidad
    Then el sistema muestra las 5 opciones disponibles: "Principiante", "Intermedio", "Avanzado", "Experto", "Profesional"
```

---

## US-008: Gestión de Roles Globales

**Prioridad:** Must Have

**Descripción:** Como administrador de la plataforma (Super Admin), quiero asignar y gestionar los roles globales de los usuarios (Admin, Player, Captain, Coach), para definir las capacidades generales que cada usuario tiene en la plataforma.

**Entidades afectadas:** UserRole (dentro del agregado UserProfile)

**Eventos de dominio:** `MemberRoleChanged` (en futuras integraciones)

**Reglas de negocio cubiertas:** BR-005 (Roles globales no heredan permisos en comunidades), BR-082 (Auditoría de cambios críticos)

**Notas técnicas:**
- Los roles globales son: `Admin` (super-admin de plataforma), `Player` (jugador regular), `Captain` (capitán), `Coach` (entrenador).
- Por defecto, al registrarse, el usuario obtiene rol `Player`.
- Solo un usuario con rol `Admin` puede cambiar roles globales.
- Los cambios de rol se registran en la tabla de auditoría (`audit.audit_logs`) con timestamp, usuario que realizó el cambio, valor anterior y nuevo valor.
- Los roles globales no confieren permisos dentro de comunidades (BR-005). Los permisos comunitarios se gestionan mediante CommunityRole.

### Criterios de aceptación (Gherkin)

```gherkin
Feature: US-008 - Gestión de Roles Globales
  Como administrador de la plataforma
  Quiero asignar y gestionar roles globales de los usuarios
  Para definir sus capacidades generales en el sistema

  Scenario: Should_AssignPlayerRole_When_UserRegisters
    Given un nuevo usuario "nuevo@example.com"
    When el usuario completa el registro exitosamente
    Then el sistema asigna automáticamente el rol global "Player"
    And el usuario tiene permisos de jugador regular

  Scenario: Should_ChangeUserRole_When_AdminAssignsNewRole
    Given un usuario "carlos@example.com" con rol actual "Player"
    And un administrador autenticado con rol "Admin"
    When el administrador cambia el rol de "carlos@example.com" a "Captain"
    Then el sistema actualiza el rol global a "Captain"
    And se registra en el audit log: quién cambió, desde "Player" a "Captain", cuándo
    And el usuario "carlos@example.com" ahora tiene capacidades de capitán

  Scenario: Should_RejectRoleChange_When_NonAdminUser
    Given un usuario "usuario@example.com" con rol "Player"
    And otro usuario "otro@example.com" también con rol "Player"
    When "otro@example.com" intenta cambiar el rol de "usuario@example.com"
    Then el sistema rechaza con el error "No tiene permisos para gestionar roles globales"

  Scenario: Should_RejectRoleChange_When_InvalidRole
    Given un administrador autenticado
    When el administrador intenta asignar un rol inexistente "SuperStar"
    Then el sistema rechaza con el error "El rol especificado no es válido"
    And los roles válidos son: "Admin", "Player", "Captain", "Coach"

  Scenario: Should_RecordAuditLog_When_RoleChanges
    Given un administrador "admin@example.com"
    When realiza un cambio de rol de "Player" a "Coach" para "deportista@example.com"
    Then el audit log registra:
      | Campo              | Valor                             |
      |-------------------|-----------------------------------|
      | Acción            | "RoleChanged"                     |
      | Actor             | "admin@example.com"               |
      | Usuario afectado  | "deportista@example.com"          |
      | Valor anterior    | "Player"                          |
      | Valor nuevo       | "Coach"                           |
      | Timestamp         | Fecha y hora del cambio           |

  Scenario: Should_NotInheritCommunityPermissions_When_GlobalRoleIsCaptain
    Given un usuario con rol global "Captain"
    And el usuario NO es miembro de la comunidad "Club Deportivo ABC"
    When el usuario intenta realizar acciones de admin en "Club Deportivo ABC"
    Then el sistema rechaza con el error "No es miembro de esta comunidad" (BR-005)
    And el rol global "Captain" no le confiere permisos comunitarios automáticos
```

---

## US-009: Cierre de Sesión

**Prioridad:** Must Have

**Descripción:** Como usuario autenticado, quiero cerrar sesión en la plataforma, para asegurarme de que nadie más pueda acceder a mi cuenta desde el mismo dispositivo.

**Entidades afectadas:** User (indirectamente, via invalidación de tokens)

**Eventos de dominio:** Ninguno

**Notas técnicas:**
- El cierre de sesión invalida el refresh_token almacenado en el servidor (si se usa almacenamiento de tokens).
- El access_token JWT continúa siendo válido hasta su expiración natural (por diseño, stateless JWT).
- Si se usa blacklist de tokens, se almacena el `jti` (JWT ID) en Redis hasta la expiración del token.
- Opcional: cierre de sesión en todos los dispositivos.

### Criterios de aceptación (Gherkin)

```gherkin
Feature: US-009 - Cierre de Sesión
  Como usuario autenticado
  Quiero cerrar sesión en la plataforma
  Para proteger mi cuenta en dispositivos compartidos

  Scenario: Should_LogoutSuccessfully_When_UserLogsOut
    Given un usuario autenticado "andrea@example.com" con una sesión activa
    When el usuario hace clic en "Cerrar sesión"
    Then el sistema invalida el refresh_token de la sesión actual
    And el usuario es redirigido a la página de inicio de sesión
    And el usuario ya no puede acceder a recursos protegidos con el access_token actual

  Scenario: Should_InvalidateRefreshToken_AfterLogout
    Given un usuario autenticado con un refresh_token válido
    When el usuario cierra sesión
    Then el refresh_token se marca como invalidado en el servidor
    And el usuario no puede renovar el access_token usando ese refresh_token

  Scenario: Should_AllowLogoutFromAllDevices
    Given un usuario autenticado en 3 dispositivos diferentes (móvil, web, tablet)
    When el usuario selecciona "Cerrar sesión en todos los dispositivos"
    Then todos los refresh_token activos del usuario se invalidan
    And el usuario debe iniciar sesión nuevamente en todos los dispositivos

  Scenario: Should_KeepOtherSessionsActive_When_LogoutFromSingleDevice
    Given un usuario autenticado en 2 dispositivos (PC y móvil)
    When el usuario cierra sesión desde el PC
    Then la sesión del móvil permanece activa
    And el usuario puede seguir usando la plataforma desde el móvil sin problemas

  Scenario: Should_RedirectToLogin_When_AccessingProtectedResourceAfterLogout
    Given un usuario que acaba de cerrar sesión
    When el usuario intenta acceder a un endpoint protegido (ej. perfil)
    Then el sistema devuelve HTTP 401 Unauthorized
    And redirige al usuario a la página de inicio de sesión
```

---

## US-010: Eliminación de Cuenta y Anonimización de Datos

**Prioridad:** Should Have

**Descripción:** Como usuario, quiero eliminar mi cuenta de la plataforma, para ejercer mi derecho al olvido (GDPR). Mis datos personales deben ser eliminados y mis datos públicos deben ser anonimizados para no afectar estadísticas de la comunidad.

**Entidades afectadas:** User (IsActive = false, datos anonimizados), Profile (datos personales eliminados)

**Value Objects:** ContactInfo, Address (eliminados)

**Eventos de dominio:** `UserDeactivated`

**Reglas de negocio cubiertas:** BR-081 (Marcado de eliminación - anonimización), BR-082 (Auditoría de cambios críticos)

**Notas técnicas:**
- Flujo: el usuario solicita eliminación → confirmación por email → período de gracia de 7 días → eliminación definitiva.
- Durante el período de gracia, el usuario puede cancelar la eliminación reactivando la cuenta.
- Post-eliminación: `DisplayName` → "Usuario Eliminado", email → hash irreversible, `IsActive` → false.
- Se preservan agregados anónimos (asistencias, XP histórico) para no romper leaderboards.
- Datos personales eliminados: email (reemplazado por hash), teléfono, dirección, avatar.
- Audit log: se registra la solicitud de eliminación y su ejecución.

### Criterios de aceptación (Gherkin)

```gherkin
Feature: US-010 - Eliminación de Cuenta y Anonimización de Datos
  Como usuario registrado
  Quiero eliminar mi cuenta y que mis datos personales sean anonimizados
  Para ejercer mi derecho al olvido según la legislación aplicable

  Scenario: Should_InitiateDeletion_When_UserRequestsAccountDeletion
    Given un usuario autenticado "maria@example.com"
    When el usuario solicita la eliminación de su cuenta desde configuración
    Then el sistema envía un email de confirmación a "maria@example.com"
    And la cuenta se marca para eliminación con un período de gracia de 7 días
    And se registra en audit log: "Solicitud de eliminación de cuenta"

  Scenario: Should_ConfirmDeletion_When_UserConfirmsViaEmail
    Given un usuario "maria@example.com" con solicitud de eliminación pendiente
    When el usuario hace clic en el enlace de confirmación enviado por email
    Then el sistema inicia el período de gracia de 7 días
    And el usuario puede cancelar la eliminación dentro de ese período
    And el usuario recibe una notificación: "Su cuenta será eliminada el {fecha+7días}"

  Scenario: Should_AnonymizeAccount_After_GracePeriod
    Given un usuario "carlos@example.com" que solicitó eliminación hace 7 días
    When se cumple el período de gracia sin cancelación
    Then el sistema ejecuta la anonimización definitiva:
      | Campo          | Acción                                    |
      |---------------|-------------------------------------------|
      | DisplayName   | → "Usuario Eliminado"                     |
      | Email         | → Hash irreversible del email original    |
      | AvatarUrl     | → Eliminado (null)                        |
      | Bio           | → Eliminado (null)                        |
      | ContactInfo   | → Eliminado                               |
      | Address       | → Eliminado                               |
      | IsActive      | → false                                   |
    And se preservan los registros anónimos de XP, asistencias e insignias (BR-081)
    And se actualiza el audit log con "Cuenta anonimizada"

  Scenario: Should_CancelDeletion_When_UserReactivatesDuringGracePeriod
    Given un usuario "ana@example.com" en período de gracia (día 3 de 7)
    When el usuario inicia sesión y cancela la solicitud de eliminación
    Then el sistema restaura la cuenta a su estado normal
    And la cuenta permanece activa con todos sus datos intactos
    And se registra en audit log: "Cancelación de solicitud de eliminación"

  Scenario: Should_PreserveAggregatedData_When_AccountAnonymized
    Given una comunidad donde "deportista@example.com" tenía 15 asistencias, 2500 XP y 3 insignias
    When la cuenta de "deportista@example.com" es anonimizada
    Then el leaderboard de la comunidad aún muestra 15 asistencias y 2500 XP (como datos anónimos)
    And el display name en el leaderboard aparece como "Usuario Eliminado"
    And las insignias ganadas aún son visibles pero sin enlace al perfil del usuario

  Scenario: Should_RejectLogin_When_AccountAnonymized
    Given un usuario cuya cuenta fue anonimizada hace 1 mes
    When el usuario intenta iniciar sesión
    Then el sistema rechaza con el error "Esta cuenta ha sido eliminada"
    And el usuario puede registrarse nuevamente con el mismo email (crear cuenta nueva)

  Scenario: Should_NotAffectOtherCommunityMembers_When_UserAnonymized
    Given un usuario "luis@example.com" miembro de la comunidad "Club Deportivo ABC"
    And el usuario "luis@example.com" es también amigo de "pedro@example.com" en la comunidad
    When la cuenta de "luis@example.com" es anonimizada
    Then "pedro@example.com" aún puede ver que "Usuario Eliminado" fue miembro de la comunidad
    And los registros de eventos a los que asistió "Usuario Eliminado" se mantienen
```

---

## Resumen de User Stories

| ID | Título | Prioridad | Reglas de Negocio | Eventos de Dominio |
|----|--------|-----------|-------------------|-------------------|
| US-001 | Registro con Email y Contraseña | Must Have | BR-001, BR-002 | UserRegistered |
| US-002 | Verificación de Email | Must Have | BR-002 | — |
| US-003 | Inicio de Sesión (Email/Password) | Must Have | BR-002 | — |
| US-004 | Registro con OAuth2 (Google, Microsoft, Facebook, Instagram) | Must Have | BR-001 | UserRegistered |
| US-005 | Recuperación de Contraseña | Should Have | BR-001 | — |
| US-006 | Creación y Edición de Perfil Deportivo | Must Have | BR-004 | ProfileUpdated |
| US-007 | Auto-evaluación de SkillLevel | Must Have | BR-003 | SkillLevelChanged |
| US-008 | Gestión de Roles Globales | Must Have | BR-005, BR-082 | MemberRoleChanged |
| US-009 | Cierre de Sesión | Must Have | — | — |
| US-010 | Eliminación de Cuenta / Anonimización | Should Have | BR-081, BR-082 | UserDeactivated |

---

## Mapeo a Bounded Context

Todas las historias de usuario de esta feature pertenecen al Bounded Context **Identity & Users** (Core).

| Historia | Entidades / Value Objects | Repositorios |
|----------|--------------------------|--------------|
| US-001 | User | IUserRepository |
| US-002 | User | IUserRepository |
| US-003 | User | IUserRepository |
| US-004 | User | IUserRepository |
| US-005 | User | IUserRepository |
| US-006 | Profile, UserProfile (Agregado) | IProfileRepository, IUserRepository |
| US-007 | SkillLevel (Value Object), Profile | IProfileRepository |
| US-008 | UserRole, UserProfile (Agregado) | IUserRepository |
| US-009 | User (sesiones/tokens) | — (Auth0 / Redis) |
| US-010 | User, Profile, ContactInfo, Address | IUserRepository, IProfileRepository |
