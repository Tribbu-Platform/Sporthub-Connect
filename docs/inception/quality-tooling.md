# Quality Tooling — SportHub Connect

> Definicion de herramientas de calidad, seguridad y analisis estatico para el ciclo de desarrollo.

## 1. Analisis Estatico de Codigo

| Herramienta | Capa | Proposito | Configuracion |
|-------------|------|-----------|---------------|
| **SonarAnalyzer.CSharp** | Backend .NET | Roslyn analyzers para bugs, code smells, vulnerabilidades | `.editorconfig` + reglas por proyecto |
| **NetArchTest** | Backend .NET | Tests de arquitectura: dependencias entre modulos, capas, convenciones | Tests en CI que fallan el build si se violan reglas |
| **ESLint** | Frontend React/TS | Linting con `@typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` | `.eslintrc.js` con `strict: true` |
| **Biome** | Frontend | Formateo y linting rapido (alternativa a Prettier + ESLint) | `biome.json` |
| **TypeScript** | Frontend | `strict: true`, `noUnusedLocals`, `noUnusedParameters` | `tsconfig.json` |

## 2. Seguridad

| Herramienta | Proposito | Cuando se ejecuta |
|-------------|-----------|-------------------|
| **`dotnet list package --vulnerable`** | Escaneo de CVEs en paquetes NuGet | CI en cada PR |
| **`npm audit`** | Escaneo de CVEs en dependencias npm | CI en cada PR |
| **OWASP ZAP** | Escaneo de seguridad dinamico contra la API | Pre-release, staging |
| **Bearer** / **Snyk** | SAST (Static Application Security Testing) | CI en cada PR |
| **Trivy** | Escaneo de vulnerabilidades en imagenes Docker | CI en build de imagenes |

## 3. Cobertura y Testing

| Herramienta | Capa | Proposito | Umbral |
|-------------|------|-----------|--------|
| **coverlet** | Backend | Cobertura de codigo .NET | >= 80% linea, >= 70% branch |
| **ReportGenerator** | Backend | Reportes de cobertura en HTML/XML | Integrado con CI |
| **Vitest coverage (c8/istanbul)** | Frontend | Cobertura de codigo TS/TSX | >= 80% statements |
| **Playwright** | E2E | Tests end-to-end cross-browser | Flujos criticos |
| **k6** | Carga | Pruebas de carga y estres | Pre-release |

## 4. CI/CD Pipeline (GitHub Actions)

### Workflow: `ci.yml` (por PR)

```yaml
jobs:
  backend:
    - dotnet build
    - dotnet test --collect:"XPlat Code Coverage"
    - dotnet list package --vulnerable
    - NetArchTest (validacion de arquitectura)
    
  frontend:
    - npm ci
    - npm run lint (ESLint + Biome)
    - npm run typecheck (tsc --noEmit)
    - npm test -- --coverage (Vitest)
    - npm audit --audit-level=high
    
  security:
    - Trivy image scan
    - Snyk / Bearer SAST
    
  e2e:
    - Playwright tests (flujos criticos)
```

### Workflow: `cd-staging.yml`

- Build + push imagenes Docker
- Deploy a Azure Container Apps (staging)
- Smoke tests (health checks)
- Playwright E2E en staging

### Workflow: `cd-production.yml`

- Aprobacion manual requerida
- Deploy a Azure Container Apps (production)
- Post-deploy health checks
- Rollback automatico si health checks fallan

## 5. Calidad de Codigo (Gates)

| Gate | Herramienta | Cuando | Accion al fallar |
|------|------------|--------|-----------------|
| Build | `dotnet build` / `npm run build` | PR | Bloquear merge |
| Tests unitarios | xUnit / Vitest | PR | Bloquear merge |
| Cobertura | coverlet / c8 | PR | Alerta (< umbral), bloqueo (< 50%) |
| Linting | ESLint / SonarAnalyzer | PR | Bloquear merge |
| Type check | `tsc --noEmit` | PR | Bloquear merge |
| Vulnerabilidades | `dotnet list package --vulnerable` / `npm audit` | PR | Bloquear merge si critical/high |
| Arquitectura | NetArchTest | PR | Bloquear merge |
| E2E criticos | Playwright | Pre-merge a develop | Bloquear merge |

## 6. Observabilidad

| Herramienta | Proposito |
|-------------|-----------|
| **Serilog** | Logging estructurado (JSON) con enriquecimiento (CorrelationId, UserId, Module) |
| **OpenTelemetry** | Trazas distribuidas, metricas. Instrumentacion automatica ASP.NET Core, EF Core, HttpClient, MassTransit |
| **Jaeger** (dev) / **Azure Monitor** (prod) | Backend de trazas |
| **Prometheus** (dev) / **Azure Monitor** (prod) | Backend de metricas |
| **Grafana** | Dashboards: latencia p95, throughput, error rate, eventos publicados/consumidos, conexiones SignalR, colas RabbitMQ |
| **Seq** (dev local) | Visualizacion de logs estructurados en desarrollo |

## 7. Health Checks

Todos los proyectos exponen:

| Endpoint | Proposito | Usado por |
|----------|-----------|-----------|
| `/health` | Liveness: ¿el proceso esta vivo? | Orquestador (ACA, K8s) |
| `/health/ready` | Readiness: ¿dependencias listas? (PostgreSQL, Redis, RabbitMQ) | Load balancer, reinicio de pods |
| `/health/startup` | Startup: ¿inicializacion completada? | Orquestador, control de arranque |

## 8. Docker

| Practica | Herramienta |
|----------|------------|
| Multi-stage builds | `Dockerfile` (SDK stage -> runtime stage) |
| Imagenes minimas | `mcr.microsoft.com/dotnet/aspnet:10.0` (runtime), `node:22-alpine` (frontend) |
| Docker Compose | Entorno dev completo: API, PostgreSQL, Redis, RabbitMQ, Frontend |
| Health checks en Docker | `HEALTHCHECK` en Dockerfile |
| Non-root user | `USER app` en imagenes de produccion |

## 9. Reglas de Calidad por Consola

### Backend .NET
```bash
dotnet build                    # Compilacion obligatoria
dotnet test                     # Tests unitarios
dotnet test --collect:"XPlat Code Coverage"  # Cobertura
dotnet format --verify-no-changes # Formateo consistente
dotnet list package --vulnerable  # CVEs
```

### Frontend React
```bash
npm run build          # Build de produccion
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm test -- --coverage # Vitest + cobertura
npm audit              # CVEs npm
```

## 10. Roslyn Analyzers (Implementado)

> Configurado: 2026-07-17

### Configuracion global

Se creo `Directory.Build.props` en la raiz del proyecto con:

- **`<AnalysisLevel>latest-all</AnalysisLevel>`**: Todas las reglas de .NET habilitadas
- **`<EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>`**: Code style forzado en build (no solo IDE)
- **`<WarningsAsErrors>`**: Reglas de seguridad CA5350-CA5403 y confiabilidad tratadas como errores
- **`SonarAnalyzer.CSharp`** v10.9.0: Analyzer global para todos los proyectos

### Reglas en `.editorconfig`

| Categoria | Cantidad | Severidad |
|-----------|----------|-----------|
| Seguridad (CA53xx) | 60+ | **error** |
| Sonar Security Hotspots (Sxxxx) | 10 | **error** |
| Sonar Bugs | 30+ | error/warning |
| Sonar Code Smells | 40+ | warning/suggestion |
| Performance (CA18xx) | 15 | warning/suggestion |
| Design (CA10xx) | 10 | warning |

### Quality Gates locales

| Umbral | Herramienta | Valor |
|--------|-------------|-------|
| Complejidad ciclomatica maxima | SonarAnalyzer S1541 | 10 |
| Complejidad cognitiva maxima | SonarAnalyzer S3776 | 15 |
| Parametros maximos por metodo | SonarAnalyzer S107 | 7 |
| Profundidad de herencia maxima | SonarAnalyzer S110 | 5 |
| Nesting maximo de control flow | SonarAnalyzer S134 | 3 |

## 11. Quality Gate Script (Implementado)

> Archivo: `scripts/quality-gate.ps1`

Script PowerShell unificado que ejecuta todas las validaciones de calidad en local. Uso:

```powershell
# Analisis completo (backend + frontend)
.\scripts\quality-gate.ps1

# Solo backend
.\scripts\quality-gate.ps1 -BackendOnly

# Solo frontend
.\scripts\quality-gate.ps1 -FrontendOnly

# Sin tests (solo lint + build + SCA)
.\scripts\quality-gate.ps1 -SkipTests

# Salida JSON para CI/CD
.\scripts\quality-gate.ps1 -JsonOutput
```

### Checks ejecutados

| # | Check | Backend | Frontend |
|---|-------|---------|----------|
| 1 | Formateo | `dotnet format --verify-no-changes` | — |
| 2 | Roslyn Analyzers | `dotnet build` (CA + Sonar rules) | — |
| 3 | Lint | — | `npm run lint` (ESLint) |
| 4 | Type Check | — | `npm run type-check` (tsc) |
| 5 | Tests | `dotnet test` (unit + integration + architecture) | `npm test -- --coverage` (Vitest) |
| 6 | SCA | `dotnet list package --vulnerable` | `npm audit --audit-level=high` |

### Exit code

- `0` = Todos los checks pasaron
- `1` = Al menos un check fallo
- Compatible con CI/CD (GitHub Actions, Azure DevOps)

## 12. Baseline de Calidad (2026-07-17)

> Los reportes detallados del baseline se almacenan en `docs/quality/baseline/`.

### Resumen del baseline inicial

| Analisis | Grade | Criticos | High | Medium |
|----------|:-----:|:--------:|:----:|:------:|
| Arquitectura Backend (.NET) | **C** | 7 | 10 | 11 |
| Seguridad Backend (OWASP) | **D** | 4 | 15 | 10 |
| Arquitectura Frontend (React) | **B** | 0 | 2 | 9 |
| Seguridad Frontend (OWASP) | **C** | 2 | 4 | 4 |

### Vulnerabilidades en dependencias (SCA)

| Ecosistema | High | Critical |
|------------|:----:|:--------:|
| NuGet (.NET) | 2 | 0 |
| npm (Frontend) | 0 | 0 |

### Hallazgos criticos identificados

1. **Sin autenticacion JWT configurada** — `Program.cs` tiene `UseAuthentication()`/`UseAuthorization()` comentados
2. **Credenciales hardcodeadas** — `appsettings.json` y `docker-compose.yml` contienen passwords en texto plano
3. **Sin HTTPS/HSTS** — La API y el frontend no fuerzan HTTPS ni envian header HSTS
4. **Sin CSP (Content-Security-Policy)** — El frontend carece de header CSP
5. **CORS con wildcard `*`** — Nginx permite cualquier origen
6. **Vulnerabilidad en Microsoft.OpenApi 2.0.0** — GHSA-v5pm-xwqc-g5wc (HIGH)
7. **Vulnerabilidad en SQLitePCLRaw 2.1.11** — GHSA-2m69-gcr7-jv3q (HIGH)

### Proxima revision del baseline

El baseline debe re-ejecutarse al completar cada feature para comparar la evolucion de la calidad. Usar:

```powershell
.\scripts\quality-gate.ps1 -JsonOutput > docs/quality/baseline/$(Get-Date -Format 'yyyy-MM-dd')-quality-gate.json
```
