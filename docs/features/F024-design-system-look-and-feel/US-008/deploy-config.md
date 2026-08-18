# Deploy Config — US-008: Layout Principal - Sidebar + Main Content

> **Feature**: F024 — Design System Look & Feel
> **HU**: US-008 — Layout Principal - Sidebar + Main Content
> **Fecha**: 2026-07-26
> **Agente**: deploy
> **Branch**: hu/F024-US-008-layout-principal-sidebar-main-content
> **Stack**: React 19 + TypeScript + Next.js 16 + Tailwind CSS v4 + Vitest

---

## 1. Resumen del despliegue

| Check | Comando | Resultado | Detalle |
|-------|---------|-----------|---------|
| Build | `npm run build` | ✅ PASSED | Next.js 16.2.10 (Turbopack) compiló exitosamente en 4.4s |
| Unit Tests | `npx vitest run` | ✅ 341/341 PASSED | 11 test files, 0 failures |
| Layout Tests | `npx vitest run src/components/layout/` | ✅ 39/39 PASSED | sidebar.test.tsx (26) + layout.test.tsx (13) |
| BDD (Cucumber + Playwright) | `npm run test:bdd` | ✅ 7/7 PASSED | 66 steps, 12.45s (test-report.md) |
| ESLint | `npx eslint src/components/layout/` | ✅ 0 errors, 0 warnings | Limpio tras corrección de deuda técnica |
| TypeScript | `npx tsc --noEmit` | ⚠️ 2 errors | Pre-existentes en `card.test.tsx` (US-004, fuera de scope) |

---

## 2. Issues corregidos durante el despliegue

Se resolvieron los 5 issues de deuda técnica reportados por `quality`:

| ID | Archivo | Descripción | Severidad | Fix |
|----|---------|-------------|-----------|-----|
| **TD-006** | `layout.tsx:3` | `useMemo` importado pero nunca usado | 🟢 Low | Eliminado del import |
| **TD-001** | `layout.tsx:93-108` | `isMobile` state innecesario (se escribe pero nunca se lee en render) | 🔴 High | Eliminado `useState` para `isMobile`; la lógica de viewport se mantiene en `useEffect` solo para expandir sidebar en desktop |
| **TD-003** | `sidebar.tsx:46-77` | 4 iconos SVG no usados (HomeIcon, UsersIcon, CalendarIcon, SettingsIcon) | 🟡 Medium | Eliminados (~30 líneas de código muerto) |
| **TD-007** | `sidebar.test.tsx:13-14` | `afterEach`, `fireEvent` imports no usados | 🟢 Low | Eliminados del import |
| **TD-008** | `sidebar.test.tsx:408-409` | Variables `communityLink`, `eventsLink` asignadas pero no usadas | 🟢 Low | Eliminadas |

**Resultado post-fix**: ESLint pasó de 10 warnings → 0 warnings. Los 39 tests de layout siguen pasando al 100%.

---

## 3. Pipeline CI/CD (GitHub Actions)

### 3.1 Estado actual

No existe un workflow de GitHub Actions configurado para este repositorio. Se recomienda crear el siguiente workflow para automatizar el CI de esta HU.

### 3.2 Workflow propuesto

```yaml
name: CI - F024 US-008 Layout Principal
on:
  push:
    branches: [hu/F024-US-008-layout-principal-sidebar-main-content]
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
        run: npx eslint src/components/layout/

      - name: Unit tests
        run: npx vitest run

      - name: Build
        run: npm run build
```

### 3.3 Comandos de build/test específicos de layout

| Tipo | Comando | Archivos | Estado |
|------|---------|----------|--------|
| Unit (sidebar) | `npx vitest run src/components/layout/__tests__/sidebar.test.tsx` | 26 tests | ✅ |
| Unit (layout) | `npx vitest run src/components/layout/__tests__/layout.test.tsx` | 13 tests | ✅ |
| BDD (layout) | `cucumber-js --tags @f024-us008` | 7 scenarios | ✅ |

---

## 4. Contenerización

### 4.1 Dockerfile (multi-stage)

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

### 4.2 Health Checks (Kubernetes)

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

## 5. Observabilidad

### 5.1 Health Check Endpoint

La HU US-008 no introduce un endpoint nuevo, pero el layout se monta sobre páginas que heredan el health check existente:

```
GET /api/health → 200 OK
```

### 5.2 Layout Metrics

Para monitoreo del layout en producción:

| Métrica | Valor esperado | Verificación |
|---------|---------------|-------------|
| Sidebar width (desktop) | 260px | `getComputedStyle` |
| Sidebar bg | #111317 | `getComputedStyle` |
| MainContent margin-left (desktop) | 260px | `getComputedStyle` |
| MainContent padding (desktop) | 32px | `getComputedStyle` |
| MainContent padding (mobile) | 16px | `getComputedStyle` |
| Gutter entre módulos | 24px | `getComputedStyle` gap |
| Sidebar position | fixed | `getComputedStyle` |
| Mobile hamburger visibility | lg:hidden | CSS media query |
| Overlay backdrop opacity | 50% | CSS variable |
| Transition duration | 300ms ease-in-out | CSS transition |

### 5.3 Accesibilidad

| Verificación | Estado |
|-------------|--------|
| HTML semántico (`<nav>`, `<aside>`, `<main>`) | ✅ |
| ARIA roles (`role="navigation"`, `role="main"`) | ✅ |
| ARIA labels (sidebar, hamburger, close button) | ✅ |
| `aria-expanded` en hamburger | ✅ |
| `aria-current="page"` en link activo | ✅ |
| `aria-disabled` en items deshabilitados | ✅ |
| Keyboard navigation (botones focusables) | ✅ |
| Focus trap en mobile drawer | ⚠️ Pendiente (TD-002, no bloqueante MVP) |

---

## 6. Artefactos de la HU

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/components/layout/layout.tsx` | 142 líneas — AppLayout wrapper + logo + nav items | ✅ (TD-001, TD-006 corregidos) |
| `src/components/layout/sidebar.tsx` | 182 líneas — Sidebar + SidebarNav + hamburger + overlay | ✅ (TD-003 corregido) |
| `src/components/layout/main-content.tsx` | 38 líneas — MainContent wrapper con padding/gutter | ✅ |
| `src/components/layout/__tests__/sidebar.test.tsx` | 431 líneas — 26 tests | ✅ (TD-007, TD-008 corregidos) |
| `src/components/layout/__tests__/layout.test.tsx` | ~200 líneas — 13 tests | ✅ |
| `e2e/features/f024-us008-layout-sidebar.feature` | Feature file con 7 escenarios Gherkin | ✅ |
| `e2e/step_definitions/f024-us008-layout-sidebar.steps.ts` | 449 líneas — Step definitions | ✅ |
| `src/app/layout.tsx` | Layout raíz con dynamic import del AppLayout | ✅ |

---

## 7. Deuda técnica remanente (no bloqueante)

| ID | Descripción | Ubicación | Prioridad | Esfuerzo |
|----|-------------|-----------|-----------|----------|
| **TD-002** | Focus trap ausente en sidebar mobile drawer | `sidebar.tsx:144-211` | 🔴 High | 1h |
| **TD-004** | Iconos SVG duplicados entre layout.tsx y sidebar.tsx (DashboardIcon/HomeIcon) | Ambos archivos | 🟡 Medium | 15min |
| **TD-005** | Faltan `aria-hidden="true"` en ~8 SVGs decorativos | `layout.tsx`, `sidebar.tsx` | 🟡 Medium | 15min |
| **TD-009** | Falta `will-change: transform` en sidebar para GPU acceleration | `sidebar.tsx:181-189` | 🟢 Low | 2min |

---

## 8. Issues pre-existentes documentados

| ID | Archivo | Severidad | Descripción |
|----|---------|-----------|-------------|
| TS-01 | `src/components/ui/__tests__/card.test.tsx:49-50` | ERROR | `Object is possibly 'null'` — TS2531. Scope: US-004 |
| AUD-01 | `package.json` | HIGH | 15 vulnerabilidades npm high (pre-existentes) |

---

## 9. Pipeline Status

| Indicador | Estado |
|-----------|--------|
| GitHub Actions workflow | ❌ No configurado aún (sin `.github/workflows/`) |
| Build local | ✅ `npm run build` exitoso |
| Tests locales | ✅ 341/341 pasando |
| ESLint | ✅ 0 errores, 0 warnings |
| TypeScript (layout) | ✅ 0 errores |
| BDD | ✅ 7/7 escenarios pasando |

El pipeline CI/CD se validó localmente con éxito. No existe workflow remoto de GitHub Actions para monitorear. Se recomienda crear el workflow de CI propuesto en la sección 3.2 antes del merge a `feature/*`.

---

## 10. Conclusión

La HU US-008 (Layout Principal - Sidebar + Main Content) está lista para despliegue. El build compila, los 341 tests pasan, ESLint tiene 0 errores y 0 warnings tras la corrección de deuda técnica. Se corrigieron 5 issues reportados por quality (TD-001, TD-003, TD-006, TD-007, TD-008). Los 2 errores de TypeScript son pre-existentes en otra HU y no bloquean esta entrega.

**Veredicto**: ✅ **APROBADO** para merge a la feature `feature/F024-design-system-look-and-feel`.
