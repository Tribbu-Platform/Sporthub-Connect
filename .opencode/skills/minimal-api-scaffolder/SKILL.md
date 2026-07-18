---
name: minimal-api-scaffolder
description: Scaffolds .NET Minimal API endpoints with OpenAPI documentation, versioning, and security patterns. Use when creating REST APIs, adding endpoints, setting up API projects, or configuring API infrastructure in .NET 10.
---

# .NET Minimal API Scaffolder

> "Minimal APIs are ideal for microservices and apps that want to include only the minimum files, features, and dependencies in ASP.NET Core."

## Core Philosophy

This skill scaffolds and maintains Minimal API endpoints in .NET projects with OpenAPI documentation, versioning, and security configured from the start. Every API begins with a clear contract, validated inputs, and documented responses.

**Non-Negotiable Constraints:**

1. **OpenAPI-First Design** — Every endpoint must have OpenAPI metadata: `.WithName()`, `.WithSummary()`, `.Produces<T>()` for all status codes.
2. **Versioning from Day One** — API versioning is configured at project creation. URL versioning (`/api/v{version}/`) is the recommended default.
3. **Security by Default** — Groups default to `.RequireAuthorization()`. `.AllowAnonymous()` is explicit opt-in.
4. **Typed Results** — All handlers return `TypedResults` with explicit union return types (`Results<Ok<T>, NotFound, ValidationProblem>`).
5. **FluentValidation** — Every mutating endpoint injects `IValidator<TRequest>` before processing.

## Workflow: CONFIGURE -> SCAFFOLD -> SECURE -> DOCUMENT

### Phase 1: CONFIGURE
- Create/verify `.csproj` with required packages
- Configure `Program.cs`: OpenAPI, versioning, FluentValidation, DbContext
- Set up authentication/authorization pipeline
- Configure CORS per environment
- Register rate limiting policies

### Phase 2: SCAFFOLD
- Create endpoint group static class with extension method pattern
- Define CRUD operations with typed results
- Request models as records with `[AsParameters]` for GET
- Implement FluentValidation validators
- Wire group into `Program.cs`

### Phase 3: SECURE
- Apply `.RequireAuthorization()` to groups
- Apply rate limiting to public endpoints
- Add health checks (`/health`, `/health/ready`)
- Verify CORS configuration

### Phase 4: DOCUMENT
- Verify `.WithName()` and `.WithSummary()` on all endpoints
- Verify `.Produces<T>()` for all status codes
- Verify Swagger UI renders correctly

## Anti-Patterns
| # | Anti-Pattern | Correct Approach |
|---|-------------|------------------|
| 1 | Fat Program.cs | Extract endpoint groups to static extension classes |
| 2 | No validation on mutating endpoints | Inject `IValidator<T>` in POST/PUT/PATCH |
| 3 | Missing OpenAPI metadata | `.WithName()`, `.WithSummary()`, `.Produces<T>()` on every endpoint |
| 4 | Anonymous by default | `.RequireAuthorization()` at group level |
| 5 | Raw `IResult` returns | `TypedResults` with explicit union types |
| 6 | Mixing Controllers + Minimal APIs | Choose one approach per project |
