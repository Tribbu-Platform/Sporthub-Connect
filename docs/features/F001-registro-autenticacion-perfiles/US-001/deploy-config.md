# Deploy Configuration — US-001: Registro con Email y Contrasena

> **Feature:** F001 — Registro, Autenticacion y Perfiles de Usuario
> **Historia de Usuario:** US-001 — Registro con Email y Contrasena
> **Rama:** `hu/F001-US-001-registro-con-email-y-contrasena`
> **Ultima actualizacion:** 2026-07-21

---

## 1. Arquitectura de despliegue

### 1.1 Stack tecnologico

| Componente | Tecnologia | Version |
|------------|-----------|---------|
| Backend API | ASP.NET Core Minimal API | .NET 10 |
| Frontend Web | Next.js (App Router) + React | 16 + 19 |
| Base de datos | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Message Broker | RabbitMQ (dev) / Azure Service Bus (cloud) | 3.13 |
| Contenedores | Docker multi-stage | BuildKit |
| Container Registry | GitHub Container Registry (GHCR) | — |
| Orquestacion | Azure Container Apps (ACA) | Serverless |
| Identity Provider | Auth0 / Azure AD B2C | OAuth2 + OIDC |

### 1.2 Decisiones arquitectonicas

- **ADR-005**: Frontend desplegado en ACA (no Azure Static Web Apps). Ver `docs/architecture.md` seccion 6.6.
- **Preview environments**: Cada rama `hu/*` genera entorno aislado en ACA. Ver `docs/architecture.md` seccion 10.

---

## 2. Puertos y Endpoints

### 2.1 Backend API

| Propiedad | Valor |
|-----------|-------|
| Puerto interno | `8080` |
| Puerto externo (dev) | `5000` |
| URL base (dev) | `http://localhost:5000` |
| URL base (staging) | `https://ca-sport-staging-api.{env}.eastus.azurecontainerapps.io` |

### 2.2 Frontend Web

| Propiedad | Valor |
|-----------|-------|
| Puerto interno | `3000` |
| Puerto externo (dev) | `3000` |
| URL base (dev) | `http://localhost:3000` |
| URL base (staging) | `https://ca-sport-staging-web.{env}.eastus.azurecontainerapps.io` |
| Output mode | `standalone` (Next.js) |

### 2.3 Health Checks

#### Backend

| Endpoint | Tipo | Proposito | Dependencias |
|----------|------|-----------|--------------|
| `GET /health` | **Liveness** | Verifica que el proceso .NET esta vivo y respondiendo | Ninguna (predicate: `_ => false`) |
| `GET /health/ready` | **Readiness** | Verifica que todas las dependencias externas estan disponibles | PostgreSQL, Redis (predicate: `_ => true`) |
| `GET /api/health/details` | **Detailed** | Health check detallado que escribe en BD y devuelve estado completo | PostgreSQL, Redis, RabbitMQ |

**Configuracion en ACA (liveness):**
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 15
  failureThreshold: 3
```

**Configuracion en ACA (readiness):**
```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
  failureThreshold: 3
```

**Configuracion en ACA (startup):**
```yaml
startupProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 5
  failureThreshold: 30
```

#### Frontend

| Endpoint | Tipo | Proposito |
|----------|------|-----------|
| `GET /api/health` | **Liveness** | Verifica que el proceso Node.js esta vivo y el server responde |
| `GET /` | **Readiness** | Verifica que la pagina principal se renderiza correctamente |

**Configuracion en ACA (frontend):**
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10

startupProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 0
  periodSeconds: 5
  failureThreshold: 30
```

### 2.4 Endpoints de la HU (US-001)

| Metodo | Path | Proposito | Rate Limit |
|--------|------|-----------|------------|
| `POST` | `/api/identity/register` | Registro de usuario con email y contrasena | 5 req/min por IP |
| `GET` | `/api/health` | Liveness check | — |
| `GET` | `/health` | Liveness check | — |
| `GET` | `/health/ready` | Readiness check | — |

---

## 3. Variables de Entorno

### 3.1 Backend API

| Variable | Descripcion | Ejemplo | Requerida |
|----------|-------------|---------|-----------|
| `ASPNETCORE_ENVIRONMENT` | Entorno de ejecucion | `Production`, `Preview`, `Development` | ✅ |
| `ASPNETCORE_URLS` | URLs de escucha | `http://+:8080` | ✅ |
| `ConnectionStrings__PostgreSQL` | Cadena de conexion a PostgreSQL | `Host=...;Port=5432;Database=sporthub;...` | ✅ |
| `ConnectionStrings__Identity` | Conexion Identity (igual a PostgreSQL) | `Host=...;Port=5432;Database=sporthub;...` | ✅ |
| `ConnectionStrings__Community` | Conexion Community (igual a PostgreSQL) | `Host=...;Port=5432;Database=sporthub;...` | ✅ |
| `ConnectionStrings__Redis` | Conexion a Redis | `host:port,password=...,ssl=True` | ✅ |
| `ConnectionStrings__RabbitMQ` | Conexion a RabbitMQ (o Service Bus) | `amqp://user:pass@host:5672` | ⚠️ (opcional si no se usa) |
| `Auth0__Domain` | Tenant Auth0 | `sporthub-dev.auth0.com` | ✅ |
| `Auth0__Audience` | Audience del API | `https://api.sporthub.app` | ✅ |
| `Auth0__ClientId` | Client ID de Auth0 | `abc123...` | ✅ |
| `Auth0__ClientSecret` | Client Secret de Auth0 | `***` | ✅ |

### 3.2 Frontend Web

| Variable | Descripcion | Ejemplo | Requerida |
|----------|-------------|---------|-----------|
| `NODE_ENV` | Entorno de Node.js | `production`, `development` | ✅ |
| `NEXT_PUBLIC_API_URL` | URL base del API backend | `https://api.sporthub.app` | ✅ |
| `NEXT_TELEMETRY_DISABLED` | Deshabilitar telemetria de Next.js | `1` | ✅ |
| `HOSTNAME` | Host de escucha | `0.0.0.0` | ✅ |
| `PORT` | Puerto de escucha | `3000` | ✅ |

### 3.3 Configuracion en Azure Container Apps

| Recurso | Configuracion ACA |
|---------|------------------|
| **Container App API** | 0.5 CPU / 1Gi RAM. Min replicas: 0. Max: 2 (preview), 5 (staging) |
| **Container App Web** | 0.25 CPU / 0.5Gi RAM. Min replicas: 0. Max: 2 (preview), 5 (staging) |
| **Scaling rule API** | HTTP scaling: 10 req/sec por replica |
| **Scaling rule Web** | HTTP scaling: 10 req/sec por replica |
| **Ingress API** | External, port 8080, HTTP/2 |
| **Ingress Web** | External, port 3000, HTTP/2 |
| **Idle timeout** | Escala a 0 tras 5 min sin trafico |

---

## 4. Dependencias de Infraestructura

### 4.1 Servicios externos requeridos

| Servicio | Version | Puerto (dev) | Rol en la HU |
|----------|---------|-------------|--------------|
| **PostgreSQL** | 16 | `5433` (host) / `5432` (container) | Almacena usuarios registrados |
| **Redis** | 7 | `6380` (host) / `6379` (container) | Cache de sesiones y rate limiting |
| **RabbitMQ** | 3.13 | `5673` (host) / `5672` (container) | Outbox de eventos de dominio |
| **Auth0** | SaaS | — | Identity Provider para autenticacion |

### 4.2 Flujo de inicializacion

```mermaid
sequenceDiagram
    participant ACA as ACA Environment
    participant API as Container App API
    participant Web as Container App Web
    participant PG as PostgreSQL
    participant RD as Redis
    participant RMQ as RabbitMQ

    ACA->>API: Start (imagen ghcr.io/.../api:tag)
    ACA->>Web: Start (imagen ghcr.io/.../web:tag)
    
    API->>API: Startup probe: GET /health (cada 5s, max 30 fallos)
    API->>PG: Conectar (ConnectionStrings__PostgreSQL)
    API->>RD: Conectar (ConnectionStrings__Redis)
    API->>RMQ: Conectar (ConnectionStrings__RabbitMQ)
    
    Note over API: EnsureCreated() en Development
    API->>PG: Crear schema identity, community
    
    API->>ACA: Readiness probe: GET /health/ready (todas las dependencias OK)
    Web->>Web: Startup probe: GET /api/health
    Web->>API: Proxy /api/* via next.config.js rewrites
    Web->>ACA: Readiness probe: GET /
```

---

## 5. CI/CD Pipeline

### 5.1 Workflows de GitHub Actions

| Workflow | Archivo | Disparador | Proposito |
|----------|---------|------------|-----------|
| **CI** | `.github/workflows/ci.yml` | PR a `develop`, `main`, `feature/*` | Build + test + code analysis |
| **Preview Deploy** | `.github/workflows/deploy-preview.yml` | Push a `hu/*`, PR events | Preview en ACA por HU |

### 5.2 Pipeline CI (ci.yml)

```
[PR opened/synchronized]
    ├── Job: backend (.NET 10)
    │   ├── Restore → Build (Release) → Test (Unit + Integration) → Publish
    │   └── Dependencias: PostgreSQL, Redis (services in GitHub Actions)
    ├── Job: frontend (Next.js 16)
    │   ├── Install → Type-Check → Lint → Test (Vitest) → Build (standalone)
    │   └── Cache: npm
    ├── Job: docker (Docker Build Verification)
    │   ├── Build API image → smoke test /health
    │   └── Build Web image → smoke test /api/health
    └── Job: security (Security & Quality Scans)
        ├── Trivy (dependency vulnerability scan)
        ├── CodeQL (SAST: C#, JavaScript, TypeScript)
        └── Gitleaks (secrets scanning)
```

### 5.3 Pipeline Preview (deploy-preview.yml)

```
[Push a hu/*]
    ├── Job: sanitize
    │   └── Normalizar nombre de rama + generar image tag
    ├── Job: build
    │   ├── Login GHCR → Buildx
    │   ├── Build & Push API image → ghcr.io/.../api:preview-{branch}-{sha}
    │   ├── Build & Push Web image → ghcr.io/.../web:preview-{branch}-{sha}
    │   └── Smoke test (health checks locales)
    ├── Job: deploy (si AZURE_CREDENTIALS configurado)
    │   ├── Login Azure → Login GHCR
    │   ├── Crear/Actualizar Container Apps (API + Web)
    │   ├── Configurar probes + env vars
    │   ├── Wait for health checks (hasta 3 min)
    │   └── Comentar PR con URLs de preview
    └── Job: destroy (si PR closed)
        ├── Login Azure
        ├── Eliminar Container Apps
        └── Comentar PR: "Preview destroyed"
```

### 5.4 Secrets requeridos en GitHub

| Secret | Descripcion | Requerido para |
|--------|-------------|----------------|
| `AZURE_CREDENTIALS` | Service Principal JSON para Azure | Deploy a ACA |
| `GHCR_PASSWORD` | GitHub PAT con `packages:write` + `packages:read` | Push imagenes a GHCR |
| `GHCR_USERNAME` | GitHub username | Login GHCR |
| `AUTH0_DOMAIN` | Auth0 tenant domain | Preview env |
| `AUTH0_AUDIENCE` | Auth0 API audience | Preview env |
| `AUTH0_CLIENT_ID` | Auth0 Client ID | Preview env |
| `AUTH0_CLIENT_SECRET` | Auth0 Client Secret | Preview env |

> Para configurar los secrets, ejecutar: `.\infrastructure\setup-github-secrets.ps1`

---

## 6. Contenedores

### 6.1 Backend (infrastructure/Dockerfile.api)

```dockerfile
# Stage 1: Build — SDK 10.0, restore, build, publish
# Stage 2: Production — ASP.NET 10.0 runtime, non-root user, HEALTHCHECK
# Stage 3: Development — SDK 10.0 con dotnet-watch
```

**Caracteristicas:**
- ✅ Multi-stage: `build` → `production` → `development`
- ✅ Non-root user `sporthub` en produccion
- ✅ HEALTHCHECK nativo: `curl -f http://localhost:8080/health`
- ✅ Puerto expuesto: `8080`
- ✅ Layer caching optimizado (csproj primero, luego source)
- ✅ Compatible con ACA (sin cambios requeridos)

### 6.2 Frontend (frontend/sport-hub-web/Dockerfile)

```dockerfile
# Stage 1: deps — Node 22, npm ci, separa production y dev node_modules
# Stage 2: builder — Build de Next.js (output: standalone)
# Stage 3: production — Node 22, non-root, HEALTHCHECK
# Stage 4: development — Node 22, hot reload
```

**Caracteristicas:**
- ✅ Multi-stage: `deps` → `builder` → `production` → `development`
- ✅ `next.config.js` con `output: 'standalone'` (imagen optima)
- ✅ Non-root user `nextjs` en produccion
- ✅ HEALTHCHECK nativo: `wget --spider http://localhost:3000/api/health`
- ✅ Puerto expuesto: `3000`
- ✅ Compatible con ACA (ADR-005)

---

## 7. Ejecucion Local

### 7.1 Con Docker Compose (recomendado)

```powershell
# Iniciar toda la infraestructura (API + Web + PostgreSQL + Redis + RabbitMQ + Nginx)
cd infrastructure
docker-compose up -d

# Ver logs
docker-compose logs -f api web

# Verificar health
curl http://localhost:5000/health
curl http://localhost:3000/api/health
```

### 7.2 Sin Docker (desarrollo directo)

```powershell
# Terminal 1: Iniciar dependencias
cd infrastructure
docker-compose up -d postgres redis rabbitmq

# Terminal 2: Iniciar API
cd src/Api/SportHub.Api
dotnet run --environment Development

# Terminal 3: Iniciar Frontend
cd frontend/sport-hub-web
npm run dev
```

### 7.3 Probar el registro localmente

```powershell
# Usando curl
curl -X POST http://localhost:5000/api/identity/register `
  -H "Content-Type: application/json" `
  -d '{"email": "usuario@example.com", "password": "Passw0rd!", "acceptTerms": true}'

# Respuesta esperada: HTTP 201 Created
# {
#   "userId": "guid",
#   "email": "usuario@example.com",
#   "emailVerified": false,
#   "message": "Registro exitoso. Verifica tu correo."
# }
```

---

## 8. Observabilidad

### 8.1 Health Checks (resumen)

| Componente | Liveness | Readiness | Startup |
|------------|----------|-----------|---------|
| API | `GET /health` (sin dependencias) | `GET /health/ready` (con dependencias) | `GET /health` |
| Web | `GET /api/health` | `GET /api/health` | `GET /api/health` |

### 8.2 Logging

- **Formato**: JSON estructurado (Serilog / ILogger)
- **Sink local**: Consola (stdout/stderr)
- **Sink cloud**: Application Insights / Azure Monitor (via OpenTelemetry)
- **Campos incluidos**: `Timestamp`, `Level`, `MessageTemplate`, `Properties.CorrelationId`, `Properties.UserId`, `Properties.RequestPath`

### 8.3 Metricas

- **Stack**: OpenTelemetry → Prometheus → Grafana (cloud)
- **Endpoint metricas**: `GET /metrics` (si se configura OpenTelemetry)
- **Metricas clave**:
  - `http.server.request.duration` — latencia de requests
  - `http.server.requests.count` — total por endpoint/status
  - `identity.registrations.count` — total de registros
  - `identity.registrations.duplicate` — duplicados rechazados
  - `identity.registrations.errors` — errores de registro
  - `db.operations.duration` — latencia de operaciones BD

### 8.4 Alertas sugeridas

| Alerta | Condicion | Severidad |
|--------|-----------|-----------|
| API unhealthy | Liveness probe fails > 3 veces | Critical |
| Alta tasa de errores registro | > 10% errores en 5 min | Warning |
| Latencia alta registro | p95 > 5s en 5 min | Warning |
| DB caida | Readiness probe fails | Critical |

---

## 9. Rollback y Estrategia de Despliegue

### 9.1 Rollback

- **ACA revision mode**: Single revision mode (MVP). Para rollback, desplegar imagen anterior.
- **Comando rollback**:
  ```powershell
  az containerapp update --name ca-preview-{branch}-api --image ghcr.io/.../api:{previous-tag}
  az containerapp update --name ca-preview-{branch}-web --image ghcr.io/.../web:{previous-tag}
  ```

### 9.2 Canary (futuro)

- Cuando se active traffic splitting en ACA:
  ```powershell
  az containerapp ingress traffic set \
    --name ca-sport-staging-api \
    --label-weight staging=90 canary=10
  ```

---

## 10. Archivos Relacionados

| Archivo | Proposito |
|---------|-----------|
| `infrastructure/Dockerfile.api` | Dockerfile multi-stage del backend |
| `frontend/sport-hub-web/Dockerfile` | Dockerfile multi-stage del frontend |
| `infrastructure/docker-compose.yml` | Infraestructura local completa |
| `infrastructure/docker-compose.prod.yml` | Infraestructura produccion |
| `infrastructure/deploy-preview.ps1` | Script de despliegue preview en ACA |
| `infrastructure/deploy-staging.ps1` | Script de despliegue staging en ACA |
| `infrastructure/bicep/main.bicep` | IaC para Azure Container Apps |
| `infrastructure/.env.staging.example` | Ejemplo de variables de entorno staging |
| `infrastructure/setup-github-secrets.ps1` | Configuracion de secrets en GitHub |
| `.github/workflows/ci.yml` | Pipeline CI (build + test + scan) |
| `.github/workflows/deploy-preview.yml` | Pipeline preview (ACA por HU) |
| `src/Api/SportHub.Api/Program.cs` | Health checks y configuracion de endpoints |
| `src/Api/SportHub.Api/Routes/HealthRoutes.cs` | Health check detallado del walking skeleton |
| `frontend/sport-hub-web/src/app/api/health/route.ts` | Health check del frontend |
| `docs/architecture.md` | ADR-005 (ACA), seccion 10 (previews), tabla health checks |
