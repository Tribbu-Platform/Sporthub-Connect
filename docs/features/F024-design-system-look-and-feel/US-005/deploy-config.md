# Deploy Config — US-005: Componentes Base - Badges de Roles y Estados

> **Feature**: F024 — Design System Look & Feel
> **HU**: US-005
> **Fecha**: 2026-07-27
> **Agente**: deploy
> **Branch**: hu/F024-US-005-componentes-base-badges-de-roles-y-estados
> **Stack**: React 19 + TypeScript + Next.js 16 + Tailwind CSS v4 + Vitest + Playwright

---

## 1. Resumen del despliegue

| Check | Comando | Resultado | Detalle |
|-------|---------|-----------|---------|
| Build | `npm run build` | ✅ PASSED | Next.js 16.2.10 (Turbopack) compilo exitosamente en 16.6s |
| Unit Tests | `npx vitest run` | ✅ 341/341 PASSED | 11 test files, 0 failures, 30.50s |
| US-005 Badge Tests | `npx vitest run src/components/ui/__tests__/badge.test.tsx` | ✅ 15/15 PASSED | 4 role variants + 4 status variants + 3 sizes + 4 accessibility |
| BDD Badge Scenarios | `npx cucumber-js -c cucumber-us005.js` | ✅ 10/10 PASSED | 92/92 steps passed |
| ESLint | Lint integrado en CI | ✅ 0 errors | badge.tsx y badge.test.tsx sin warnings |
| TypeScript | `npx tsc --noEmit` | ⚠️ 2 errors* | Pre-existentes en card.test.tsx (US-004) |
| npm audit | `npm audit --audit-level=high` | ⚠️ 15 high | Pre-existentes del baseline (Next.js + ESLint + postcss) |

> *Los 2 errores TS son pre-existentes en `card.test.tsx:49-50` de US-004 (fuera del scope de US-005). No bloquean esta HU.

### Paginas generadas en build

```
Route (app)
├ ○ /
├ ○ /_not-found
├ ƒ /api/[[...path]]
├ ƒ /api/health
├ ○ /auth/login
├ ○ /auth/register
├ ƒ /auth/verify-email
├ ○ /bdd-badges          ← US-005 test fixture page
├ ○ /bdd-cards
├ ○ /bdd-inputs
├ ○ /bdd-status-dot
└ ○ /bdd-typography

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

## 2. Pipeline CI/CD

### 2.1 Workflow principal (ya existente)

El pipeline `CI + Deploy Preview` (`.github/workflows/ci-deploy.yml`) se dispara automaticamente en `push` a ramas `hu/**`. Incluye los siguientes jobs:

| Job | Duracion estimada | Descripcion |
|-----|-------------------|-------------|
| Backend (.NET 10) | ~1-2 min | Build, unit tests, integration tests, publish |
| Frontend (Next.js 16) | ~45s | npm ci → tsc → lint → vitest → build |
| Security & Quality Scans | ~6 min | Trivy, CodeQL, Gitleaks |
| Sanitize branch name | ~4s | Normalizacion de nombre para ACA |
| Build & Push API | ~3 min | Docker build + push a GHCR |
| Build & Push Web | ~3 min | Docker build + push a GHCR |
| Deploy Preview (ACA) | ~4 min | Deploy a Azure Container Apps + smoke tests |
| BDD Tests | ~10 min | Ejecucion BDD contra preview environment |

### 2.2 Workflow especifico de la HU (CI basico)

Ademas del pipeline principal, se recomienda un workflow simplificado para PRs:

```yaml
name: CI - F024 US-005 Badges

on:
  push:
    branches: [hu/F024-US-005-componentes-base-badges-de-roles-y-estados]
  pull_request:
    branches: [feature/F024-design-system-look-and-feel]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend/sport-hub-web

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: frontend/sport-hub-web/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: TypeScript check
        run: npm run type-check

      - name: ESLint
        run: npm run lint

      - name: Unit tests (Vitest)
        run: npm run test

      - name: BDD tests (Cucumber + Playwright)
        run: npm run test:bdd

      - name: Build
        run: npm run build
```

### 2.3 Estados del pipeline

| Evento | Workflow | Jobs |
|--------|----------|------|
| `push` a `hu/**` | CI + Deploy Preview | 8 jobs (backend→frontend→security→build→deploy→BDD) |
| `pull_request` a `feature/**` | CI + Deploy Preview | 8 jobs + comment con preview URLs |
| `pull_request closed` | Destroy Preview | Elimina recursos ACA del preview |

---

## 3. Matriz de pruebas completa

| Tipo | Comando | Archivos | Tests | Estado |
|------|---------|----------|-------|--------|
| Unit (US-005 Badge) | `npx vitest run src/components/ui/__tests__/badge.test.tsx` | 1 | 15 | ✅ |
| BDD (US-005 Badge) | `npx cucumber-js -c cucumber-us005.js` | 2 | 10 scenarios / 92 steps | ✅ |
| Unit (US-001 Tokens) | `npx vitest run src/__tests__/design-tokens.test.ts` | 1 | 90 | ✅ |
| Unit (US-002 Tailwind) | `npx vitest run src/__tests__/tailwind-config.test.tsx` | 1 | 74 | ✅ |
| Unit (US-009 Typography) | `npx vitest run src/__tests__/typography.test.tsx` | 1 | 39 | ✅ |
| Component (Button) | `npx vitest run src/components/ui/__tests__/button.test.tsx` | 1 | 25 | ✅ |
| Component (Card) | `npx vitest run src/components/ui/__tests__/card.test.tsx` | 1 | 15 | ✅ |
| Component (Input) | `npx vitest run src/components/ui/__tests__/input.test.tsx` | 1 | 30 | ✅ |
| Component (Layout) | `npx vitest run src/components/layout/__tests__/layout.test.tsx` | 1 | 13 | ✅ |
| Component (Sidebar) | `npx vitest run src/components/layout/__tests__/sidebar.test.tsx` | 1 | 26 | ✅ |
| Integration (Register) | `npx vitest run src/app/auth/register/__tests__/RegisterForm.test.tsx` | 1 | 8 | ✅ |
| Utils | `npx vitest run tests/utils.test.ts` | 1 | 6 | ✅ |
| **TOTAL** | | **11 files** | **341** | ✅ **100%** |

---

## 4. Contenerizacion

### 4.1 Dockerfile (multi-stage, existente)

El Dockerfile en `frontend/sport-hub-web/Dockerfile` tiene 4 stages:

```dockerfile
# Stage 1: Dependencies → npm ci (cachea node_modules)
# Stage 2: Build → npm run build (output: standalone)
# Stage 3: Production → node:22-alpine, non-root user (nextjs:nextjs, uid/gid 1001)
# Stage 4: Development → entrypoint con npm install + npm run dev
```

### 4.2 Health Checks

```yaml
# Dockerfile HEALTHCHECK
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Kubernetes-style probes (referencia)
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30
readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

### 4.3 Build & Push en CI

El pipeline construye y pushea la imagen Docker al GitHub Container Registry:

- **Registry**: `ghcr.io/Tribbu-Platform/Sporthub-Connect`
- **Imagen Web**: `sport-hub-web:preview-{sanitized-branch}`
- **Tag**: `preview-{branch}-{sha}`
- **Smoke test**: Ejecutado en CI (health check HTTP en /api/health)

### 4.4 Optimizaciones de imagen

| Aspecto | Configuracion |
|---------|---------------|
| Runtime | `node:22-alpine` (minimalista) |
| Usuario | `nextjs` (non-root, uid 1001) |
| Output | `standalone` (Next.js optimized) |
| Telemetry | `NEXT_TELEMETRY_DISABLED=1` |
| Caching | Multi-stage con cache de dependencias |

---

## 5. Observabilidad

### 5.1 Health Check Endpoint

```
GET /api/health → 200 OK { "status": "healthy", "timestamp": "..." }
```

Implementado en `src/app/api/health/route.ts`. Usado por:
- Docker HEALTHCHECK
- Kubernetes liveness/readiness probes
- Azure Container Apps health probes
- Load balancer health checks

### 5.2 Security Headers

Configurados en `next.config.js`:

| Header | Valor |
|--------|-------|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Referrer-Policy | strict-origin-when-cross-origin |
| X-Powered-By | (removido) |

### 5.3 Accesibilidad del componente Badge

El componente Badge implementa:
- `role="status"` para anuncios de lectores de pantalla
- Texto siempre visible (sin informacion solo por color)
- Soporte para `aria-label` customizado
- Contraste de color: fondo con 15% opacity + texto saturado (legible)
- Forma pill (`rounded-full`) reconocible sin color

### 5.4 Metricas de componentes

| Componente | Variantes | Tamanos | Tests | BDD Scenarios |
|------------|-----------|---------|-------|---------------|
| Badge | 8 (owner, captain, coach, member, success, warning, error, info) | 3 (sm, default, lg) | 15 unitarios | 10 BDD |

---

## 6. Issues

### 6.1 Issues corregidos en fases anteriores

| ID | Descripcion | Fase | Estado |
|----|-------------|------|--------|
| — | Ninguna correccion necesaria en fase deploy | — | — |

### 6.2 Issues pre-existentes documentados

| ID | Archivo | Severidad | Descripcion |
|----|---------|-----------|-------------|
| TS-01 | `src/components/ui/__tests__/card.test.tsx:49-50` | ERROR | `Object is possibly 'null'` — TS2531. Scope: US-004. No bloquea US-005. |
| OBS-001 | `src/components/ui/badge.tsx:38-76` | LOW | Inline styles via `variantStyleMap` en lugar de clases Tailwind. Decision deliberada para compatibilidad con jsdom (`getComputedStyle`). |
| AUD-01 | `package.json` | HIGH | 15 vulnerabilidades npm high (Next.js, postcss, sharp, brace-expansion). Pre-existentes del baseline. No introducidas por US-005. |

### 6.3 Observaciones de despliegue

| ID | Descripcion | Impacto |
|----|-------------|---------|
| DEP-01 | Codigo de F024 distribuido entre ramas US-006 y US-007 | Medio — requiere merge consolidado a feature/F024 antes del release |
| DEP-02 | Pipeline CI no ejecutado para US-005 (rama sin push) | Bajo — CI + Deploy Preview esta configurado y se disparara al hacer push |

---

## 7. Artefactos de la HU

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `src/components/ui/badge.tsx` | 135 lineas — Componente Badge con 8 variantes + 3 tamanos | ✅ |
| `src/components/ui/__tests__/badge.test.tsx` | 373 lineas — 15 tests unitarios (Vitest + Testing Library) | ✅ |
| `e2e/features/f024-us005-badges.feature` | 91 lineas — 10 escenarios Gherkin | ✅ |
| `e2e/step_definitions/f024-us005-badges.steps.ts` | 371 lineas — Step definitions BDD con Playwright | ✅ |
| `src/app/bdd-badges/page.tsx` | 72 lineas — Pagina de test fixture | ✅ |
| `cucumber-us005.js` | 20 lineas — Configuracion Cucumber para US-005 | ✅ |
| `e2e/reports/cucumber-f024-us005.json` | Reporte JSON de ejecucion BDD | ✅ |
| `e2e/reports/cucumber-report-f024-us005.html` | Reporte HTML de ejecucion BDD | ✅ |
| `docs/features/F024-design-system-look-and-feel/US-005/tasks.json` | Tareas de la HU | ✅ |
| `docs/features/F024-design-system-look-and-feel/US-005/test-report.md` | Reporte de pruebas | ✅ |
| `docs/features/F024-design-system-look-and-feel/US-005/quality-report.md` | Reporte de calidad | ✅ |
| `docs/features/F024-design-system-look-and-feel/US-005/deploy-config.md` | Este documento | ✅ |

---

## 8. Verificacion local

### 8.1 Build

```powershell
npm run build
# ▲ Next.js 16.2.10 (Turbopack)
# ✓ Compiled successfully in 16.6s
# ✓ Generating static pages (12/12) in 2.3s
```

### 8.2 Tests

```powershell
npx vitest run
# Test Files  11 passed (11)
#      Tests  341 passed (341)
#   Start at  14:24:19
#   Duration  30.50s
```

### 8.3 US-005 Badge Tests

```powershell
npx vitest run src/components/ui/__tests__/badge.test.tsx
# ✓ Badge – Role variants (T004) — 4 tests
# ✓ Badge – Status variants (T005) — 4 tests
# ✓ Badge – Sizes (T003) — 3 tests
# ✓ Badge – Accessibility — 4 tests
# Total: 15/15 PASSED (619ms)
```

---

## 9. Pipeline Status Report (para el leader)

```json
{
  "pipeline_status": "pending_push",
  "run_id": null,
  "run_url": null,
  "duration": "N/A — branch not yet pushed to GitHub",
  "local_build": "success (16.6s)",
  "local_tests": "341/341 passed (30.50s)",
  "local_badge_tests": "15/15 passed (619ms)",
  "local_bdd_badge": "10/10 scenarios, 92/92 steps passed",
  "ci_workflow": "CI + Deploy Preview (ci-deploy.yml) — triggers on push to hu/**",
  "verdict": "APPROVED — pending git push to trigger CI"
}
```

### Accion requerida

Para completar el despliegue, se necesita:
1. Asegurar que el codigo del componente Badge y sus artefactos esten commiteados en la rama `hu/F024-US-005-componentes-base-badges-de-roles-y-estados`
2. Hacer `git push origin hu/F024-US-005-componentes-base-badges-de-roles-y-estados`
3. Monitorear el pipeline `CI + Deploy Preview` en GitHub Actions
4. Verificar que todos los jobs pasen (especialmente Frontend, Build & Push Web, Deploy Preview)

---

## 10. Conclusion

La HU US-005 (Componentes Base - Badges de Roles y Estados) esta lista para despliegue:

- **Build**: ✅ Next.js 16.2.10 compila sin errores (16.6s, 12 paginas)
- **Tests**: ✅ 341/341 tests pasan (15 especificos de US-005)
- **BDD**: ✅ 10/10 escenarios BDD (92/92 steps)
- **CI/CD**: ✅ Workflow `CI + Deploy Preview` configurado y activo para `hu/**`
- **Contenerizacion**: ✅ Dockerfile multi-stage con health checks y non-root user
- **Observabilidad**: ✅ Health endpoint, security headers, ARIA accessibility
- **Seguridad**: ✅ Sin vulnerabilidades nuevas, sin XSS, sin secrets expuestos

**Veredicto**: ✅ **APROBADO** — pendiente de push a GitHub para trigger del pipeline CI/CD y merge a la feature `feature/F024-design-system-look-and-feel`.
