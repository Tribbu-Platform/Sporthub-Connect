---
name: ef-migration-manager
description: EF Core migration lifecycle with safety checks and rollback planning. Use when creating, reviewing, or applying database migrations in .NET projects. Covers Plan -> Create -> Review SQL -> Test Rollback -> Apply.
---

# EF Core Migration Manager

> "Data is a precious thing and will last longer than the systems themselves." — Tim Berners-Lee

## Core Philosophy

Full EF Core migration lifecycle: **PLAN -> CREATE -> REVIEW SQL -> TEST ROLLBACK -> APPLY**.

**Non-Negotiable Constraints:**
1. Never apply a migration without reviewing the generated SQL
2. Every migration must have a verified rollback path (`Down()`)
3. Data preservation is paramount — classify data loss risk before creating
4. One concern per migration — bundling unrelated changes blocks rollback
5. Migrations must be idempotent-safe (`--idempotent` in production)

## Domain Principles

| # | Principle | Priority |
|---|-----------|----------|
| 1 | Data Integrity First — column drops, type narrowing require data migration plans | Critical |
| 2 | Rollback Safety — `Up()` must have a working `Down()`; test rollback before applying | Critical |
| 3 | Idempotent Scripts — production scripts safe to run multiple times | Critical |
| 4 | Zero-Downtime Awareness — flag blocking operations for live applications | High |
| 5 | Migration Ordering — never reorder, edit, or delete applied migrations | Critical |

## Workflow

### Pre-Flight
- [ ] All current migrations applied (`dotnet ef migrations list`)
- [ ] Model snapshot in sync with database
- [ ] No pending changes from other developers
- [ ] Database backup exists (staging/production)

### Data Loss Assessment
Classify changes: column/table drop with data -> **Critical**; type narrowing/NOT NULL on existing rows -> **High**; widening type/empty table removal -> **Low**; additive change -> **None**.

### Step-by-Step
1. **PLAN** — Identify schema change. Assess data loss risk. Decide single vs multi-step migration.
2. **CREATE** — `dotnet ef migrations add <Name>`. Review `Up()`, `Down()`, `ModelSnapshot.cs`.
3. **REVIEW SQL** — `dotnet ef migrations script --idempotent`. Inspect for data loss, blocking locks, missing indexes.
4. **TEST ROLLBACK** — Apply -> rollback -> re-apply to verify `Down()` works.
5. **APPLY** — Dev: `dotnet ef database update`. Prod: idempotent script or migration bundle.

## Anti-Patterns
| Anti-Pattern | Correct Approach |
|--------------|------------------|
| Apply without reviewing SQL | Always generate and review SQL first |
| Skip rollback testing | Test rollback in dev for every migration |
| Edit already-applied migration | Create a new corrective migration |
| Bundle unrelated changes | One concern per migration |
| Apply migrations on app startup | Use deployment scripts or CI/CD pipeline |

## Migration Review Template
```markdown
## Migration Review: [Name]
**Risk**: [none|low|high|critical] | **SQL Reviewed**: [yes|no] | **Rollback Tested**: [yes|no]

| Operation | Table/Column | Risk | Notes |
|-----------|-------------|------|-------|
| [ADD/ALTER/DROP] | [target] | [level] | [details] |
```
