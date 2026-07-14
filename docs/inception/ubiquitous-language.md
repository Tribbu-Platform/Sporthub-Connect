# Lenguaje Ubicuo (Ubiquitous Language) — SportHub Connect

## Glosario de Terminos del Dominio

### Comunidad y Membresia

| Termino | Definicion | Contexto |
|---------|------------|----------|
| **Comunidad (Community)** | Grupo organizado de personas que comparten una actividad deportiva. Puede ser un club, una liga amateur, una escuela deportiva o un grupo informal. | Community Management |
| **Sub-grupo (SubGroup)** | Division interna de una comunidad. Puede ser por disciplina deportiva, categoria de edad, nivel de habilidad o ubicacion geografica. Ej: "Equipo Senior Futbol", "Grupo Running Mañanero". | Community Management |
| **Miembro (Member)** | Usuario registrado que pertenece a una comunidad. Posee un rol dentro de ella. | Community, Identity |
| **Membresia (Membership)** | Vinculo formal entre un usuario y una comunidad. Define su estado (activo/inactivo/bloqueado) y su rol comunitario. | Community Management |
| **Rol Comunitario (CommunityRole)** | Funcion que desempeña un miembro en su comunidad: Owner (dueño), Admin (administrador), Captain (capitan), Coach (entrenador), Member (miembro regular). | Community Management |
| **Owner** | Dueño/creador de la comunidad. Maximo poder administrativo. Puede transferir la propiedad. | Community Management |
| **Capitan (Captain)** | Lider de un sub-grupo o equipo. Puede crear eventos para su grupo y gestionar la asistencia. | Community Management |
| **Coach / Entrenador** | Responsable del desarrollo tecnico de los miembros. Puede asignar retos y evaluar progreso. | Community Management |
| **Nivel de Habilidad (SkillLevel)** | Auto-evaluacion del deportista sobre su nivel: Principiante (Beginner), Intermedio (Intermediate), Avanzado (Advanced), Experto (Expert), Profesional (Professional). | Identity |

### Eventos y Planificacion

| Termino | Definicion | Contexto |
|---------|------------|----------|
| **Evento (Event)** | Actividad programada en la comunidad. Tipos: Entrenamiento (Training), Partido (Match), Torneo (Tournament), Evento Social (Social), Otro. | Event Planning |
| **Calendario (Calendar)** | Vista cronologica de todos los eventos de una comunidad o sub-grupo. | Event Planning |
| **RSVP** | Respuesta del miembro a una invitacion de evento. Opciones: Si (Yes), No (No), Tal vez (Maybe). Termino tomado del frances "Répondez s'il vous plaît". | Event Planning |
| **Asistencia (Attendance)** | Registro de presencia fisica en un evento, validado mediante check-in. | Event Planning |
| **Check-in** | Accion de validar la presencia en un evento. Metodos: QR dinamico, geolocalizacion, manual por admin. | Event Planning |
| **Capacidad (Capacity)** | Numero maximo de participantes permitidos en un evento. Si se alcanza, los RSVPs adicionales entran en lista de espera. | Event Planning |
| **Inasistencia (No-Show)** | Miembro que confirmo asistencia (RSVP "Yes") pero no realizo check-in. Puede generar penalizaciones. | Event Planning |

### Gamificacion

| Termino | Definicion | Contexto |
|---------|------------|----------|
| **Insignia (Badge)** | Galardon digital que reconoce un logro o hito del deportista. Ej: "Asistencia Perfecta" (10 eventos seguidos), "Primer Check-in", "Rey de la Cancha". | Gamification |
| **Regla de Insignia (BadgeRule)** | Condicion que dispara el otorgamiento automatico de una insignia al cumplirse. Ej: ">= 10 check-ins en 30 dias". | Gamification |
| **Vitrina de Insignias (Badge Showcase)** | Coleccion visible de insignias ganadas por un usuario, mostrada en su perfil deportivo. | Gamification |
| **Puntos de Experiencia (XP)** | Unidad de progreso que el deportista acumula por participar en eventos, ganar insignias y completar retos. Refleja su actividad y compromiso. | Gamification |
| **Nivel (Level)** | Grado de progresion basado en XP acumulado. Cada nivel tiene un titulo asociado (ej: "Rookie", "Veterano", "Leyenda"). | Gamification |
| **Reto (Challenge)** | Desafio temporal con un objetivo medible. Tipos: Individual o Colectivo. Ej: "Asiste a 15 entrenamientos en marzo", "El equipo acumula 500 km corriendo". | Gamification |
| **Progreso (Progress)** | Porcentaje de avance de un usuario hacia la meta de un reto. | Gamification |
| **Logro (Achievement)** | Hito alcanzado que combina multiples factores (insignias + XP + retos completados). Mas significativo que una insignia individual. | Gamification |

### Rankings y Economia

| Termino | Definicion | Contexto |
|---------|------------|----------|
| **Leaderboard** | Tabla de clasificacion que ordena miembros por una metrica (XP, asistencias, insignias, SportCoins) en un periodo. | Leaderboards |
| **Ranking** | Posicion de un usuario en un leaderboard especifico. Incluye el score y la diferencia con la posicion anterior. | Leaderboards |
| **SportCoin** | Moneda virtual de la plataforma. Se gana por actividades destacadas y se canjea por beneficios en el marketplace. No tiene valor monetario real. | Economy |
| **Billetera (Wallet)** | Balance de SportCoins de un usuario. Muestra total ganado (lifetime) y total gastado. | Economy |
| **Transaccion (Transaction)** | Movimiento de SportCoins en la billetera: ganancia (earn) o gasto (spend). Cada transaccion tiene un tipo (evento, insignia, reto, beneficio, penalizacion, ajuste). | Economy |
| **Penalizacion (Penalty)** | Descuento de SportCoins por inasistencia (no-show) o infracciones leves a normas de la comunidad. | Economy |

### Premium y Monetizacion

| Termino | Definicion | Contexto |
|---------|------------|----------|
| **Plan** | Nivel de suscripcion de una comunidad: Free, Pro, Enterprise. Define features disponibles y limites. | Payments |
| **Suscripcion (Subscription)** | Contrato activo de una comunidad con un plan Premium. Tiene estado (activo, moroso, cancelado, expirado). | Payments |
| **Marca Aliada (BenefitPartner)** | Empresa o marca que ofrece beneficios canjeables por SportCoins en el marketplace. | Integrations |
| **Beneficio (Benefit)** | Producto, servicio o descuento ofrecido por una marca aliada. Tiene un costo en SportCoins y un stock limitado. | Integrations |
| **Redencion (Redemption)** | Acto de canjear SportCoins por un beneficio. Genera un codigo unico de redencion. | Integrations |

### Integraciones

| Termino | Definicion | Contexto |
|---------|------------|----------|
| **Wearable** | Dispositivo o app de seguimiento deportivo: Strava, Garmin, Apple Health, Fitbit. | Integrations |
| **Conexion Wearable (WearableConnection)** | Vinculo autorizado entre la cuenta de SportHub y el proveedor de wearable para sincronizar actividades. | Integrations |
| **Actividad Wearable (WearableActivity)** | Actividad deportiva importada desde un wearable: carrera, ciclismo, natacion, etc. Incluye distancia, duracion y datos brutos. | Integrations |
| **Anti-fraude (AntiFraud)** | Mecanismos para garantizar que las actividades declaradas son reales: geolocalizacion en check-in, QR dinamicos, verificacion por proximidad. | Event Planning |

### Tecnicos/Transversales

| Termino | Definicion |
|---------|------------|
| **Multi-tenant** | Arquitectura que permite que multiples comunidades compartan la misma infraestructura con datos aislados. Cada comunidad es un tenant. |
| **Evento de Dominio (Domain Event)** | Hecho significativo que ocurre en el dominio y que otros bounded contexts pueden necesitar conocer. Ej: "CheckInRealizado", "InsigniaOtorgada", "RetoCompletado". |
| **Correlation ID** | Identificador unico que se propaga a traves de todas las capas y servicios para trazabilidad de una operacion. |
