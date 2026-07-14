# Reglas de Negocio — SportHub Connect

> Las reglas de negocio se expresan como **invariantes** (verdades que siempre deben cumplirse) y **restricciones** (condiciones que limitan operaciones).
> Las reglas catalogadas aqui pertenecen a los bounded contexts del dominio. Cada regla debe ser verificable y testeable.

---

## 1. Identity & Users

| ID | Regla | Tipo | Descripcion | Contexto |
|----|-------|------|-------------|----------|
| BR-001 | Email unico | Invariante | No pueden existir dos usuarios con el mismo email verificado. | Identity |
| BR-002 | Verificacion de email | Restriccion | Un usuario con email no verificado no puede unirse a comunidades (solo puede explorar). | Identity |
| BR-003 | SkillLevel auto-evaluado | Invariante | El nivel de habilidad es auto-declarado por el usuario y no validado externamente (hasta que exista verificacion por coach en Premium). | Identity |
| BR-004 | Un perfil por usuario | Invariante | Cada usuario tiene exactamente un Profile deportivo. | Identity |
| BR-005 | Roles globales | Restriccion | Los roles globales (Admin, Player, Captain, Coach) no heredan permisos en comunidades. Los permisos comunitarios se definen por CommunityRole. | Identity |

## 2. Community Management

| ID | Regla | Tipo | Descripcion | Contexto |
|----|-------|------|-------------|----------|
| BR-010 | Unicidad de nombre de comunidad | Invariante | No pueden existir dos comunidades con el mismo Slug en la plataforma. | Community |
| BR-011 | Creador es Owner | Invariante | El usuario que crea una comunidad automaticamente recibe el rol Owner y una membresia activa. | Community |
| BR-012 | Owner unico por comunidad | Invariante | Una comunidad tiene exactamente un Owner. La propiedad puede transferirse, pero siempre debe existir un Owner. | Community |
| BR-013 | Membresia unica activa | Invariante | Un usuario solo puede tener UNA membresia activa por comunidad. Si intenta unirse a una comunidad donde ya tiene membresia inactiva, esta se reactiva. | Community |
| BR-014 | Maximo de miembros Free | Restriccion | Comunidades en plan Free tienen un maximo de 50 miembros. Para superar este limite, deben actualizar a Pro o Enterprise. | Community, Payments |
| BR-015 | Aprobacion de membresia | Restriccion | Si la comunidad tiene configurada la opcion "Requiere Aprobacion", un Admin/Owner debe aprobar manualmente cada nuevo miembro. Si no, el join es automatico. | Community |
| BR-016 | Salida voluntaria | Restriccion | Un miembro puede abandonar una comunidad voluntariamente excepto el Owner (debe transferir propiedad antes). | Community |
| BR-017 | Sub-grupos heredan comunidad | Invariante | Cada SubGroup pertenece a una unica comunidad. Sus miembros deben ser miembros activos de la comunidad padre. | Community |
| BR-018 | Maximo de sub-grupos | Restriccion | Plan Free: maximo 3 sub-grupos. Plan Pro: 15. Enterprise: ilimitado. | Community |

## 3. Event Planning

| ID | Regla | Tipo | Descripcion | Contexto |
|----|-------|------|-------------|----------|
| BR-020 | Evento con fecha futura | Invariante | Un evento no puede crearse con StartTime en el pasado. | Event Planning |
| BR-021 | EndTime > StartTime | Invariante | La fecha/hora de fin de un evento debe ser posterior a la de inicio. | Event Planning |
| BR-022 | Solo miembros pueden RSVP | Restriccion | Solo los miembros activos de la comunidad pueden enviar RSVP a eventos de esa comunidad. | Event Planning |
| BR-023 | Capacidad maxima | Invariante | El numero de RSVPs "Yes" no puede exceder la capacidad maxima definida (Capacity). Si se alcanza, nuevos RSVPs "Yes" entran en lista de espera. | Event Planning |
| BR-024 | RSVP unico por miembro | Invariante | Un miembro solo puede tener un RSVP activo por evento. Cambiar de "Yes" a "No" actualiza el existente. | Event Planning |
| BR-025 | Check-in requiere RSVP "Yes" | Restriccion | Solo los miembros con RSVP "Yes" pueden realizar check-in en un evento. | Event Planning |
| BR-026 | Ventana de check-in | Restriccion | El check-in solo es posible dentro de una ventana temporal: desde 30 minutos antes del StartTime hasta el EndTime del evento. | Event Planning |
| BR-027 | Check-in unico por miembro | Invariante | Un miembro solo puede hacer check-in una vez por evento. | Event Planning |
| BR-028 | No-Show automatico | Invariante | Al finalizar un evento (EndTime alcanzado + 15 min de gracia), los miembros con RSVP "Yes" sin check-in se marcan como No-Show automaticamente. | Event Planning |
| BR-029 | Cancelacion de evento | Restriccion | Solo el creador del evento o un Admin/Owner de la comunidad puede cancelar un evento. Un evento cancelado no puede reactivarse. | Event Planning |

## 4. Gamification

| ID | Regla | Tipo | Descripcion | Contexto |
|----|-------|------|-------------|----------|
| BR-030 | XP positivo | Invariante | Todo registro de XP debe tener un monto positivo (> 0). | Gamification |
| BR-031 | XP por asistencia | Regla de calculo | Un check-in en evento otorga XP base = 50 XP. Bonus: +25 XP por ser puntual (check-in en los primeros 10 min), +10 XP si es partido/torneo. | Gamification |
| BR-032 | XP por insignia | Regla de calculo | Ganar una insignia otorga XP segun su tier: Bronze = 100 XP, Silver = 250 XP, Gold = 500 XP, Platinum = 1000 XP, Diamond = 2000 XP. | Gamification |
| BR-033 | Nivel por XP acumulado | Regla de calculo | Nivel 1: 0-99 XP (Rookie), Nivel 2: 100-299 (Aficionado), Nivel 3: 300-599 (Dedicado), Nivel 4: 600-999 (Competidor), Nivel 5: 1000-1499 (Atleta), etc. | Gamification |
| BR-034 | Insignia unica por usuario | Invariante | Un usuario no puede recibir la misma insignia dos veces (a menos que la insignia sea "acumulable", ej. "10 entrenamientos", "50 entrenamientos"). | Gamification |
| BR-035 | Regla de insignia evaluable | Invariante | Toda BadgeRule debe tener criterios validables automaticamente (no ambiguos). No se permiten insignias otorgadas por criterio subjetivo sin validacion. | Gamification |
| BR-036 | Reto con fechas validas | Invariante | EndDate > StartDate. StartDate debe ser futura o presente. | Gamification |
| BR-037 | Progreso maximo | Invariante | El progreso de un usuario en un reto no puede exceder la meta (Goal) definida. | Gamification |
| BR-038 | Reto completado una vez | Invariante | Un usuario solo puede completar un reto una vez. Si ya lo completo, no puede volver a unirse al mismo reto. | Gamification |
| BR-039 | Creacion de reto con permisos | Restriccion | Solo Admin, Owner o Captain pueden crear retos en una comunidad. | Gamification |

## 5. Leaderboards & Economy

| ID | Regla | Tipo | Descripcion | Contexto |
|----|-------|------|-------------|----------|
| BR-040 | Ranking por comunidad | Invariante | Los leaderboards siempre estan asociados a una comunidad. El ranking global (cross-comunidad) es un leaderboard especial sin CommunityId. | Leaderboards |
| BR-041 | Score no negativo | Invariante | El score de un usuario en cualquier leaderboard debe ser >= 0. | Leaderboards |
| BR-042 | Balance no negativo | Invariante | El balance de SportCoins de un usuario nunca puede ser negativo. Se rechaza cualquier transaccion que lo llevaria a negativo. | Economy |
| BR-043 | SportCoins sin valor real | Invariante | Las SportCoins no son convertibles a dinero real ni transferibles entre usuarios. No constituyen un instrumento financiero. | Economy |
| BR-044 | Transaccion inmutable | Invariante | Una vez registrada, una CoinTransaction no puede ser modificada ni eliminada. Para corregir errores, se emite una transaccion de ajuste (Admin_Adjustment). | Economy |
| BR-045 | Maximo de SportCoins por dia | Restriccion | Un usuario puede ganar como maximo 500 SportCoins por dia natural, independentemente de la fuente. | Economy |

## 6. Payments

| ID | Regla | Tipo | Descripcion | Contexto |
|----|-------|------|-------------|----------|
| BR-050 | Suscripcion unica activa | Invariante | Una comunidad solo puede tener una suscripcion activa a la vez. | Payments |
| BR-051 | Feature gating por plan | Restriccion | Las features disponibles para una comunidad dependen de su Plan activo. Si la suscripcion expira/cancela, las features Premium se bloquean (no se pierden datos). | Payments |
| BR-052 | Degradacion sin perdida de datos | Invariante | Al degradar de Premium a Free, los datos generados con features Premium (torneos avanzados, etc.) se preservan pero quedan en modo lectura. | Payments |
| BR-053 | Facturacion pro-rata | Regla de calculo | Al cambiar de plan a mitad de ciclo, se factura la diferencia pro-rata por los dias restantes. | Payments |

## 7. Notifications

| ID | Regla | Tipo | Descripcion | Contexto |
|----|-------|------|-------------|----------|
| BR-060 | Respetar preferencias | Restriccion | Las notificaciones deben respetar las NotificationPreference del usuario. Si desactivo notificaciones push de eventos, no se le envia push de eventos. Email y InApp pueden mantenerse activos. | Notifications |
| BR-061 | Frecuencia maxima | Restriccion | Un usuario no puede recibir mas de 3 notificaciones push en una hora (rate limiting anti-spam). | Notifications |
| BR-062 | Expiracion de notificaciones | Invariante | Las notificaciones in-app expiran automaticamente a los 90 dias de su creacion. | Notifications |

## 8. Integrations

| ID | Regla | Tipo | Descripcion | Contexto |
|----|-------|------|-------------|----------|
| BR-070 | Conexion wearable unica | Invariante | Un usuario solo puede tener una conexion activa por provider de wearable. Conectar un nuevo dispositivo del mismo provider reemplaza la conexion anterior. | Integrations |
| BR-071 | Actividad wearable duplicada | Invariante | No se puede importar la misma actividad wearable dos veces (deteccion por ActivityId del provider). | Integrations |
| BR-072 | Beneficio con stock | Restriccion | No se puede redimir un beneficio cuyo stock es 0. | Integrations |
| BR-073 | Costo de redencion | Regla de calculo | El costo en SportCoins de un beneficio se descuenta del balance del usuario en el momento de la redencion. | Integrations |
| BR-074 | Redencion unica por usuario | Restriccion | Un usuario solo puede canjear un beneficio especifico una vez (a menos que el beneficio permita multi-redencion). | Integrations |

## 9. Reglas Transversales (Cross-cutting)

| ID | Regla | Tipo | Descripcion |
|----|-------|------|-------------|
| BR-080 | Isolation por comunidad | Invariante | Los datos de una comunidad no deben ser visibles para miembros de otra comunidad, excepto en leaderboards globales (donde solo se muestra username y score agregado). |
| BR-081 | Marcado de eliminacion | Invariante | Los datos de usuarios eliminados (derecho al olvido) se anonimizan: username → "Usuario Eliminado", datos personales se borran, pero se preservan aggregados anonimos (asistencias, XP historico) para no romper leaderboards. |
| BR-082 | Auditoria de cambios criticos | Invariante | Cambios en roles, expulsiones de miembros, cancelaciones de suscripcion y ajustes manuales de SportCoins deben registrar quien realizo la accion (audit log inmutable). |
| BR-083 | Consistencia eventual entre contextos | Restriccion | La comunicacion entre bounded contexts mediante eventos de dominio es eventualmente consistente. Un leaderboard puede tardar hasta 5 segundos en reflejar un XP recien ganado. |
