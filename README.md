# SportHub Connect

![.NET](https://img.shields.io/badge/.NET-10.0_LTS-512BD4?logo=dotnet)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?logo=rabbitmq)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)

Plataforma SaaS integral que unifica la gestion de comunidades deportivas en un solo ecosistema: gestion operativa (miembros, eventos), engagement social (gamificacion, rankings) y monetizacion (suscripciones, beneficios).

## Arquitectura

- **Backend**: .NET 10 LTS, Clean Architecture modular con 8 bounded contexts (DDD)
- **Frontend**: React 19 + TypeScript + Next.js 16 (App Router)
- **Persistencia**: PostgreSQL 16 (un schema por modulo) + Redis 7 (cache/rankings)
- **Mensajeria**: RabbitMQ 3.13 (Domain Events entre modulos)
- **Contenedores**: Docker + Docker Compose

[Documentacion de arquitectura](docs/architecture.md)

## Requisitos

- [.NET SDK 10.0](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 22+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

## Configuracion de herramientas

### Figma (MCP)

El proyecto integra el servidor MCP de Figma para acceder a disenos y recursos de diseno directamente desde opencode. Para habilitarlo:

1. Obtener un **Personal Access Token** desde [Figma Developer Settings](https://www.figma.com/developers/api#access-tokens)
2. Configurar la variable de entorno:

**Windows (PowerShell)**:
```powershell
# Guardar la variable de forma permanente
[Environment]::SetEnvironmentVariable('FIGMA_API_KEY', 'figd_TU_TOKEN', 'User')

# Cargarla en la sesion actual o antes de iniciar opencode
$env:FIGMA_API_KEY = [Environment]::GetEnvironmentVariable('FIGMA_API_KEY', 'User')
```

**Linux / macOS**:
```bash
echo 'export FIGMA_API_KEY="figd_TU_TOKEN"' >> ~/.bashrc
source ~/.bashrc
```

3. **Reiniciar opencode** para que el servidor MCP detecte la variable

> [!NOTE]
> El token debe tener permisos de lectura sobre los archivos Figma del proyecto. Si no tienes acceso, solicitalo al lider tecnico.

## Inicio rapido

```powershell
# 1. Clonar repositorio
git clone https://github.com/tu-org/sport-hub-connect.git
cd sport-hub-connect

# 2. Iniciar infraestructura
docker compose -f infrastructure/docker-compose.yml up -d postgres redis rabbitmq

# 3. Backend API
dotnet restore
dotnet build
dotnet run --project src/Api/SportHub.Api/

# 4. Frontend Web
cd frontend/sport-hub-web
npm ci
npm run dev

# Abrir http://localhost:3000
```

## Estructura del monorepo

```
sport-hub-connect/
├── SportHub.slnx                        # Solucion .NET
├── src/
│   ├── Api/SportHub.Api/                # API Gateway / BFF (Minimal API + SignalR)
│   ├── Modules/                         # 8 Bounded Contexts
│   │   ├── Identity/                    # Usuarios, perfiles deportivos
│   │   ├── Community/                   # Comunidades, membresias, sub-grupos
│   │   ├── EventPlanning/               # Eventos, RSVP, check-in
│   │   ├── Gamification/                # Insignias, XP, niveles, retos
│   │   ├── Leaderboards/                # Rankings, SportCoins
│   │   ├── Payments/                    # Suscripciones, Stripe
│   │   ├── Notifications/               # Push/email/in-app, feed
│   │   └── Integrations/                # Wearables, marketplace
│   └── Shared/                          # Kernel compartido
├── tests/                               # Tests (Unit, Integration, Contract, E2E)
├── frontend/sport-hub-web/              # Next.js 16 PWA
├── infrastructure/                      # Docker, NGINX, scripts SQL
└── docs/                                # Documentacion, ADRs, modelo de dominio
```

## Servicios

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| API Backend | 5000 | ASP.NET Core Minimal API |
| Web Frontend | 3000 | Next.js 16 (SSR/SSG) |
| PostgreSQL | 5432 | Base de datos principal |
| Redis | 6379 | Cache y leaderboards |
| RabbitMQ | 5672 | Message broker |
| RabbitMQ UI | 15672 | Management dashboard |
| NGINX | 80 | Reverse proxy local |

## Bounded Contexts

| Modulo | Schema PostgreSQL | Responsabilidad |
|--------|-----------------|-----------------|
| Identity | `identity` | Usuarios, Auth0, perfiles deportivos |
| Community | `community` | Comunidades, membresias, roles |
| EventPlanning | `events` | Eventos, calendarios, RSVP, check-in |
| Gamification | `gamification` | Insignias, XP, niveles, retos |
| Leaderboards | `economy` | Rankings, SportCoins |
| Payments | `payments` | Suscripciones, Stripe, facturacion |
| Notifications | `notifications` | Push, email, in-app, feed |
| Integrations | `integrations` | Wearables, marketplace beneficios |

## Desarrollo

```powershell
# Backend: Compilar y ejecutar tests
dotnet build
dotnet test

# Backend: Ejecutar API en watch mode
dotnet watch run --project src/Api/SportHub.Api/

# Frontend: Desarrollo
cd frontend/sport-hub-web
npm run dev
npm run test
npm run lint

# Docker: Entorno completo
docker compose -f infrastructure/docker-compose.yml up -d
docker compose -f infrastructure/docker-compose.yml down

# EF Core: Migraciones (Identity como ejemplo)
dotnet ef migrations add InitialCreate \
  --project src/Modules/Identity/SportHub.Identity.Infrastructure \
  --startup-project src/Api/SportHub.Api
```

## CI/CD

| Pipeline | Archivo | Disparador |
|----------|---------|-----------|
| CI (Build + Test + Lint) | `.github/workflows/ci.yml` | Push a `develop`, `feature/*`, `hu/*` |
| CD Staging | `.github/workflows/cd-staging.yml` | Push a `develop` |
| CD Production | `.github/workflows/cd-production.yml` | Push a `main` o tag `v*` |

## Stack tecnologico

### Backend
| Capa | Tecnologia |
|------|-----------|
| Runtime | .NET 10.0 LTS |
| API | ASP.NET Core Minimal API |
| ORM | Entity Framework Core 10 |
| CQRS | MediatR 12 |
| Validacion | FluentValidation |
| Mensajeria | MassTransit + RabbitMQ |
| Cache | Redis (IDistributedCache) |
| Logging | Serilog |
| Testing | xUnit + Moq + FluentAssertions + Testcontainers |

### Frontend
| Capa | Tecnologia |
|------|-----------|
| Framework | React 19 + TypeScript 5 |
| Meta-framework | Next.js 16 (App Router) |
| Estado | Zustand |
| UI | Tailwind CSS 4 + shadcn/ui |
| Data Fetching | TanStack Query |
| Testing | Vitest + Testing Library + Playwright |

## Licencia

Propietario. Todos los derechos reservados.
