---
name: react-architecture-checklist
description: Grades an existing React/TypeScript codebase. Detects React version, bundler (Vite/Next), TypeScript usage, state library, and router; checks hooks discipline, component cohesion, effect correctness, render performance, state boundaries, accessibility, and type safety with file:line evidence. Use to review or grade a React codebase.
---

# React Architecture Checklist

> "A checklist cannot fly a plane, but a pilot cannot fly safely without one." — Atul Gawande

## Core Values

| # | Value | What it means |
|---|-------|---------------|
| 1 | **Detect before judge** | Determine React version / bundler / TS / state lib before applying any item. |
| 2 | **Evidence over opinion** | Every finding cites `file:line` and the offending pattern. |
| 3 | **Feature cohesion** | Organized by feature, not by type (`components/`, `hooks/` dumping grounds). |
| 4 | **Dependencies point inward** | UI → hooks/services, not reverse. Data-fetching isolated from presentation. |
| 5 | **Hooks honor the rules** | Called unconditionally at top level; complete dependency arrays; effects clean up. |
| 6 | **Config & secrets hygiene** | No secrets in client bundles; only `VITE_`/`NEXT_PUBLIC_` exposed. |

## Workflow: DETECT -> SCAN -> REPORT -> RECOMMEND

### React Checklist

| # | Check | Severity |
|---|-------|----------|
| 1 | **Hooks rules** — no hooks in loops/conditions; lint rules clean; custom hooks prefixed `use` | Critical |
| 2 | **Effect correctness** — complete dependency arrays; cleanup for subscriptions/timers; no derived state in effects | High |
| 3 | **Component cohesion** — one responsibility per component; no 300-line god components | Medium |
| 4 | **State placement** — state at lowest common owner; server state in query cache (TanStack Query), not `useState`+`useEffect` | High |
| 5 | **Render performance** — stable `key`s (never index for dynamic lists); `memo`/`useMemo` only where measured | Medium |
| 6 | **Type safety** — `strict: true`; no `any` without justification; props typed; no `as` casts hiding mismatches | High |
| 7 | **Accessibility** — semantic HTML; keyboard-reachable; labels/alt/ARIA; `eslint-plugin-jsx-a11y` clean | High |
| 8 | **Boundary hygiene** — no cross-feature deep imports; data-fetching isolated; error boundaries around async UI | Medium |

### Grade
**A**: 0 crit/0 high/<=3 med · **B**: 0 crit/<=2 high · **C**: 0 crit, gaps in one area · **D**: 1+ crit · **F**: fundamental problems.
