# Modelo de Dominio: SportHub Connect

## 1. Bounded Contexts y Mapa de Relacion

```
┌──────────────────────────────────────────────────────────────────────┐
│                     SportHub Connect Ecosystem                       │
│                                                                      │
│  ┌──────────────────────┐    ┌──────────────────────────────┐       │
│  │   Identity & Users   │    │   Community Management       │       │
│  │   (Core)             │◄───│   (Core)                     │       │
│  │                      │    │                              │       │
│  │  - User              │    │  - Community                 │       │
│  │  - Profile           │    │  - Membership                │       │
│  │  - Role              │    │  - SubGroup                  │       │
│  │  - SkillLevel        │    │  - Role (Community-scoped)   │       │
│  └──────────┬───────────┘    └─────────────┬────────────────┘       │
│             │                              │                         │
│             │    ┌─────────────────────────┼──────────────┐         │
│             │    │   Event Planning        │              │         │
│             │    │   (Core)               │              │         │
│             │    │                        ▼              │         │
│             │    │  - Event ────────────────────────────┐│         │
│             │    │  - Calendar                          ││         │
│             │    │  - RSVP           ┌──────────────────┘│         │
│             │    │  - CheckIn        │  Gamification     │         │
│             │    │  - Attendance     │  (Core)           │         │
│             │    └────────┬──────────┤                   │         │
│             │             │          │  - Badge          │         │
│             │             │          │  - BadgeRule      │         │
│             │             │          │  - XP             │         │
│             │             │          │  - Level          │         │
│             │             └──────────┤  - Challenge      │         │
│             │                        │  - Achievement    │         │
│             │                        └────────┬──────────┘         │
│             │                                 │                     │
│             │    ┌────────────────────────────┼──────────┐         │
│             │    │   Leaderboards & Economy   │          │         │
│             │    │   (Supporting)             │          │         │
│             │    │                            ▼          │         │
│             │    │  - Leaderboard                        │         │
│             │    │  - Ranking ──────────────────────────┐│         │
│             │    │  - SportCoin                         ││         │
│             │    │  - Transaction             ┌─────────┘│         │
│             │    └────────┬───────────────────┤          │         │
│             │             │    Payments       │          │         │
│             │             │    (Supporting)   │          │         │
│             │             │                   │          │         │
│             │             │  - Subscription  │          │         │
│             │             │  - Invoice       │          │         │
│             │             │  - PaymentMethod │          │         │
│             │             └──────────────────┘          │         │
│             │                                           │         │
│             │    ┌─────────────────────────────────────┘         │
│             │    │   Notifications                              │
│             │    │   (Supporting)                               │
│             │    │                                              │
│             │    │  - Notification                              │
│             │    │  - NotificationPreference                    │
│             │    │  - FeedItem                                  │
│             │    └──────────────────────────────────────────────┘
│             │
│             │    ┌──────────────────────────────────────┐
│             │    │   Integrations                       │
│             │    │   (Supporting)                       │
│             │    │                                      │
│             │    │  - WearableConnection                │
│             │    │  - WearableActivity                  │
│             │    │  - BenefitPartner                    │
│             │    │  - BenefitRedemption                 │
│             │    └──────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────────┘
```

### Contextos y su clasificacion:

| Bounded Context | Tipo | Descripcion | Comunica con |
|----------------|------|-------------|-------------|
| **Identity & Users** | Core | Gestion de identidad, autenticacion, perfiles de usuario globales | Community, Event Planning, Gamification, Notifications |
| **Community Management** | Core | Creacion y administracion de comunidades, sub-grupos y membresias | Identity, Event Planning, Gamification, Leaderboards |
| **Event Planning** | Core | Calendario, eventos, RSVP, check-in, asistencia | Community, Identity, Gamification, Notifications |
| **Gamification** | Core | Motor de insignias, XP, niveles, retos, logros | Identity, Community, Event Planning, Leaderboards, Notifications |
| **Leaderboards & Economy** | Supporting | Rankings, moneda virtual y transacciones de puntos | Gamification, Community |
| **Payments** | Supporting | Suscripciones, facturacion, metodos de pago (Stripe) | Community (para features Premium) |
| **Notifications** | Supporting | Envio de notificaciones push, email, feed de actividad | Todos los core contexts |
| **Integrations** | Supporting | Conexion con wearables, marketplace de beneficios, aliados | Identity, Gamification |

---

## 2. Identity & Users Bounded Context

### Entidades

| Entidad | Descripcion | Atributos clave |
|---------|-------------|-----------------|
| **User** | Usuario registrado en la plataforma | Id, Email, AuthProvider, CreatedAt, LastLoginAt, IsActive |
| **Profile** | Perfil deportivo del usuario | Id, UserId, DisplayName, AvatarUrl, Bio, SkillLevel, PrimarySport |
| **UserRole** | Rol global del usuario (no confundir con CommunityRole) | UserId, Role (Admin, Player, Captain, Coach) |

### Value Objects

| Value Object | Atributos |
|-------------|-----------|
| **SkillLevel** | SelfAssessedLevel (enum: Beginner, Intermediate, Advanced, Expert, Professional), AssessedAt |
| **PersonalRecord** | SportType, RecordValue, Unit, RecordedAt, VerifiedBy (Wearable/Manual) |
| **ContactInfo** | PhoneNumber, CountryCode |
| **Address** | Street, City, State, Country, PostalCode, Coordinates (lat/lng) |

### Agregados y Raices

| Agregado | Raiz | Entidades internas | Value Objects |
|----------|------|-------------------|---------------|
| **UserProfile** | User | Profile, UserRole | SkillLevel, ContactInfo, Address, PersonalRecord[] |
| **SportProfile** | Profile | — | PersonalRecord[] |

### Repositorios

- `IUserRepository`: FindById, FindByEmail, Add, Update
- `IProfileRepository`: FindByUserId, Update

---

## 3. Community Management Bounded Context

### Entidades

| Entidad | Descripcion | Atributos clave |
|---------|-------------|-----------------|
| **Community** | Club, grupo o comunidad deportiva | Id, Name, Slug, Description, LogoUrl, SportType, IsPremium, CreatedByUserId, CreatedAt |
| **Membership** | Relacion entre usuario y comunidad | Id, CommunityId, UserId, JoinedAt, Status (Active, Inactive, Banned) |
| **CommunityRole** | Rol del miembro dentro de la comunidad | MembershipId, Role (Owner, Admin, Captain, Coach, Member) |
| **SubGroup** | Sub-grupo dentro de una comunidad | Id, CommunityId, Name, Description, Category, AgeRange |
| **SubGroupMember** | Miembro de un sub-grupo | SubGroupId, MembershipId, JoinedAt |

### Value Objects

| Value Object | Atributos |
|-------------|-----------|
| **AgeRange** | MinAge, MaxAge |
| **SportType** | Name, Category (Team, Individual, Mixed), Icon |
| **CommunityConfig** | MaxMembers, AllowSelfJoin, RequireApproval, DefaultRole |
| **Slug** | Value (derived from name, unique per community) |

### Agregados y Raices

| Agregado | Raiz | Entidades internas | Value Objects | Invariantes |
|----------|------|-------------------|---------------|-------------|
| **Community** | Community | Membership[], SubGroup[] | CommunityConfig, SportType, Slug | El creador siempre es Owner; Nombre unico por tenant |
| **Membership** | Membership | CommunityRole | — | Un usuario solo puede tener una membresia activa por comunidad |
| **SubGroup** | SubGroup | SubGroupMember[] | AgeRange | Members debe pertenecer a la comunidad padre |

### Repositorios

- `ICommunityRepository`: FindById, FindBySlug, FindByAdmin, Add, Update, Delete
- `IMembershipRepository`: FindByUserAndCommunity, FindByCommunity, Add, UpdateStatus
- `ISubGroupRepository`: FindByCommunity, Add, Remove

---

## 4. Event Planning Bounded Context

### Entidades

| Entidad | Descripcion | Atributos clave |
|---------|-------------|-----------------|
| **Event** | Evento deportivo o social | Id, CommunityId, SubGroupId?, Title, Description, EventType, StartTime, EndTime, Location, Capacity, CreatedByUserId, Status |
| **Calendar** | Vista agregada de eventos de una comunidad | CommunityId, Events[] (read model) |
| **RSVP** | Respuesta de asistencia de un miembro | Id, EventId, MembershipId, Response (Yes, No, Maybe), RespondedAt |
| **CheckIn** | Confirmacion de presencia fisica | Id, EventId, MembershipId, CheckedInAt, Method (QR, Geolocation, Manual) |
| **AttendanceRecord** | Registro historico de asistencia | MembershipId, EventId, Attended (bool), CheckedInAt |

### Value Objects

| Value Object | Atributos |
|-------------|-----------|
| **EventType** | Name (Training, Match, Tournament, Social, Other), Icon, ColorCode |
| **EventLocation** | Name, Address, Coordinates (lat/lng), GoogleMapsUrl |
| **TimeRange** | Start, End, Duration |
| **Capacity** | MaxCapacity, CurrentRSVPs |

### Agregados y Raices

| Agregado | Raiz | Entidades internas | Value Objects | Invariantes |
|----------|------|-------------------|---------------|-------------|
| **Event** | Event | RSVP[], CheckIn[] | EventType, EventLocation, TimeRange, Capacity | RSVPs no pueden exceder Capacity; Solo miembros de la comunidad pueden RSVP; Solo RSVP "Yes" puede hacer CheckIn |
| **RSVP** | RSVP | — | — | Un miembro solo puede tener un RSVP activo por evento |

### Repositorios

- `IEventRepository`: FindByCommunity, FindByDateRange, FindById, Add, Update, Cancel
- `IRSVPRepository`: FindByEventAndMember, UpdateResponse, BatchByEvent
- `ICheckInRepository`: RecordCheckIn, FindByEvent, FindByMemberAndDateRange

---

## 5. Gamification Bounded Context

### Entidades

| Entidad | Descripcion | Atributos clave |
|---------|-------------|-----------------|
| **Badge** | Definicion de una insignia | Id, Name, Description, IconUrl, Category, Tier, IsActive |
| **BadgeRule** | Regla de otorgamiento automatico | Id, BadgeId, RuleType, Criteria (JSON), TriggerEvent |
| **UserBadge** | Insignia otorgada a un usuario | Id, BadgeId, UserId, CommunityId?, EarnedAt, Context (event/achievement ref) |
| **XPRecord** | Registro de XP ganado | Id, UserId, CommunityId?, Amount, Source, SourceId, EarnedAt |
| **Level** | Definicion de nivel | LevelNumber, XpThreshold, Title, IconUrl |
| **Challenge** | Reto dinamico | Id, CommunityId, Title, Description, StartDate, EndDate, Goal, GoalMetric, RewardXP, Status |
| **ChallengeParticipant** | Participante en un reto | ChallengeId, UserId, JoinedAt, Progress, CompletedAt |

### Value Objects

| Value Object | Atributos |
|-------------|-----------|
| **XpAmount** | Value (int positivo), Source (EventAttendance, BadgeEarned, ChallengeCompleted, ManualBonus) |
| **GoalMetric** | Type (AttendanceCount, TotalXP, DistanceKm, EventCount), TargetValue, Unit |
| **BadgeCategory** | Name (Attendance, Performance, Community, Milestone, Special) |
| **BadgeTier** | Level (Bronze, Silver, Gold, Platinum, Diamond) |
| **Progress** | Current, Target, Percentage |

### Agregados y Raices

| Agregado | Raiz | Entidades internas | Value Objects | Invariantes |
|----------|------|-------------------|---------------|-------------|
| **Badge** | Badge | BadgeRule[] | BadgeCategory, BadgeTier | Reglas deben ser validables; No se puede eliminar Badge con UserBadges otorgados |
| **UserGamification** | User (desde Identity) | UserBadge[], XPRecord[], Level | XpAmount | XP total = suma de XPRecords; Nivel se calcula del XP total |
| **Challenge** | Challenge | ChallengeParticipant[] | GoalMetric | Fecha fin > fecha inicio; Progress no puede exceder Goal |

### Repositorios

- `IBadgeRepository`: FindAll, FindById, FindByCategory, Add, Update
- `IUserBadgeRepository`: FindByUser, FindByUserAndCommunity, Add
- `IXPRecordRepository`: FindByUser, FindTotalXP, Add, GetLeaderboardXP
- `IChallengeRepository`: FindByCommunity, FindActive, FindById, Add, UpdateProgress

---

## 6. Leaderboards & Economy Bounded Context

### Entidades

| Entidad | Descripcion | Atributos clave |
|---------|-------------|-----------------|
| **Leaderboard** | Tabla de clasificacion | Id, CommunityId, Name, Category, Period, LastUpdated |
| **Ranking** | Posicion de un usuario en el leaderboard | LeaderboardId, UserId, Rank, Score, PreviousRank |
| **SportCoinWallet** | Billetera de moneda virtual | UserId, Balance, TotalEarned, TotalSpent |
| **CoinTransaction** | Transaccion de SportCoins | Id, UserId, Amount (positivo=earn, negativo=spend), TransactionType, ReferenceId, CreatedAt |

### Value Objects

| Value Object | Atributos |
|-------------|-----------|
| **LeaderboardCategory** | Name (XP, Attendance, Badges, SportCoins, Challenges), Icon |
| **LeaderboardPeriod** | Type (Weekly, Monthly, AllTime), StartDate, EndDate |
| **CoinAmount** | Value (int, puede ser negativo para gastos), Currency (= "SPC") |
| **TransactionType** | Type (Earn_Event, Earn_Badge, Earn_Challenge, Spend_Benefit, Spend_Penalty, Admin_Adjustment) |

### Agregados y Raices

| Agregado | Raiz | Entidades internas | Value Objects | Invariantes |
|----------|------|-------------------|---------------|-------------|
| **Leaderboard** | Leaderboard | Ranking[] | LeaderboardCategory, LeaderboardPeriod | Cada usuario aparece maximo una vez por leaderboard; Score debe ser >= 0 |
| **SportCoinWallet** | SportCoinWallet | CoinTransaction[] | CoinAmount | Balance nunca debe ser negativo; TotalEarned - TotalSpent = Balance |

### Repositorios

- `ILeaderboardRepository`: FindByCommunity, GetRankings, RefreshRankings
- `ISportCoinWalletRepository`: FindByUser, AddTransaction, GetBalance

---

## 7. Payments Bounded Context

### Entidades

| Entidad | Descripcion | Atributos clave |
|---------|-------------|-----------------|
| **Subscription** | Suscripcion Premium de una comunidad | Id, CommunityId, Plan, Status, StartedAt, ExpiresAt, StripeSubscriptionId |
| **Invoice** | Factura generada | Id, CommunityId, Amount, Currency, Status, IssuedAt, PaidAt, StripeInvoiceId |

### Value Objects

| Value Object | Atributos |
|-------------|-----------|
| **Plan** | Name (Free, Pro, Enterprise), MonthlyPrice, Features[] |
| **SubscriptionStatus** | Value (Active, PastDue, Canceled, Expired) |
| **Money** | Amount (decimal), Currency (USD, EUR, MXN) |

### Agregados y Raices

| Agregado | Raiz | Entidades internas | Value Objects | Invariantes |
|----------|------|-------------------|---------------|-------------|
| **Subscription** | Subscription | Invoice[] | Plan, SubscriptionStatus, Money | Comunidad solo puede tener una suscripcion activa; Cambio de plan se factura pro-rata |

### Repositorios

- `ISubscriptionRepository`: FindByCommunity, FindActive, Create, UpdateStatus
- `IInvoiceRepository`: FindByCommunity, FindByPeriod

---

## 8. Notifications Bounded Context

### Entidades

| Entidad | Descripcion | Atributos clave |
|---------|-------------|-----------------|
| **Notification** | Mensaje notificable | Id, UserId, Title, Body, Category, Channel, IsRead, CreatedAt, ReferenceUrl |
| **NotificationPreference** | Preferencias de notificacion | UserId, Channel, Category, IsEnabled |
| **FeedItem** | Item del feed de actividad de comunidad | Id, CommunityId, ActorUserId, Action, TargetType, TargetId, Metadata, CreatedAt |

### Value Objects

| Value Object | Atributos |
|-------------|-----------|
| **NotificationChannel** | Type (Push, Email, InApp) |
| **NotificationCategory** | Name (Event, Badge, Challenge, Community, Payment, System) |
| **FeedAction** | Type (Created, Joined, Earned, Completed, Commented) |

### Agregados y Raices

| Agregado | Raiz | Invariantes |
|----------|------|-------------|
| **UserNotifications** | User (Identity) | Notificaciones expiran a los 90 dias |
| **CommunityFeed** | Community | Feed items son inmutables; Maximo 100 items visibles sin scroll |

### Repositorios

- `INotificationRepository`: FindByUser, MarkAsRead, Send
- `IFeedRepository`: FindByCommunity, Add

---

## 9. Integrations Bounded Context

### Entidades

| Entidad | Descripcion | Atributos clave |
|---------|-------------|-----------------|
| **WearableConnection** | Conexion con wearable de usuario | Id, UserId, Provider, AccessToken (encriptado), RefreshToken, ConnectedAt, LastSyncAt |
| **WearableActivity** | Actividad importada de wearable | Id, UserId, Provider, ActivityType, DistanceKm, Duration, StartedAt, RawData |
| **BenefitPartner** | Marca aliada | Id, Name, LogoUrl, Description, IsActive |
| **BenefitCatalog** | Beneficio canjeable | Id, PartnerId, Title, Description, CoinCost, Stock, IsActive |
| **BenefitRedemption** | Redencion de beneficio por usuario | Id, UserId, BenefitId, RedeemedAt, CoinCost, Status, RedemptionCode |

### Value Objects

| Value Object | Atributos |
|-------------|-----------|
| **WearableProvider** | Name (Strava, Garmin, AppleHealth, Fitbit), IconUrl |
| **WearableActivityType** | Type (Run, Cycle, Swim, Hike, Walk, Gym, Yoga, Other) |
| **CoinCost** | Amount (int > 0) |

### Agregados y Raices

| Agregado | Raiz | Invariantes |
|----------|------|-------------|
| **WearableConnection** | WearableConnection | Un usuario solo puede tener una conexion activa por provider |
| **Benefit** | BenefitCatalog | Stock no puede ser negativo; Redemption descuenta stock |

### Repositorios

- `IWearableConnectionRepository`: FindByUser, Connect, Disconnect
- `IWearableActivityRepository`: Import, FindByUser, FindByDateRange
- `IBenefitRepository`: FindAll, FindByPartner, CheckStock, Redeem

---

## 10. Eventos de Dominio y Comunicacion entre Bounded Contexts

La comunicacion entre bounded contexts se realiza a traves de **eventos de dominio** publicados en el bus de mensajeria (RabbitMQ inicial). Cada contexto reacciona a los eventos que le interesan.

### Principales flujos de eventos:

```
Event Planning ──Evento Creado──▶ Notifications (avisar a miembros)
Event Planning ──CheckIn Realizado──▶ Gamification (otorgar XP)
Event Planning ──CheckIn Realizado──▶ Leaderboards (actualizar ranking)
Gamification ──Badge Otorgado──▶ Notifications (felicitar)
Gamification ──Badge Otorgado──▶ Leaderboards (recalcular score)
Gamification ──Reto Completado──▶ Leaderboards (otorgar SportCoins)
Community ──Miembro Unido──▶ Gamification (badge de bienvenida)
Community ──Miembro Unido──▶ Notifications (avisar admin)
Payments ──Suscripcion Activada──▶ Community (activar features Premium)
Payments ──Suscripcion Cancelada──▶ Community (degradar a Free)
Integrations ──Actividad Wearable──▶ Gamification (XP aumentado)
```
