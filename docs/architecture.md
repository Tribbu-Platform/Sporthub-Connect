# Arquitectura del Sistema SportHub Connect

> Ultima actualizacion: 2026-07-13
> Version: 1.0.0

## 1. Proposito y alcance

### 1.1 Proposito

**SportHub Connect** es una plataforma SaaS integral que unifica la gestion de comunidades deportivas en un solo ecosistema. La plataforma combina gestion operativa (miembros, eventos, calendarios), engagement social (gamificacion, retos, insignias) y monetizacion (suscripciones, beneficios) para clubes, comunidades y grupos deportivos amateurs y semi-profesionales.

El sistema sigue un modelo **freemium multi-tenant**: cada comunidad es un tenant aislado logicamente. El nucleo gratuito ofrece herramientas de alto valor para comunidades pequeñas, mientras que las suscripciones Premium desbloquean funcionalidades avanzadas.

### 1.2 Alcance arquitectonico

Este documento define la arquitectura del sistema completo: backend, frontend, infraestructura, patrones transversales y decisiones arquitectonicas (ADRs). El alcance incluye:

- **8 Bounded Contexts** siguiendo Domain-Driven Design
- **Monorepo .NET** con estructura modular preparada para evolucion a microservicios
- **API RESTful** con OpenAPI 3.0 + SignalR para comunicacion en tiempo real
- **SPA/PWA** en React + TypeScript para frontend web
- **Infraestructura cloud-native** con Docker, contenedores y servicios gestionados

### 1.3 Stakeholders arquitectonicos

| Stakeholder | Rol | Interes arquitectonico |
|-------------|-----|------------------------|
| Arquitecto de software | Definicion y evolucion del sistema | ADRs, C4, stack, patrones |
| Equipo de desarrollo (4-6 devs) | Implementacion | Topologia, convenciones, tooling |
| DevOps / Cloud Engineer | Infraestructura y despliegue | Contenedores, CI/CD, observabilidad |
| Product Owner | Priorizacion funcional | Roadmap, restricciones de negocio |
| Security Officer | Cumplimiento normativo | Cifrado, GDPR, PCI-DSS, autenticacion |

---

## 2. Diagrama de contexto (C4 - Nivel 1)

```mermaid
C4Context
    title SportHub Connect — Diagrama de Contexto (Nivel 1)

    Person(deportista, "Deportista", "Miembro de una comunidad deportiva que asiste a eventos, gana XP e insignias, y compite en rankings")
    Person(admin_club, "Admin de Club", "Dueño, admin o capitan que gestiona la comunidad, crea eventos, retos y administra membresias")
    Person(marca_aliada, "Marca Aliada", "Partner que ofrece beneficios canjeables con SportCoins en el marketplace")

    System(sportHub, "SportHub Connect", "Plataforma SaaS de gestion, engagement y gamificacion para comunidades deportivas. Multi-tenant, freemium, cloud-native.")

    System_Ext(auth0, "Auth0 / Azure AD B2C", "Identity Provider externo. Gestiona autenticacion OAuth2/OIDC, MFA, social login y directorio de usuarios.")
    System_Ext(stripe, "Stripe", "Pasarela de pagos para suscripciones Premium. Tokenizacion de tarjetas, facturacion recurrente y webhooks.")
    System_Ext(sendgrid, "SendGrid / FCM", "Servicios externos de envio de notificaciones email (SendGrid) y push notifications (Firebase Cloud Messaging).")
    System_Ext(wearables, "Strava / Garmin / Apple Health", "APIs de terceros para importar actividades deportivas de wearables de usuarios Premium.")
    System_Ext(cdn, "CDN (Cloudflare / Azure CDN)", "Distribucion de assets estaticos e imagenes de perfil.")

    Rel(deportista, sportHub, "Consulta eventos, RSVP, check-in, ve rankings, gana insignias", "HTTPS (PWA)")
    Rel(admin_club, sportHub, "Gestiona comunidad, miembros, eventos, retos, configura insignias", "HTTPS (PWA)")
    Rel(marca_aliada, sportHub, "Publica beneficios, consulta redenciones", "HTTPS (Portal)")

    Rel(sportHub, auth0, "Autentica usuarios y valida tokens JWT", "OAuth2 / OIDC")
    Rel(sportHub, stripe, "Procesa pagos de suscripciones y consume webhooks de eventos de facturacion", "HTTPS + Webhooks")
    Rel(sportHub, sendgrid, "Envia emails transaccionales (verificacion, notificaciones, facturas)", "SMTP / API REST")
    Rel(sportHub, wearables, "Sincroniza actividades deportivas de usuarios Premium (futuro)", "OAuth2 / API REST")
    Rel(sportHub, cdn, "Sirve assets estaticos e imagenes de perfil optimizadas", "HTTPS")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
```

---

## 3. Diagrama de contenedores (C4 - Nivel 2)

```mermaid
C4Container
    title SportHub Connect — Diagrama de Contenedores (Nivel 2)

    Person(deportista, "Deportista", "Usuario de la plataforma")
    Person(admin, "Admin de Club", "Administrador de comunidad")

    System_Ext(auth0, "Auth0 / Azure AD B2C", "Identity Provider")
    System_Ext(stripe, "Stripe", "Pasarela de Pagos")

    Container_Boundary(platform, "SportHub Connect Platform") {
        Container(webapp, "Web Application", "React + TypeScript + Next.js", "SPA/PWA que consume la API REST y SignalR. SSR/SSG para SEO de comunidades publicas. Service Worker para capacidades offline basicas.")
        Container(api, "API Gateway / BFF", "ASP.NET Core 8 Minimal API + YARP", "Entry point unificado. Enruta requests a los modulos internos. Autenticacion JWT. Rate limiting. OpenAPI 3.0. SignalR hub central.")
        Container(identity, "Identity Module", "ASP.NET Core 8 (Clean Architecture)", "Gestion de usuarios, perfiles deportivos, niveles de habilidad. Consume Auth0 para autenticacion.")
        Container(community, "Community Module", "ASP.NET Core 8 (Clean Architecture)", "Gestion de comunidades, membresias, roles comunitarios y sub-grupos.")
        Container(event, "Event Module", "ASP.NET Core 8 (Clean Architecture)", "Planificacion de eventos, calendario, RSVP, check-in con QR/geolocalizacion. SAGA de asistencia.")
        Container(gamification, "Gamification Module", "ASP.NET Core 8 (Clean Architecture)", "Motor de insignias, reglas, XP, niveles y retos dinamicos. Evaluacion de BadgeRules.")
        Container(leaderboard, "Leaderboard Module", "ASP.NET Core 8 (Clean Architecture)", "Rankings en tiempo real con Redis Sorted Sets. Gestion de SportCoins y transacciones.")
        Container(payments, "Payments Module", "ASP.NET Core 8 (Clean Architecture)", "Suscripciones, facturacion, integracion con Stripe. Feature gating por plan.")
        Container(notifications, "Notifications Module", "ASP.NET Core 8 (Clean Architecture)", "Envio de notificaciones push/email/in-app. Feed de actividad de comunidad. Preferencias de notificacion.")
        Container(integrations, "Integrations Module", "ASP.NET Core 8 (Clean Architecture)", "Conexion con wearables, marketplace de beneficios y aliados comerciales.")
        ContainerDb(postgres, "PostgreSQL Database", "PostgreSQL 16", "Base de datos relacional principal. Un schema por bounded context. Full-Text Search para busquedas. Row-Level Security para multi-tenant.")
        ContainerDb(redis, "Redis Cache", "Redis 7", "Cache distribuido. Sorted Sets para leaderboards en tiempo real. SignalR backplane. Pub/Sub interno.")
        ContainerDb(rabbitmq, "RabbitMQ", "RabbitMQ 3.13", "Message broker para eventos de dominio entre bounded contexts. Exchange de topicos con colas durables.")
        ContainerDb(blob, "Blob Storage", "Azure Blob / AWS S3 / MinIO(dev)", "Almacenamiento de avatares, logos de comunidades, assets de insignias, backups.")
    }

    Rel(deportista, webapp, "Usa la plataforma", "HTTPS")
    Rel(admin, webapp, "Administra la comunidad", "HTTPS")
    Rel(webapp, api, "API REST + SignalR WebSocket", "HTTPS/WSS")
    Rel(api, auth0, "Valida tokens JWT", "OAuth2/OIDC")
    Rel(api, identity, "Enruta peticiones de usuarios", "In-process / HTTP")
    Rel(api, community, "Enruta peticiones de comunidades", "In-process / HTTP")
    Rel(api, event, "Enruta peticiones de eventos", "In-process / HTTP")

    Rel(identity, postgres, "Persiste usuarios y perfiles", "SQL (EF Core)")
    Rel(community, postgres, "Persiste comunidades y membresias", "SQL (EF Core)")
    Rel(event, postgres, "Persiste eventos y asistencias", "SQL (EF Core)")
    Rel(gamification, postgres, "Persiste insignias y XP", "SQL (EF Core)")
    Rel(leaderboard, postgres, "Persiste wallets y transacciones", "SQL (EF Core)")
    Rel(leaderboard, redis, "Rankings en vivo con Sorted Sets", "Redis Protocol")
    Rel(payments, postgres, "Persiste suscripciones y facturas", "SQL (EF Core)")
    Rel(payments, stripe, "Crea/gestiona suscripciones, consume webhooks", "HTTPS")
    Rel(notifications, postgres, "Persiste notificaciones y preferencias", "SQL (EF Core)")
    Rel(integrations, postgres, "Persiste conexiones y beneficios", "SQL (EF Core)")

    Rel(identity, rabbitmq, "Publica UserRegistered, ProfileUpdated", "AMQP")
    Rel(community, rabbitmq, "Publica MemberJoined, MemberLeft, CommunityCreated", "AMQP")
    Rel(event, rabbitmq, "Publica EventCreated, CheckInRecorded, NoShowDetected", "AMQP")
    Rel(gamification, rabbitmq, "Publica BadgeEarned, XPEarned, LevelUp, ChallengeCompleted", "AMQP")
    Rel(leaderboard, rabbitmq, "Publica CoinsEarned, LeaderboardUpdated, TopRankAchieved", "AMQP")
    Rel(payments, rabbitmq, "Publica SubscriptionCreated, SubscriptionCanceled", "AMQP")

    Rel(gamification, rabbitmq, "Consume CheckInRecorded, MemberJoined para otorgar XP/insignias", "AMQP")
    Rel(leaderboard, rabbitmq, "Consume XPEarned, BadgeEarned, CheckInRecorded", "AMQP")
    Rel(notifications, rabbitmq, "Consume eventos de todos los modulos para enviar notificaciones", "AMQP")

    Rel(webapp, blob, "Carga imagenes y assets", "HTTPS")
    Rel(api, blob, "Sirve/almacena archivos de usuario", "HTTPS")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
```

---

## 4. Topologia de servicios

### 4.1 Estructura del Monorepo

El proyecto se organiza como un **monorepo .NET** con una unica solution y proyectos por bounded context. Cada modulo sigue **Clean Architecture** con capas internas claramente separadas. Esta estructura permite extraer cualquier modulo como microservicio independiente en el futuro con minimo esfuerzo.

```
sport-hub-connect/
│
├── SportHub.sln                            # Solucion unica del monorepo
│
├── src/
│   ├── Api/                                # API Gateway / BFF
│   │   └── SportHub.Api/                   # ASP.NET Core 8 Minimal API + YARP
│   │       ├── Program.cs                  # Composition root, middleware pipeline
│   │       ├── appsettings.json
│   │       ├── Routes/                     # Endpoint definitions per module
│   │       ├── Hubs/                       # SignalR hubs (LeaderboardHub, NotificationHub)
│   │       ├── Middleware/                 # Exception handling, correlation ID, tenant resolution
│   │       └── SportHub.Api.csproj
│   │
│   ├── Modules/                            # Bounded contexts como modulos
│   │   ├── Identity/
│   │   │   ├── SportHub.Identity.Domain/           # Entidades, Value Objects, Interfaces de repositorios
│   │   │   ├── SportHub.Identity.Application/      # Casos de uso, Commands/Queries (CQRS), DTOs
│   │   │   ├── SportHub.Identity.Infrastructure/   # EF Core DbContext, repositorios, integracion Auth0
│   │   │   └── SportHub.Identity.Contracts/        # DTOs publicos, eventos de dominio, interfaces de API
│   │   │
│   │   ├── Community/
│   │   │   ├── SportHub.Community.Domain/
│   │   │   ├── SportHub.Community.Application/
│   │   │   ├── SportHub.Community.Infrastructure/
│   │   │   └── SportHub.Community.Contracts/
│   │   │
│   │   ├── EventPlanning/
│   │   │   ├── SportHub.EventPlanning.Domain/
│   │   │   ├── SportHub.EventPlanning.Application/
│   │   │   ├── SportHub.EventPlanning.Infrastructure/
│   │   │   └── SportHub.EventPlanning.Contracts/
│   │   │
│   │   ├── Gamification/
│   │   │   ├── SportHub.Gamification.Domain/
│   │   │   ├── SportHub.Gamification.Application/
│   │   │   ├── SportHub.Gamification.Infrastructure/
│   │   │   └── SportHub.Gamification.Contracts/
│   │   │
│   │   ├── Leaderboards/
│   │   │   ├── SportHub.Leaderboards.Domain/
│   │   │   ├── SportHub.Leaderboards.Application/
│   │   │   ├── SportHub.Leaderboards.Infrastructure/
│   │   │   └── SportHub.Leaderboards.Contracts/
│   │   │
│   │   ├── Payments/
│   │   │   ├── SportHub.Payments.Domain/
│   │   │   ├── SportHub.Payments.Application/
│   │   │   ├── SportHub.Payments.Infrastructure/
│   │   │   └── SportHub.Payments.Contracts/
│   │   │
│   │   ├── Notifications/
│   │   │   ├── SportHub.Notifications.Domain/
│   │   │   ├── SportHub.Notifications.Application/
│   │   │   ├── SportHub.Notifications.Infrastructure/
│   │   │   └── SportHub.Notifications.Contracts/
│   │   │
│   │   └── Integrations/
│   │       ├── SportHub.Integrations.Domain/
│   │       ├── SportHub.Integrations.Application/
│   │       ├── SportHub.Integrations.Infrastructure/
│   │       └── SportHub.Integrations.Contracts/
│   │
│   └── Shared/                             # Kernel compartido (solo lo justificado)
│       ├── SportHub.Shared.Abstractions/   # Interfaces comunes (IDomainEvent, IAggregateRoot, IUnitOfWork)
│       ├── SportHub.Shared.Infrastructure/ # Cross-cutting: logging, health checks, OpenTelemetry, serializacion
│       └── SportHub.Shared.Contracts/      # Enums, tipos y DTOs compartidos entre modulos
│
├── tests/
│   ├── SportHub.Identity.UnitTests/
│   ├── SportHub.Identity.IntegrationTests/
│   ├── SportHub.Community.UnitTests/
│   ├── SportHub.Community.IntegrationTests/
│   ├── SportHub.EventPlanning.UnitTests/
│   ├── SportHub.EventPlanning.IntegrationTests/
│   ├── SportHub.Gamification.UnitTests/
│   ├── SportHub.Gamification.IntegrationTests/
│   ├── SportHub.Leaderboards.UnitTests/
│   ├── SportHub.Leaderboards.IntegrationTests/
│   ├── SportHub.Api.ContractTests/         # Pruebas de contrato contra OpenAPI spec
│   └── SportHub.E2ETests/                  # Pruebas end-to-end (Playwright + API)
│
├── frontend/
│   └── sport-hub-web/                      # React + TypeScript + Next.js PWA
│       ├── src/
│       │   ├── app/                        # Next.js App Router (pages/layouts)
│       │   ├── components/                 # Componentes React reutilizables
│       │   ├── hooks/                      # Custom hooks (useSignalR, useLeaderboard, useAuth)
│       │   ├── services/                   # Clientes API autogenerados (OpenAPI Generator)
│       │   ├── stores/                     # Estado global (Zustand o React Context)
│       │   └── types/                      # Tipos TypeScript generados desde OpenAPI
│       ├── public/
│       ├── next.config.js
│       ├── Dockerfile
│       └── package.json
│
├── infrastructure/
│   ├── docker-compose.yml                  # Entorno de desarrollo local completo
│   ├── docker-compose.prod.yml             # Overrides para produccion
│   ├── Dockerfile.api                      # Imagen del backend
│   ├── nginx.conf                          # Reverse proxy local
│   ├── postgres/
│   │   └── init/                           # Scripts de inicializacion de schemas
│   ├── rabbitmq/
│   │   └── definitions.json               # Definicion de exchanges, queues y bindings
│   └── redis/
│       └── redis.conf
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                          # Build + test en PRs
│   │   ├── cd-staging.yml                  # Deploy a staging
│   │   └── cd-production.yml              # Deploy a produccion
│   └── dependabot.yml
│
├── docs/
│   ├── architecture.md                     # Este documento (ADRs, C4, stack)
│   ├── inception/                          # Artefactos fundacionales
│   └── features/                           # Documentacion por feature
│
└── .editorconfig
```

### 4.2 Flujo de dependencias entre modulos

Los modulos NO se referencian directamente entre si (ni Assembly Reference ni referencia de proyecto). La comunicacion entre bounded contexts se realiza exclusivamente mediante:

1. **Eventos de dominio via RabbitMQ**: Para flujos asincronos y eventualmente consistentes (ej. `CheckInRecorded` → Gamification otorga XP)
2. **Consultas HTTP internas via API Gateway**: Para datos sincronos necesarios en queries cross-modulo (ej. el modulo de Event Planning necesita el nombre del miembro desde Identity para enriquecer respuestas)
3. **Contratos compartidos**: Los modulos solo dependen de `SportHub.Shared.Contracts` (tipos, eventos) y `SportHub.{Module}.Contracts` de otros modulos si necesitan consumir sus eventos o DTOs.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SportHub.Api (BFF)                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │               Composition Root & Middleware                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ Identity │ │Community │ │  Event   │ │Gamification│             │
│  │ Module   │ │ Module   │ │ Planning │ │  Module   │              │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘              │
│       │            │            │            │                      │
│  ┌────┴─────┐ ┌────┴─────┐ ┌───┴──────┐ ┌───┴──────┐              │
│  │Leaderboard│ │ Payments │ │Notif.    │ │Integrat. │              │
│  │ Module   │ │ Module   │ │Module    │ │ Module   │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                      │
│  ─────────── Comunicacion sincrona (in-process HTTP) ───────────    │
│  ═══════════ Comunicacion asincrona (RabbitMQ Domain Events) ═══════  │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 Base de datos: esquema multi-schema

PostgreSQL utiliza un **schema** dedicado por bounded context para mantener isolation logica dentro de la misma base de datos fisica:

| Schema | Bounded Context | Tablas principales |
|--------|----------------|--------------------|
| `identity` | Identity & Users | users, profiles, user_roles, personal_records |
| `community` | Community Management | communities, memberships, community_roles, sub_groups, sub_group_members |
| `events` | Event Planning | events, calendars, rsvps, check_ins, attendance_records |
| `gamification` | Gamification | badges, badge_rules, user_badges, xp_records, levels, challenges, challenge_participants |
| `economy` | Leaderboards & Economy | leaderboards, rankings, sport_coin_wallets, coin_transactions |
| `payments` | Payments | subscriptions, invoices, payment_methods |
| `notifications` | Notifications | notifications, notification_preferences, feed_items |
| `integrations` | Integrations | wearable_connections, wearable_activities, benefit_partners, benefit_catalogs, benefit_redemptions |

Cada modulo tiene su propio `DbContext` de EF Core configurado con `HasDefaultSchema()` y migraciones independientes. Esto permite extraer un schema a su propia base de datos en el futuro sin cambios de codigo (solo cambia la connection string).

---

## 5. Stack tecnologico

### 5.1 Backend

| Capa | Tecnologia | Version | Justificacion | Skill |
|------|-----------|---------|---------------|-------|
| Runtime | .NET | 8.0 LTS | Alto rendimiento (TechEmpower top 10), tipado fuerte para dominio DDD complejo, compilacion AOT disponible, soporte empresarial LTS hasta 2026 | `dotnet-microservice` |
| Framework API | ASP.NET Core (Minimal API) | 8.0 | Minimal APIs reducen boilerplate, excelente performance, OpenAPI 3.0 nativo con Swashbuckle/Scalar, middleware pipeline maduro | `dotnet-microservice` |
| ORM | Entity Framework Core | 8.0 | Migraciones, change tracking, owned types para Value Objects (DDD), TPH/TPT para herencia, intercepciones, LINQ | `dotnet-microservice` |
| CQRS / Mediator | MediatR | 12.x | Separacion limpia de Commands (escritura) y Queries (lectura). Behaviors para validacion, logging, y transaction handling cross-cutting | `dotnet-microservice` |
| Real-time | SignalR | 8.0 | WebSockets nativos con fallback a SSE/Long Polling. Leaderboards en vivo, notificaciones push, actualizaciones de RSVP | `dotnet-microservice` |
| Message Broker Client | MassTransit + RabbitMQ | 8.x + 3.13 | Abstraccion sobre RabbitMQ con soporte para sagas, retry policies, DLQ. Tipado fuerte para eventos de dominio | `dotnet-microservice` |
| Serializacion | System.Text.Json | 8.0 | Nativo de .NET, source generators para AOT, rendimiento superior a Newtonsoft | `dotnet-microservice` |
| Validacion | FluentValidation | 11.x | Validacion declarativa de commands y DTOs. Integracion nativa con MediatR pipeline | `dotnet-microservice` |
| Mapping | Mapster / Mapperly | 7.x / 3.x | Mapeo objeto-objeto con source generators (compilacion AOT), rendimiento superior a AutoMapper | `dotnet-microservice` |
| Identity Provider SDK | Auth0 SDK / Microsoft.Identity.Web | — | Integracion OAuth2/OIDC con el Identity Provider externo. Validacion JWT y claims transformation | `dotnet-microservice` |
| Gateway / Proxy | YARP (Reverse Proxy) | 2.x | Reverse proxy ligero para enrutamiento entre modulos cuando se extraigan como servicios independientes. Rate limiting integrado. | `dotnet-microservice` |
| Observability | OpenTelemetry | 1.x | Trazas distribuidas, metricas y logs exportados a Azure Monitor/Datadog/Jaeger. Instrumentacion automatica de ASP.NET Core, EF Core, HttpClient | `dotnet-microservice` |
| Health Checks | ASP.NET Core Health Checks | 8.0 | Liveness, readiness y startup probes. Checks para PostgreSQL, Redis, RabbitMQ y APIs externas | `dotnet-microservice` |
| Background Jobs | Hangfire / Quartz.NET | 1.x / 3.x | Procesamiento nocturno de leaderboards, expiracion de notificaciones, envio de recordatorios de eventos | `dotnet-microservice` |
| Testing (Unit) | xUnit + Moq + AutoFixture | 2.x + 4.x + 4.x | TDD con RED-GREEN-REFACTOR. Moq para mockeo estricto. AutoFixture para datos de prueba | `tdd-dotnet` |
| Testing (BDD) | Reqnroll (SpecFlow fork) | 2.x | Criterios de aceptacion en Gherkin (Given-When-Then). Sucesor mantenido de SpecFlow con soporte .NET 8 | `bdd-dotnet` |
| Testing (Integration) | xUnit + Testcontainers | 2.x + 3.x | Testcontainers para PostgreSQL, Redis y RabbitMQ en integration tests. Tests reproducibles sin dependencias externas | `tdd-dotnet` |
| Testing (Contract) | PactNet / custom | 4.x | Consumer-driven contract testing entre modulos | `tdd-dotnet` |

### 5.2 Frontend

| Capa | Tecnologia | Version | Justificacion | Skill |
|------|-----------|---------|---------------|-------|
| Framework | React + TypeScript | 18.x + 5.x | Ecosistema maduro para PWAs, amplia disponibilidad de talento, SSR/SSG con Next.js, tipado fuerte | *(No hay skill especifico para frontend en `.opencode/skills/`)* |
| Meta-framework | Next.js | 14.x | App Router, SSR para SEO de comunidades publicas, SSG para paginas estaticas, API routes como BFF ligero, optimizacion de imagenes | *(Sin skill)* |
| Estado global | Zustand | 4.x | Ligero (1 KB), API minimalista, soporte TypeScript, sin boilerplate de Redux | *(Sin skill)* |
| Real-time | SignalR JavaScript Client | 8.0 | Conexion WebSocket para leaderboards en vivo, notificaciones push, actualizaciones de eventos | *(Sin skill)* |
| UI Components | shadcn/ui + Tailwind CSS | — + 3.x | Componentes accesibles (WCAG 2.1 AA), personalizables, tailwind para estilos utilitarios | *(Sin skill)* |
| Data Fetching | TanStack Query (React Query) | 5.x | Cache, refetching, paginacion infinita, mutaciones optimistas. Integracion con SignalR para invalidacion de cache | *(Sin skill)* |
| Formularios | React Hook Form + Zod | 7.x + 3.x | Manejo de formularios con validacion de esquema Zod. Tipos inferidos automaticamente | *(Sin skill)* |
| Testing | Vitest + Testing Library | 1.x + 14.x | Tests unitarios y de componentes. Vitest es compatible con el ecosistema Vite y significativamente mas rapido que Jest | *(Sin skill)* |
| E2E | Playwright | 1.x | Tests end-to-end cross-browser. Soporte para PWA, geolocalizacion mock, y parallel execution | *(Sin skill)* |
| PWA | next-pwa + Workbox | — + 7.x | Service worker, cache offline, instalacion como app nativa. Workbox para estrategias de cache | *(Sin skill)* |

### 5.3 Infraestructura y DevOps

| Capa | Tecnologia | Version | Justificacion | Skill |
|------|-----------|---------|---------------|-------|
| Contenedores | Docker + Docker Compose | 24.x + 2.x | Desarrollo local reproducible. Multi-stage builds para imagenes optimizadas | — |
| CI/CD | GitHub Actions | — | Incluido con GitHub. Builds paralelos, matrices de test, secrets gestionados, auto-runners | — |
| Orquestacion | Azure Container Apps / AKS | — | Serverless containers para MVP. Migrable a AKS si se requiere Kubernetes completo | — |
| IaC | Terraform / Bicep | — | Infraestructura como codigo para recursos cloud. Reproducible y versionable | — |
| API Management | Azure API Management / custom | — | Rate limiting, throttling, API keys para partners | — |
| Monitoreo | Azure Monitor / Grafana + Prometheus | — | Dashboards por bounded context. Alertas configuradas por latencia, errores y disponibilidad | — |
| CDN | Cloudflare / Azure CDN | — | Cache de assets estaticos e imagenes. WAF contra ataques DDoS | — |
| Git | Git Flow (estricto) | — | hu/* → feature/* → develop → release/* → main | `git-flow` |

### Nota sobre skills de frontend

Los skills disponibles en `.opencode/skills/` cubren exclusivamente stacks backend. Para el frontend React + TypeScript, no existe un skill especifico. Esto implica que las tareas de frontend requeriran instrucciones manuales o la creacion de un skill `react-pwa` en el futuro. Las tareas de backend estan completamente cubiertas por `dotnet-microservice`, `tdd-dotnet` y `bdd-dotnet`.

---

## 6. ADR — Architecture Decision Records

### ADR-001: Monorepo con Clean Architecture modular (en lugar de microservicios puros en MVP)

**Estado**: Aceptado
**Fecha**: 2026-07-13

**Contexto**:
El dominio de SportHub Connect se compone de 8 bounded contexts identificados durante el DDD Event Storming. Existe la necesidad de balancear la velocidad de entrega del MVP (<= 6 meses) con la flexibilidad de evolucion futura hacia una arquitectura de microservicios. El equipo inicial es de 4-6 desarrolladores.

Se evaluaron tres alternativas:
1. **Microservicios puros desde el inicio**: Cada bounded context como servicio independiente con su propia base de datos, contenedor, CI/CD. Comunicacion solo via mensajeria (RabbitMQ).
2. **Monolito modular (Modular Monolith)**: Una unica aplicacion .NET con todos los bounded contexts como modulos internos que comparten la misma base de datos y se comunican in-process.
3. **Monorepo con modulos extraibles**: Monorepo con una unica solucion .NET donde cada modulo tiene capas separadas (Domain, Application, Infrastructure, Contracts) y su propio schema en PostgreSQL, pero se despliega como una unica aplicacion. Preparado para extraer modulos como servicios independientes.

**Decision**:
Se elige la **opcion 3: Monorepo con modulos extraibles (Clean Architecture modular)**.

**Justificacion**:
- **Velocidad MVP**: Un solo deploy, una sola pipeline CI/CD, debugging simple, sin latencia de red entre modulos.
- **Aislamiento logico**: Cada modulo tiene su propio schema en PostgreSQL (via `HasDefaultSchema()`). Cada modulo tiene su propio DbContext. No hay accesos directos entre tablas de distintos modulos.
- **Extraibilidad**: Los modulos no tienen dependencias de assembly entre si. La comunicacion se hace via Domain Events (RabbitMQ) desde el dia 1. Para extraer un modulo como microservicio, solo se necesita:
  1. Cambiar la dependencia in-process a HTTP (las interfaces ya estan definidas)
  2. Migrar el schema a una base de datos independiente
  3. Crear un contenedor separado con su propio deploy
- **Simplicidad operativa**: Una sola aplicacion para monitorear, loguear y escalar durante el MVP.
- **Team size adecuado**: Con 4-6 desarrolladores, un monorepo es mas manejable que 8+ microservicios independientes (que requeririan al menos 1-2 devs por servicio).
- **Domain Events desde el dia 1**: Aunque los modulos estan in-process, los eventos de dominio se publican en RabbitMQ. Esto prepara el terreno para que los consumidores eventualmente residan en servicios separados.

**Consecuencias**:
- **Positivas**:
  - Time-to-market acelerado (~50% menos overhead que microservicios puros)
  - Deploy simple (un artefacto)
  - Transacciones cross-modulo sencillas ( mismo `DbContext` con diferentes schemas si es necesario)
  - Refactoring cross-modulo sin coordinar deploys
- **Negativas**:
  - Acoplamiento en el deploy: un cambio en el modulo de Leaderboards requiere re-deploy de toda la aplicacion
  - Riesgo de "contaminacion" entre modulos si no se respeta la disciplina de no referenciar assemblies de otros modulos (mitigado con tests de arquitectura NetArchTest)
  - Escalabilidad gruesa: no se puede escalar solo el modulo de mas carga (ej. Leaderboards) independientemente. Se escala toda la aplicacion (mitigado con Azure Container Apps auto-scaling basado en CPU/memoria/requests)
- **Riesgos**:
  - Si no se mantiene la disciplina de aislamiento entre modulos, el monorepo se convierte en un "big ball of mud". Mitigacion: NetArchTest rules en CI/CD que verifican que no haya dependencias prohibidas entre modulos.

---

### ADR-002: Comunicacion entre bounded contexts mediante Domain Events con RabbitMQ

**Estado**: Aceptado
**Fecha**: 2026-07-13

**Contexto**:
Los bounded contexts necesitan comunicarse para implementar flujos de negocio complejos (ej. SAGA de asistencia: CheckIn → XP → Leaderboard → Notificacion). Existen dos enfoques principales:

1. **Comunicacion sincrona directa**: Un modulo llama directamente a otro via HTTP/in-process. Ej. EventPlanning llama a Gamification.AddXP().
2. **Comunicacion asincrona via eventos de dominio**: Cada modulo publica eventos inmutables en un bus de mensajeria cuando ocurre algo relevante. Los modulos interesados se suscriben y reaccionan.

**Decision**:
Se elige la **comunicacion asincrona via Domain Events con RabbitMQ** como mecanismo principal. Se utiliza MassTransit como abstraccion sobre RabbitMQ para tipado fuerte, sagas, retry policies y dead-letter queues.

**Justificacion**:
- **Desacoplamiento temporal**: El publicador no necesita saber quien consume ni cuando. Esto permite añadir nuevos consumidores sin modificar el emisor.
- **Resiliencia**: Si un consumidor falla, el mensaje permanece en la cola y se reintenta. El publicador no se ve afectado.
- **Consistencia eventual aceptable**: Los flujos de gamificacion (XP ganado tarda < 5s en reflejarse en leaderboard) no requieren consistencia inmediata. Las reglas de negocio lo contemplan como aceptable (BR-083).
- **Preparacion para microservicios**: Cuando un modulo se extrae como servicio independiente, la comunicacion via RabbitMQ sigue funcionando exactamente igual. No hay que cambiar nada.
- **Trazabilidad**: Cada evento tiene CorrelationId y CausationId, permitiendo trazas distribuidas via OpenTelemetry incluso en modo in-process.
- **Auditabilidad**: El log de eventos de dominio es en si mismo un audit log inmutable de lo que ocurre en el sistema.

**Estructura de un Domain Event**:
```
Ejemplo: CheckInRecorded
{
  "eventId": "uuid",
  "timestamp": "2026-07-13T10:30:00Z",
  "correlationId": "uuid",
  "causationId": "uuid",
  "aggregateId": "event-uuid",
  "payload": {
    "checkInId": "uuid",
    "eventId": "uuid",
    "membershipId": "uuid",
    "userId": "uuid",
    "communityId": "uuid",
    "method": "QR",
    "checkedInAt": "2026-07-13T10:29:55Z"
  }
}
```

**Topologia RabbitMQ**:
- **Exchange**: `sport-hub.domain-events` (tipo: topic)
- **Routing keys**: `{context}.{event-name}` (ej. `events.checkin-recorded`, `gamification.badge-earned`)
- **Colas**: Una por modulo consumidor (ej. `gamification.events`, `leaderboards.events`, `notifications.events`)
- **Dead Letter Exchange**: `sport-hub.dlx` para mensajes que fallan tras N reintentos

**Consecuencias**:
- **Positivas**: Desacoplamiento total, resiliencia, extensibilidad, auditabilidad.
- **Negativas**: Complejidad operativa (RabbitMQ es un servicio mas que mantener), consistencia eventual requiere manejo cuidadoso en UI (loading states, optimistic updates via SignalR), depuracion mas compleja que llamadas directas.
- **Riesgos**: Si RabbitMQ se cae, los flujos cross-modulo se detienen. Mitigacion: Outbox pattern para garantizar que los eventos se publican (almacenamiento en tabla outbox antes de enviar a RabbitMQ), health checks que alertan inmediatamente, y reintentos automaticos con MassTransit.

---

### ADR-003: PostgreSQL como base de datos unica con schemas por bounded context

**Estado**: Aceptado
**Fecha**: 2026-07-13

**Contexto**:
El sistema tiene 8 bounded contexts, cada uno con sus propias entidades, agregados y reglas de persistencia. La decision sobre como persistir los datos impacta directamente la capacidad de evolucionar hacia microservicios en el futuro.

Se evaluaron tres alternativas:
1. **Base de datos unica, tablas compartidas**: Todos los modulos comparten las mismas tablas en el schema `public`. Los modulos pueden acceder a tablas de otros modulos.
2. **Base de datos unica, schemas separados**: PostgreSQL unico, pero cada modulo tiene su propio schema (`identity`, `community`, `events`, etc.). Cada modulo solo accede a su schema.
3. **Bases de datos independientes por modulo**: Cada bounded context tiene su propia instancia PostgreSQL. Comunicacion solo via eventos.

**Decision**:
Se elige la **opcion 2: Base de datos unica PostgreSQL con schemas separados por bounded context**.

**Justificacion**:
- **Aislamiento logico**: Cada modulo tiene su propio namespace SQL. Las migraciones de EF Core se ejecutan por schema. No hay posibilidad de hacer JOINs accidentales entre tablas de distintos modulos.
- **Extraibilidad futura**: Migrar un schema a su propia base de datos solo requiere cambiar la connection string y ejecutar un dump/restore del schema. El codigo del modulo no necesita cambios (el DbContext ya esta aislado).
- **Simplicidad operativa**: Una sola base de datos para backups, monitoreo, mantenimiento. Menor costo cloud que 8 instancias PostgreSQL.
- **Transacciones cross-modulo**: Si un flujo de negocio requiere atomicidad entre modulos (ej. crear una comunidad + crear la membresia del owner + inicializar su wallet de SportCoins), se puede hacer en una sola transaccion de base de datos con diferentes schemas.
- **PostgreSQL soporta esto nativamente**: `search_path`, `HasDefaultSchema()` en EF Core, y Row-Level Security (RLS) para multi-tenant.
- **Volumen de datos moderado en MVP**: Con 100,000 usuarios y 5,000 comunidades objetivo en año 1, una sola instancia PostgreSQL 16 maneja esto sin problemas.

**Estrategia multi-tenant**:
Cada comunidad es un tenant. Se utiliza **Row-Level Security (RLS)** en PostgreSQL:
- Cada tabla en cada schema tiene una columna `community_id`
- Una politica RLS filtra automaticamente por `community_id = current_community_id()`
- `current_community_id()` se configura al inicio de cada request via `SET application_name` o variable de sesion
- Esto garantiza que los datos de una comunidad nunca se filtren a otra, incluso si hay un bug en la capa de aplicacion

**Estructura fisica de schemas**:
```sql
-- Schemas
CREATE SCHEMA identity;
CREATE SCHEMA community;
CREATE SCHEMA events;
CREATE SCHEMA gamification;
CREATE SCHEMA economy;
CREATE SCHEMA payments;
CREATE SCHEMA notifications;
CREATE SCHEMA integrations;

-- Cada modulo usa su schema
ALTER ROLE sport_hub_app SET search_path = identity, community, events, gamification, economy, payments, notifications, integrations, public;
```

**Consecuencias**:
- **Positivas**: Simplicidad operativa, transacciones cross-modulo posibles, extraibilidad futura, RLS como red de seguridad multi-tenant.
- **Negativas**: No hay aislamiento fisico (una consulta mal optimizada en un modulo puede afectar a otros). Cuello de botella unico (la base de datos es el punto unico de fallo del sistema). Escalabilidad limitada (escalado vertical vs horizontal).
- **Riesgos**: Si el volumen de datos crece mas rapido de lo esperado, puede ser necesario extraer schemas a bases de datos independientes antes de lo planeado. Mitigacion: Monitoreo proactivo con metricas de tamaño por schema, particionamiento de tablas grandes (events, notifications, coin_transactions) desde el dia 1.

---

## 7. Patrones transversales

### 7.1 Autenticacion y Autorizacion

| Aspecto | Implementacion |
|---------|---------------|
| **Identity Provider** | Auth0 / Azure AD B2C (externo). OAuth 2.0 + OpenID Connect. |
| **Flujos OAuth** | Authorization Code + PKCE para SPA. Client Credentials para service-to-service. |
| **Token validation** | JWT Bearer token validado en el API Gateway. Claims incluyen `sub`, `email`, `roles`, `permissions`. |
| **Roles globales** | Admin, Player, Captain, Coach. Incluidos en el JWT como claim `roles`. |
| **Roles comunitarios** | Owner, Admin, Captain, Coach, Member. Almacenados en `community.memberships`. Propios de cada comunidad. |
| **Autorizacion por recurso** | Policy-based authorization en ASP.NET Core. Policies que evaluan claims + datos del tenant. Ej: `CommunityAdminRequirement` verifica que el usuario tiene rol Admin en la comunidad del recurso. |
| **Multi-tenant** | Resolucion de `community_id` desde el slug de la URL o header `X-Community-Id`. Configuracion de RLS en PostgreSQL. |
| **MFA** | Habilitado via Auth0 para cuentas admin/premium. TOTP + WebAuthn. |

**Flujo de autenticacion**:
```
1. Usuario inicia sesion en SPA → redirigido a Auth0
2. Auth0 autentica (email/password, Google, Microsoft, MFA si aplica)
3. Auth0 redirige con authorization code al SPA
4. SPA intercambia code por access_token + refresh_token (PKCE)
5. SPA envia access_token en header Authorization: Bearer {token}
6. API Gateway valida signature, issuer, audience, expiry del JWT
7. API Gateway extrae claims y los propaga a modulos internos via HTTP headers
```

### 7.2 Comunicacion entre servicios (sync/async)

| Tipo | Mecanismo | Uso |
|------|-----------|-----|
| **Sync (solicitud/respuesta)** | HTTP REST via API Gateway | Queries que necesitan datos de otro modulo para enriquecer respuestas. Ej: Event Planning consulta nombres de miembros a Identity. |
| **Async (eventos)** | RabbitMQ + MassTransit | Domain Events para flujos cross-modulo. Ej: `CheckInRecorded` → Gamification otorga XP. |
| **Real-time (push)** | SignalR WebSockets | Leaderboards en vivo, notificaciones en tiempo real, cambios en RSVP, actualizaciones de feed. |
| **In-process (MVP)** | Llamadas directas via interfaces | Durante MVP, los modulos pueden comunicarse in-process via sus contratos. La abstraccion permite cambiar a HTTP cuando se extraigan. |

**Outbox Pattern para garantia de publicacion**:
Cuando un modulo procesa un comando que genera un evento de dominio (ej. `RecordCheckInCommand`), el evento se guarda primero en una tabla `outbox_messages` dentro de la misma transaccion del agregado. Un proceso background (MassTransit + Quartz) publica los mensajes pendientes a RabbitMQ. Esto garantiza que nunca se pierde un evento si RabbitMQ esta inaccesible temporalmente.

### 7.3 Manejo de errores y resiliencia

| Patron | Implementacion |
|--------|---------------|
| **Global Exception Handler** | Middleware en API Gateway que captura excepciones no manejadas y devuelve RFC 7807 Problem Details. |
| **Result Pattern** | Operaciones de dominio devuelven `Result<T>` o `OneOf<T, Error>` en lugar de lanzar excepciones para errores esperados (validacion, reglas de negocio). |
| **Resiliencia HTTP** | Polly policies: retry con exponential backoff (3 intentos), circuit breaker (5 fallos → abierto 30s), timeout (5s para queries, 10s para commands). |
| **MassTransit Retry** | Reintentos automaticos para consumidores de RabbitMQ: 3 intentos inmediatos, luego 3 con 30s delay, luego a DLQ. |
| **Dead Letter Queue** | `sport-hub.dlx` exchange. Mensajes que fallan despues de todos los reintentos van a DLQ para inspeccion manual y reprocesamiento. |
| **Degradacion graceful** | Si un modulo dependiente no responde (ej. Gamification esta caido), los modulos que publican eventos (ej. EventPlanning) siguen funcionando. Los eventos quedan en cola y se procesan cuando Gamification vuelve. |
| **Health Checks** | `/health` (liveness): verifica que el proceso esta vivo. `/health/ready` (readiness): verifica PostgreSQL, Redis, RabbitMQ. Usado por Kubernetes/ACA para reiniciar pods no saludables. |
| **Rate Limiting** | Middleware de rate limiting en API Gateway: 100 req/min para usuarios autenticados, 20 req/min para endpoints de auth. |

### 7.4 Logging y observabilidad

| Aspecto | Implementacion |
|---------|---------------|
| **Logging estructurado** | Serilog con sinks: Console (desarrollo), Azure Monitor/Application Insights (produccion). Formato JSON con campos estandar: `timestamp`, `level`, `message`, `correlationId`, `userId`, `communityId`, `module`. |
| **Correlation ID** | Middleware que genera/extrae `X-Correlation-Id` del header HTTP y lo propaga a todas las capas via `AsyncLocal` + `ILogger.BeginScope()`. Incluido en cada Domain Event. |
| **Trazas distribuidas** | OpenTelemetry SDK para .NET. Instrumentacion automatica de ASP.NET Core, EF Core, HttpClient, MassTransit, SignalR. Exportacion a Jaeger/Azure Monitor. Muestreo: 100% errores, 10% exitos. |
| **Metricas** | OpenTelemetry Metrics. Contadores: `http_requests_total`, `http_request_duration_seconds`, `domain_events_published_total`, `domain_events_consumed_total`, `signalr_connections_active`. Exportacion a Prometheus/Azure Monitor. |
| **Dashboards** | Dashboards por bounded context en Grafana/Azure Monitor: latencia p95, throughput, error rate, eventos publicados/consumidos, conexiones SignalR activas, tamaño de colas RabbitMQ. |
| **Alertas** | Configuradas para: latencia > p95 umbral, error rate > 1%, disponibilidad < 99.5%, cola DLQ > 0 mensajes, RabbitMQ/Redis no alcanzable. |
| **Audit Log** | Tabla `audit.audit_logs` en PostgreSQL. Registra cambios en datos sensibles: cambios de rol, expulsiones, cancelaciones de suscripcion, ajustes de SportCoins. Inmutable (solo INSERT). |

### 7.5 Estrategia de testing

La piramide de testing de SportHub Connect sigue los principios de la **piramide de tests invertida para microservicios** (mas tests de integracion que en aplicaciones tradicionales debido al alto nivel de integracion entre modulos):

| Nivel | Tipo | Herramienta | Cobertura objetivo | Responsabilidad |
|-------|------|------------|--------------------|----------------|
| **Unit Tests** | Test unitarios de dominio y aplicacion | xUnit + Moq + AutoFixture | >= 80% | Validar entidades, value objects, commands, queries, handlers. Sin dependencias externas. |
| **Integration Tests** | Test de integracion con infraestructura real | xUnit + Testcontainers (PostgreSQL, Redis, RabbitMQ) | >= 60% en modulos core | Validar repositorios, consumidores de eventos, publicacion de eventos, integracion con Auth0 (mock), Stripe (mock). |
| **Contract Tests** | Consumer-driven contract tests | PactNet | Por modulo que expone API | Validar que los contratos entre modulos no se rompen. Evitar integracion fantasma. |
| **BDD / Acceptance** | Criterios de aceptacion automatizados | Reqnroll (Gherkin) | 1 escenario por HU | Validar flujos de negocio end-to-end desde la perspectiva del usuario. |
| **E2E Tests** | Flujos criticos completos | Playwright | Flujos criticos (happy paths) | Login, crear comunidad, crear evento, RSVP, check-in, ver XP ganado, ver leaderboard. |
| **Architecture Tests** | Validacion de reglas arquitectonicas | NetArchTest | Reglas clave | Verificar dependencias entre capas, convenciones de nombrado, no dependencias prohibidas entre modulos. |
| **Load Tests** | Pruebas de carga | k6 / NBomber | Antes de release | Simular 500 rps, 10,000 usuarios concurrentes. Validar auto-scaling y limites. |

---

## 8. Restricciones tecnicas

### 8.1 Restricciones de plataforma

| ID | Restriccion | Descripcion | Impacto |
|----|-------------|-------------|---------|
| TC-01 | PWA first, no app nativa en MVP | La plataforma debe funcionar como PWA con soporte offline basico (cache de eventos, perfil). No se desarrolla app nativa movil en v1.0. El diseño debe ser responsive y mobile-first. | El frontend debe implementar Service Worker con Workbox. No se requiere soporte para funcionalidades nativas (push notifications nativas, deep links, biometrics) en MVP. |
| TC-02 | Navegadores soportados | Chrome, Firefox, Safari, Edge (ultimas 2 versiones principales). Soporte movil completo. | Limita APIs web utilizables (sin Web Bluetooth, sin Web NFC). Polyfills solo cuando sea estrictamente necesario. |
| TC-03 | API RESTful con OpenAPI 3.0 | Toda la API debe documentarse en OpenAPI 3.0 (Swagger/Scalar). Los contratos se definen antes de implementar (API-first). | Los DTOs deben tener anotaciones Swagger o usar Scalar para documentacion interactiva. El API Gateway es el unico punto de entrada externo. |
| TC-04 | Monorepo .NET unico | Todo el backend se desarrolla en una unica solucion .NET 8. | Estructura de proyectos estandarizada por modulo. CI/CD unificado. Versionado unico con SemVer. |
| TC-05 | Desarrollo local con Docker | El entorno de desarrollo requiere Docker Compose con PostgreSQL, Redis, RabbitMQ y la API. | Los desarrolladores necesitan Docker Desktop. Los integration tests usan Testcontainers (no requieren Docker Compose). |

### 8.2 Restricciones de compliance

| ID | Restriccion | Descripcion | Implementacion |
|----|-------------|-------------|----------------|
| TC-06 | GDPR (Union Europea) | Consentimiento explicito para datos personales. Derecho a portabilidad de datos. Derecho al olvido en < 72h. | Anonimizacion de datos personales preservando agregados. Endpoint de exportacion JSON. Roles de DPO designado si aplica. |
| TC-07 | PCI-DSS Nivel 4 | No almacenar numeros de tarjeta. Externalizar tokenizacion a Stripe. | Stripe Elements en frontend. Stripe Customer ID en backend. No pasan numeros de tarjeta por nuestros servidores. |
| TC-08 | Cifrado en reposo | AES-256 para PII (datos personales). AES-128 para el resto. | PostgreSQL TDE (Azure) o pgcrypto. Secretos en Azure Key Vault. |
| TC-09 | Cifrado en transito | TLS 1.3 obligatorio. HSTS habilitado. | Configuracion de CDN + certificados gestionados (Azure Managed TLS / Cloudflare). |
| TC-10 | No PII en logs | Datos personales no deben aparecer en logs. | Serilog enrichers filtran campos PII. Solo IDs anonimizados. |
| TC-11 | WCAG 2.1 Nivel AA | La interfaz web debe cumplir con estandares de accesibilidad. | Uso de shadcn/ui (componentes accesibles). Tests de accesibilidad con axe-core en CI. |

### 8.3 Restricciones de infraestructura

| ID | Restriccion | Descripcion |
|----|-------------|-------------|
| TC-12 | Cloud agnostic (preferencia Azure) | La plataforma debe ser desplegable en Azure (primario), AWS (alternativo) y entorno local (desarrollo). Usar abstracciones cuando sea posible. Para servicios especificos (Blob Storage), usar interfaces que permitan cambiar de proveedor. |
| TC-13 | Budget optimizado | Usar servicios serverless/managed para minimizar costos operativos en MVP. Auto-scaling basado en demanda real, no provisionamiento estatico. |
| TC-14 | Health checks obligatorios | Todos los servicios (API, workers, procesadores) deben exponer `/health` y `/health/ready`. |
| TC-15 | Infrastructure as Code | Entornos cloud gestionados con IaC (Terraform/Bicep). Entorno local con Docker Compose. Nada se configura manualmente en produccion. |

### 8.4 Restricciones de proceso

| ID | Restriccion | Descripcion |
|----|-------------|-------------|
| TC-16 | MVP en <= 6 meses | La arquitectura debe priorizar velocidad de entrega sin sacrificar extraibilidad futura. |
| TC-17 | Equipo de 4-6 desarrolladores | La complejidad operativa debe ser manejable por un equipo de este tamaño. Justifica monorepo sobre microservicios. |
| TC-18 | Git Flow estricto | `hu/*` → `feature/*` → `develop` → `release/*` → `main`. No push directo a `main` ni `develop`. |
| TC-19 | Conventional Commits | Mensajes de commit siguen el formato `type(scope): description`. Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`. |
| TC-20 | Semantic Versioning | Los releases siguen SemVer. El versionado se gestiona via conventional commits + semantic-release. |

---

## 9. Roadmap arquitectonico

El roadmap arquitectonico de SportHub Connect sigue una evolucion en 3 fases, alineada con el roadmap de producto definido en `docs/inception/product-brief.md`:

### Fase 1: MVP (v1.0) — Monorepo Modular
**Timeline**: Mes 1-6 | **Arquitectura**: Monorepo con modulos extraibles

| Hito | Descripcion | Entregable arquitectonico |
|------|-------------|--------------------------|
| **M1: Fundacion** | Solution .NET, estructura de modulos, CI/CD, Docker Compose | Scaffold del monorepo, health checks, logging estructurado, OpenTelemetry |
| **M2: Identity + Community** | Registro/Auth con Auth0, perfiles, comunidades, membresias | Modulos Identity y Community completos. Schemas `identity` y `community`. |
| **M3: Event Planning** | Creacion de eventos, calendario, RSVP, check-in basico | Modulo Event Planning. 10+ Domain Events. SAGA de asistencia (MVP). |
| **M4: Gamification + Leaderboards** | Motor de insignias, XP, niveles, leaderboards con Redis | Modulos Gamification y Leaderboards. Redis Sorted Sets para rankings en vivo. |
| **M5: Notifications + Feed** | Notificaciones push/email/in-app, feed de actividad | Modulo Notifications. Integracion con SendGrid y FCM. SignalR para push en vivo. |
| **M6: Pulido y lanzamiento** | Pruebas de carga, optimizacion, documentacion, deploy a produccion | Load tests (k6), dashboards finales, runbook operativo. |
| **Go-live** | **v1.0 desplegado en produccion** | API Gateway + 8 modulos internos + PostgreSQL + Redis + RabbitMQ + PWA React |

### Fase 2: Crecimiento (v1.5) — Extraccion de primeros microservicios
**Timeline**: Mes 7-12 | **Arquitectura**: Monorepo + 2-3 microservicios extraidos

| Hito | Descripcion | Cambio arquitectonico |
|------|-------------|----------------------|
| **Extraer Leaderboards** | El modulo de Leaderboards se extrae a un microservicio independiente | Contenedor separado, schema `economy` migrado a base de datos propia. Comunicacion via RabbitMQ (ya esta). API Gateway actualiza rutas. |
| **Extraer Notifications** | El modulo de Notifications se extrae a un microservicio independiente | Contenedor separado. Ideal por ser un consumidor puro de eventos (no expone API compleja). |
| **SportCoins y Retos** | Se añade moneda virtual basica, retos dinamicos, penalizaciones | Nuevos eventos de dominio, nuevas sagas. MassTransit saga state machines para retos. |
| **MeiliSearch** | Motor de busqueda dedicado para eventos, comunidades y miembros | Contenedor MeiliSearch. Sincronizacion via eventos de dominio. Se retira PostgreSQL FTS. |
| **Cache mejorado** | Cache distribuido con Redis en todos los modulos de lectura | Redis como cache de queries frecuentes (leaderboards, feeds, perfiles). Invalidacion via eventos. |

### Fase 3: Escala (v2.0) — Microservicios completos
**Timeline**: Mes 13-18 | **Arquitectura**: Microservicios + Event-Driven

| Hito | Descripcion | Cambio arquitectonico |
|------|-------------|----------------------|
| **Extraccion completa** | Todos los modulos extraidos como microservicios independientes | 8 microservicios + API Gateway. Cada uno con su propia base de datos. Comunicacion exclusiva via RabbitMQ (eventos) + HTTP (queries cross-modulo con API Gateway enrutando). |
| **Kafka migration** | Migracion de RabbitMQ a Kafka para event streaming masivo | Kafka topics por bounded context. Event sourcing para agregados criticos (insignias, XP). |
| **Pasarela de pagos** | Stripe integrado. Suscripciones, facturacion, feature gating. | Modulo Payments completo. Webhooks de Stripe procesados via eventos. |
| **Wearables** | Integracion con Strava, Garmin, Apple Health, Fitbit | Modulo Integrations. Capa de abstraccion para normalizar datos. SAGA de importacion de actividades. |
| **Marketplace** | Marketplace de beneficios con aliados comerciales | Modulo Integrations. API Gateway expone endpoints publicos para partners. Rate limiting por partner. |
| **App nativa** | Aplicacion movil nativa (React Native o .NET MAUI) | API Gateway ya es compatible. SignalR para real-time. Auth0 para auth nativa. |
| **Multi-region** | Despliegue en multiples regiones cloud | Azure Front Door / AWS Global Accelerator. Redis Geo-replication. PostgreSQL read replicas. |

### Principios de evolucion

1. **Strangler Fig Pattern**: Los modulos se extraen incrementalmente del monorepo. Durante la transicion, coexisten modulos in-process y servicios independientes.
2. **No breaking changes en eventos**: Los eventos de dominio se diseñan para ser extendidos (forward-compatible). Nuevos campos se añaden como opcionales.
3. **API Gateway como unico entry point**: El API Gateway abstrae si un modulo esta in-process o es un servicio remoto. Los clientes nunca saben la diferencia.
4. **Feature flags para extraccion**: Cada modulo puede configurarse para ejecutarse in-process o como servicio remoto via feature flag. Permite rollback instantaneo si la extraccion causa problemas.
5. **Metricas guian la extraccion**: Los modulos se extraen basados en metrica real, no en suposiciones: latencia, throughput, carga, tamaño de datos, frecuencia de cambios.

---

## Apendice A: Referencias

| Documento | Ubicacion |
|-----------|-----------|
| Product Brief | `docs/inception/product-brief.md` |
| Modelo de Dominio | `docs/inception/domain-model.md` |
| Catalogo de Eventos de Dominio | `docs/inception/domain-events.md` |
| Reglas de Negocio | `docs/inception/business-rules.md` |
| Restricciones Tecnologicas | `docs/inception/technology-constraints.md` |
| Catalogo de NFRs | `docs/inception/nfr-catalog.md` |
| Lenguaje Ubicuo | `docs/inception/ubiquitous-language.md` |
| Stakeholders | `docs/inception/stakeholder-map.md` |
| Feature Backlog | `docs/inception/feature-backlog.md` |
| Registro de Riesgos | `docs/inception/risk-register.md` |
| Metricas de Exito | `docs/inception/success-metrics.md` |

---

## Apendice B: Glosario de terminos arquitectonicos

| Termino | Definicion |
|---------|------------|
| **Bounded Context** | Limite logico dentro del dominio donde un modelo de dominio particular es valido y consistente. Define la frontera de un modulo. |
| **Domain Event** | Evento inmutable que representa algo relevante que ocurrio en el dominio. Se publica en RabbitMQ y otros bounded contexts pueden reaccionar. |
| **SAGA** | Orquestacion de un proceso de negocio de larga duracion que involucra multiples bounded contexts. Implementado con MassTransit saga state machines o choreography via eventos. |
| **Outbox Pattern** | Patron que garantiza la publicacion de eventos de dominio almacenandolos primero en una tabla de base de datos en la misma transaccion que los cambios de estado del agregado. |
| **Row-Level Security (RLS)** | Caracteristica de PostgreSQL que filtra filas a nivel de base de datos basado en politicas. Usado para garantizar aislamiento multi-tenant. |
| **Module** | En el contexto del monorepo, un modulo es un bounded context implementado como un conjunto de proyectos .NET con capas separadas. |
| **API Gateway / BFF** | Backend For Frontend. Punto de entrada unico que enruta peticiones a los modulos, aplica autenticacion, rate limiting y compone respuestas. |
| **Strangler Fig** | Patron de migracion donde partes de un sistema monolitico se reemplazan incrementalmente por nuevos servicios, hasta que el monolito original se extingue. |
