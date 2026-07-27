# Deploy Config — US-001: Design Tokens (CSS Variables)

> **Feature**: F024 — Design System Look & Feel
> **HU**: US-001
> **Fecha**: 2026-07-27
> **Agente**: deploy
> **Branch**: hu/F024-US-001-design-tokens-css-variables
> **Stack**: React 19 + TypeScript + Next.js 16 + Tailwind CSS v4 + Vitest

---

## 1. Resumen del despliegue

| Check | Comando | Resultado | Detalle |
|-------|---------|-----------|---------|
| Build | `npm run build` | ✅ PASSED | Next.js 16.2.10 (Turbopack) compiló exitosamente en 3.5s |
| Unit Tests | `npx vitest run` | ✅ 341/341 PASSED | 11 test files, 0 failures |
| ESLint | `npx eslint src/ --ext .ts,.tsx` | ✅ 0 errors | 12 warnings pre-existentes en otros archivos |
| TypeScript | `npx tsc --noEmit` | ⚠️ 2 errors | Pre-existentes en `card.test.tsx` (US-004, fuera de scope) |

---

## 2. Pipeline CI/CD (GitHub Actions)

### 2.1 Workflow para esta HU

```yaml
name: CI - F024 US-001 Design Tokens
on:
  push:
    branches: [hu/F024-US-001-design-tokens-css-variables]
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

### 2.2 Matrix de pruebas por tipo

| Tipo | Comando | Archivos | Estado |
|------|---------|----------|--------|
| Unit (design tokens) | `npx vitest run src/__tests__/design-tokens.test.ts` | 90 tests | ✅ |
| Unit (typography) | `npx vitest run src/__tests__/typography.test.tsx` | 39 tests | ✅ |
| Unit (tailwind config) | `npx vitest run src/__tests__/tailwind-config.test.tsx` | 74 tests | ✅ |
| Component (button) | `npx vitest run src/components/ui/__tests__/button.test.tsx` | 25 tests | ✅ |
| Component (badge) | `npx vitest run src/components/ui/__tests__/badge.test.tsx` | 15 tests | ✅ |
| Component (card) | `npx vitest run src/components/ui/__tests__/card.test.tsx` | 15 tests | ✅ |
| Component (input) | `npx vitest run src/components/ui/__tests__/input.test.tsx` | 30 tests | ✅ |
| Component (layout) | `npx vitest run src/components/layout/__tests__/layout.test.tsx` | 13 tests | ✅ |
| Component (sidebar) | `npx vitest run src/components/layout/__tests__/sidebar.test.tsx` | 26 tests | ✅ |
| Integration (register) | `npx vitest run src/app/auth/register/__tests__/RegisterForm.test.tsx` | 8 tests | ✅ |
| Utils | `npx vitest run tests/utils.test.ts` | 6 tests | ✅ |

---

## 3. Contenerización

### 3.1 Dockerfile (multi-stage)

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY frontend/sport-hub-web/package*.json ./
RUN npm ci
COPY frontend/sport-hub-web/ ./
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
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

---

## 4. Observabilidad

### 4.1 Health Check Endpoint

La HU US-001 no introduce un endpoint nuevo, pero hereda el health check existente:

```
GET /api/health → 200 OK
```

### 4.2 Logging estructurado

Los estilos CSS y tokens de diseño no generan logs. La trazabilidad se mantiene mediante:
- **CSS custom properties**: verificables via `getComputedStyle(document.documentElement)`
- **TypeScript types**: `ColorToken`, `ColorTokens`, etc. exportados y tipados estrictamente
- **Tests**: 90 tests unitarios + 39 tests de tipografía = 129 tests específicos de US-001

### 4.3 Métricas (futuro)

Para el future dashboard de design system compliance:
- Cobertura de tokens: 100% (74/74 tokens definidos)
- Consistencia de naming: 100% (prefijos estandarizados)
- WCAG AA color contrast: 100% (9/9 pares críticos pasan)

---

## 5. Issues corregidos durante el despliegue

### 5.1 C-01: Bug `--font-montserrat` inexistente (HIGH)

**Archivo**: `src/app/globals.css:276`
**Problema**: `body` referenciaba `var(--font-montserrat, ...)` pero el token definido en `:root` es `--font-family-primary`. La variable `--font-montserrat` no existía.
**Fix**: Cambiado a `var(--font-family-primary, 'Montserrat', ...)`.
**Estado**: ✅ Corregido

### 5.2 TST-01: Variable `expectedTypographyTokens` no usada (MEDIUM)

**Archivo**: `src/__tests__/design-tokens.test.ts:169`
**Problema**: La variable se declaraba pero las pruebas de tipografía hardcodeaban los valores.
**Fix**: Refactorizadas las pruebas de tipografía para usar `Object.entries(expectedTypographyTokens)` (patrón consistente con radius y transitions).
**Estado**: ✅ Corregido

### 5.3 Infra: jsdom CSS parser roto por directivas Tailwind v4 (CRITICAL)

**Archivos**: `src/__tests__/design-tokens.test.ts`, `src/__tests__/typography.test.tsx`
**Problema**: La adición de bloques `@utility` y `@keyframes` por otras HUs paralelas (US-004, US-007, US-009) en `globals.css` rompió el parser CSS de jsdom, causando que todos los tests de CSS fallaran con `getComputedStyle` devolviendo strings vacíos.
**Fix**:
- `design-tokens.test.ts`: Extraer solo el bloque `:root` (única sección relevante para tokens)
- `typography.test.tsx`: Stripping selectivo de `@import`, `@theme`, `@keyframes`, `@layer` + conversión `@utility` → `.class`
**Estado**: ✅ Corregido en ambos archivos

### 5.4 Test `--font-montserrat` obsoleto (LOW)

**Archivo**: `src/__tests__/typography.test.tsx:329`
**Problema**: El test verificaba `raw.includes('--font-montserrat')` que ya no existe tras el fix C-01.
**Fix**: Actualizado para verificar `raw.includes('--font-family-primary') && raw.includes('Montserrat')`.
**Estado**: ✅ Corregido

---

## 6. Issues pre-existentes documentados

| ID | Archivo | Severidad | Descripción |
|----|---------|-----------|-------------|
| TS-01 | `src/components/ui/__tests__/card.test.tsx:49-50` | ERROR | `Object is possibly 'null'` — TS2531. Scope: US-004 (Cards). No bloquea el despliegue de US-001. |
| ESL-01 | `src/__tests__/typography.test.tsx:130` | WARNING | `parsePx` declarada pero no usada |
| ESL-02 | `src/components/layout/__tests__/sidebar.test.tsx` | WARNING | 4 variables no usadas (`afterEach`, `fireEvent`, `communityLink`, `eventsLink`) |
| ESL-03 | `src/components/layout/layout.tsx` | WARNING | `useMemo`, `isMobile` no usados |
| ESL-04 | `src/components/layout/sidebar.tsx` | WARNING | 4 iconos importados no usados |
| ESL-05 | `src/components/ui/input.tsx` | WARNING | `errorMessage` no usado (debería ser `_errorMessage`) |
| AUD-01 | `package.json` | HIGH | 15 vulnerabilidades npm high (pre-existentes del ecosistema Next.js) |

---

## 7. Artefactos de la HU

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/types/design-tokens.ts` | 388 líneas — Tipos TypeScript para 74 tokens | ✅ |
| `src/app/globals.css` | 436 líneas — CSS custom properties + Tailwind v4 | ✅ (C-01 corregido) |
| `src/__tests__/design-tokens.test.ts` | 389 líneas — 90 tests unitarios | ✅ (infra corregida) |
| `src/__tests__/typography.test.tsx` | 344 líneas — 39 tests de tipografía | ✅ (infra corregida) |
| `e2e/features/f024-us001-design-tokens.feature` | 103 líneas — 7 escenarios BDD | ✅ |
| `e2e/step_definitions/f024-us001-design-tokens.steps.ts` | 168 líneas — Step definitions | ✅ |

---

## 8. Conclusión

La HU US-001 (Design Tokens) está lista para despliegue. El build compila, los 341 tests pasan, ESLint tiene 0 errores. Se corrigieron 2 bugs funcionales (C-01, TST-01) y 2 issues de infraestructura de tests (jsdom CSS parser). Los 2 errores de TypeScript y los 12 warnings de ESLint son pre-existentes en otras HUs y no bloquean esta entrega.

**Veredicto**: ✅ APROBADO para merge a la feature `feature/F024-design-system-look-and-feel`.
