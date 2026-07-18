---
name: dotnet-architecture-checklist
description: Grades an existing .NET solution against its own architecture style (layered/N-tier controllers OR vertical-slice CQRS). Detects framework, hosting model, and style FIRST, then checks architectural coherence, handler discipline, EF Core lifetimes, config/secrets hygiene with file:line evidence. Use to review or grade a .NET solution.
---

# .NET Architecture Checklist

> "A checklist cannot fly a plane, but a pilot cannot fly safely without one." — Atul Gawande

## Core Values

| # | Value | What it means |
|---|-------|---------------|
| 1 | **Detect before judge** | Determine framework/version/structure/style before applying any item. |
| 2 | **Evidence over opinion** | Every finding cites `file:line` and the offending pattern. |
| 3 | **Feature cohesion** | Organized by business capability, not technical layer. Cross-feature imports are violations. |
| 4 | **Dependencies point inward** | Domain does not depend on infrastructure; entities don't leak across API boundaries. |
| 5 | **Explicit error handling** | Failures handled at the right layer; no silent swallowing. |
| 6 | **Config & secrets hygiene** | No hardcoded secrets; `IOptions<T>`; no secrets in client bundles. |
| 7 | **Graded, actionable output** | Letter grade (A-F) from counted findings + prioritized recommendations. |

## Workflow: DETECT -> SCAN -> REPORT -> RECOMMEND

### DETECT
Target framework, hosting model, and **architecture style** (layered/N-tier controllers vs vertical-slice CQRS vs mixed).

### SCAN — .NET Checklist

| # | Check | Severity |
|---|-------|----------|
| 1 | **Architectural coherence** — project follows its OWN style consistently. Clean boundaries, no layer-skipping. | Critical |
| 2 | **Handler/Controller discipline** — vertical-slice: `sealed` standalone handlers, thin endpoints. Layered: thin controllers, service layer, DTOs at boundary. | Critical |
| 3 | **Mediator pipeline** — CQRS projects only: validation/logging/exception behaviors in order. Skip for layered projects. | Critical |
| 4 | **EF Core lifetime** — DbContext scoped correctly; async all the way; no N+1 queries. | Critical |
| 5 | **Framework health** — EOL frameworks flagged; upgrade path recommended. | Critical |
| 6 | **Mapster discipline** — `TypeAdapterConfig` at startup; `ProjectToType<>()` not `ToList().Adapt()`. | High |
| 7 | **Shared kernel** — official shared packages; version consistency; no duplicate entities. | High |
| 8 | **Config & secrets** — `IOptions<T>`; no hardcoded secrets; client bundles secret-free. | High |

### Grade
**A**: 0 crit/0 high/<=3 med · **B**: 0 crit/<=2 high · **C**: 0 crit, gaps in one area · **D**: 1+ crit · **F**: fundamental problems.

## Output Template
```markdown
## Architecture Checklist: [solution] (.NET [version])
**Style**: [Layered/Vertical-Slice/Mixed] | **Grade**: [A-F]

| Section | Pass | Fail | Warn |
|---------|------|------|------|
| Coherence / Handlers / Pipeline / EF / Framework / Config | ... | ... | ... |

| Severity | Location | Finding | Recommendation |
|----------|----------|---------|----------------|
| CRITICAL | file:line | [pattern] | [version-gated fix] |
```
