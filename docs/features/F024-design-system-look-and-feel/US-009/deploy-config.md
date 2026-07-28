# Deploy Config — US-009: Tipografía y Jerarquía Visual (Montserrat)

> **Feature**: F024 — Design System Look & Feel
> **HU**: US-009
> **Fecha**: 2026-07-27
> **Agente**: deploy
> **Branch**: `hu/F024-US-009-tipografia-y-jerarquia-visual-montserrat`
> **Stack**: React 19 + TypeScript + Next.js 16 + Tailwind CSS v4 + Vitest

---

## 1. Resumen del despliegue

| Check | Comando | Resultado | Detalle |
|-------|---------|-----------|---------|
| Build | `npm run build` | ✅ PASSED | Next.js 16.2.10 (Turbopack) compiló exitosamente en 1913ms |
| Unit Tests | `npx vitest run` | ✅ 341/341 PASSED | 11 test files, 0 failures |
| ESLint | `npx eslint src/ --ext .ts,.tsx` | ✅ 0 errors, 1 warning | Warning pre-existente en `input.tsx` (US-006, fuera de scope) |
| TypeScript | `npx tsc --noEmit` | ⚠️ 2 errors | Pre-existentes en `card.test.tsx` (US-004, fuera de scope) |

---

## 2. Pipeline CI/CD (GitHub Actions)

### 2.1 Workflow para esta HU

```yaml
name: CI - F024 US-009 Tipografía y Jerarquía Visual (Montserrat)
on:
  push:
    branches: [hu/F024-US-009-tipografia-y-jerarquia-visual-montserrat]
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
        run: npx tsc --noEmit

      - name: ESLint
        run: npx eslint src/ --ext .ts,.tsx

      - name: Unit tests
        run: npx vitest run --coverage

      - name: Build
        run: npm run build
```

### 2.2 Resultados del pipeline local

| Métrica | Valor |
|---------|-------|
| Build time | 1913ms (Turbopack) |
| Test files | 11 (todas pasando) |
| Total tests | 341 |
| Test duration | 7.25s |
| ESLint errors | 0 |
| ESLint warnings | 1 (pre-existente) |
| TS errors (US-009) | 0 |

### 2.3 Matrix de pruebas por tipo

| Tipo | Comando | Archivos | Tests | Estado |
|------|---------|----------|-------|--------|
| Unit (typography) | `npx vitest run src/__tests__/typography.test.tsx` | 1 | 39 | ✅ PASSED |
| Unit (design tokens) | `npx vitest run src/__tests__/design-tokens.test.ts` | 1 | 90 | ✅ PASSED |
| Unit (tailwind config) | `npx vitest run src/__tests__/tailwind-config.test.tsx` | 1 | 74 | ✅ PASSED |
| Component (button) | `npx vitest run src/components/ui/__tests__/button.test.tsx` | 1 | 25 | ✅ PASSED |
| Component (badge) | `npx vitest run src/components/ui/__tests__/badge.test.tsx` | 1 | 15 | ✅ PASSED |
| Component (card) | `npx vitest run src/components/ui/__tests__/card.test.tsx` | 1 | 15 | ✅ PASSED |
| Component (input) | `npx vitest run src/components/ui/__tests__/input.test.tsx` | 1 | 30 | ✅ PASSED |
| Component (layout) | `npx vitest run src/components/layout/__tests__/layout.test.tsx` | 1 | 13 | ✅ PASSED |
| Component (sidebar) | `npx vitest run src/components/layout/__tests__/sidebar.test.tsx` | 1 | 26 | ✅ PASSED |
| Integration (register) | `npx vitest run src/app/auth/register/__tests__/RegisterForm.test.tsx` | 1 | 8 | ✅ PASSED |
| Utils | `npx vitest run tests/utils.test.ts` | 1 | 6 | ✅ PASSED |

---

## 3. Contenerización

### 3.1 Dockerfile (multi-stage)

La HU US-009 usa el Dockerfile existente del frontend (`frontend/sport-hub-web/Dockerfile`), sin modificaciones requeridas.

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /app/public
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]
```

### 3.2 Health Checks

```yaml
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

### 3.3 Kubernetes manifests (si aplica)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sporthub-web
  labels:
    app: sporthub-web
    hu: US-009
spec:
  replicas: 2
  selector:
    matchLabels:
      app: sporthub-web
  template:
    metadata:
      labels:
        app: sporthub-web
        hu: US-009
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
      containers:
        - name: sporthub-web
          image: ghcr.io/tribbu-platform/sporthub-web:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: API_UPSTREAM_URL
              valueFrom:
                configMapKeyRef:
                  name: sporthub-config
                  key: api-upstream-url
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
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
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
```

---

## 4. Observabilidad

### 4.1 Health Check Endpoint

```
GET /api/health → 200 OK
```

La HU US-009 no introduce endpoints nuevos; hereda el health check existente.

### 4.2 Logging estructurado

Los estilos CSS y tipografía no generan logs. La trazabilidad de US-009 se mantiene mediante:
- **CSS utility classes**: verificables via `getComputedStyle()` en navegadores reales
- **39 tests unitarios**: `typography.test.tsx` verifica cada nivel tipográfico
- **11 tests BDD**: `f024-us009-typography.feature` verifica renderizado real en Playwright/Chromium

### 4.3 Métricas de diseño (design system compliance)

| Métrica | Valor | Estado |
|---------|-------|--------|
| Niveles tipográficos definidos | 7 + 1 (.text-metric) | ✅ |
| Font weights cargados | 4 (400, 500, 600, 700) | ✅ |
| Montserrat cargada correctamente | `next/font/google` con `display: 'swap'` | ✅ |
| Responsive scaling (headlines -15% mobile) | `@media (max-width: 767px)` | ✅ |
| Body texts sin scaling en mobile | Verificado | ✅ |
| Variable CSS `--font-montserrat` | Enlazada a `<html>` | ✅ |
| Sin referencias residuales a Inter | Verificado | ✅ |
| Text-transform uppercase en label-caps | Verificado | ✅ |

---

## 5. Issues corregidos durante el despliegue

### 5.1 FIX-01: `parsePx` declarada pero no usada (LOW)

**Archivo**: `src/__tests__/typography.test.tsx:147`
**Problema**: ESLint warning `@typescript-eslint/no-unused-vars` — la función `parsePx` era declarada pero nunca invocada.
**Fix**: Eliminada la función no utilizada (4 líneas).
**Estado**: ✅ Corregido

### 5.2 FIX-02: `coverage/` no ignorado por ESLint (LOW)

**Archivo**: `eslint.config.mjs:7`
**Problema**: ESLint escaneaba archivos auto-generados en `coverage/`, generando warnings en `coverage/block-navigation.js`.
**Fix**: Agregado `'coverage'` al array `ignores` en `eslint.config.mjs`.
**Estado**: ✅ Corregido

---

## 6. Issues pre-existentes documentados

| ID | Archivo | Severidad | Descripción |
|----|---------|-----------|-------------|
| TS-01 | `src/components/ui/__tests__/card.test.tsx:49-50` | ERROR | `Object is possibly 'null'` — TS2531. Scope: US-004 (Cards). No bloquea el despliegue de US-009. |
| ESL-01 | `src/components/ui/input.tsx:11` | WARNING | `errorMessage` declarado pero no usado. Scope: US-006 (Input Fields). |
| AUD-01 | `package.json` | HIGH | 15 vulnerabilidades npm high (next, postcss, sharp, eslint). Pre-existentes del baseline. |
| TD-PRE-01 | `src/__tests__/design-tokens.test.ts` | MEDIUM | 77 tests de tokens CSS fallan en jsdom por directivas `@utility` que jsdom no puede parsear → los tests fueron refactorizados en US-001 deploy. Actualmente pasan 90/90. |
| TD-PRE-02 | `src/__tests__/tailwind-config.test.tsx` | MEDIUM | 74 tests pasan exitosamente en jsdom gracias al parser CSS custom que convierte `@utility` a clases planas. |

---

## 7. Artefactos de la HU

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/app/layout.tsx` | Carga de Montserrat via `next/font/google` con `display: 'swap'` y `variable: '--font-montserrat'` | ✅ |
| `src/app/globals.css` | 418 líneas — 7 niveles tipográficos `@utility` + `.text-metric` + responsive scaling | ✅ |
| `src/__tests__/typography.test.tsx` | 347 líneas — 39 tests unitarios (font-size, weight, line-height, letter-spacing, font-family, text-transform) | ✅ (FIX-01 aplicado) |
| `src/app/bdd-typography/page.tsx` | Página de test BDD con todos los niveles tipográficos renderizados | ✅ |
| `e2e/features/f024-us009-typography.feature` | 11 escenarios Gherkin | ✅ |
| `e2e/step_definitions/f024-us009-typography.steps.ts` | Step definitions con Playwright | ✅ |
| `eslint.config.mjs` | ESLint config con `coverage/` ignorado | ✅ (FIX-02 aplicado) |

---

## 8. Estrategia de rollback

La tipografía es puramente CSS. El rollback consiste en revertir los cambios en:

1. `src/app/layout.tsx` — Restaurar font a Inter (si aplica) o eliminar `Montserrat` import
2. `src/app/globals.css` — Eliminar bloques `@utility text-*` y media query responsive
3. `src/app/bdd-typography/page.tsx` — Eliminar página de test (sin impacto en prod)

**Canary deployment**: Si se usa feature flags, la tipografía puede activarse/desactivarse via CSS variable toggle o cambio de clase en `<html>`.

---

## 9. Conclusión

La HU US-009 (Tipografía y Jerarquía Visual — Montserrat) está lista para despliegue:

- ✅ Build compila exitosamente (Next.js 16.2.10 - Turbopack, 1913ms)
- ✅ 341/341 unit tests pasando (0 failures)
- ✅ ESLint: 0 errors (1 warning pre-existente, no US-009)
- ✅ TypeScript: 0 errores en código US-009 (2 errores pre-existentes en US-004)
- ✅ Montserrat cargada via `next/font/google` con `display: 'swap'`
- ✅ 8 clases utilitarias tipográficas definidas como `@utility` en Tailwind v4
- ✅ Responsive scaling (-15% headlines en mobile, body texts sin cambio)
- ✅ 11/11 BDD tests pasando (Playwright + navegador real)
- ✅ 39/39 unit tests de tipografía pasando
- ✅ 2 issues menores corregidos (FIX-01, FIX-02)

**Veredicto**: ✅ **APROBADO para merge** a la feature `feature/F024-design-system-look-and-feel`.
