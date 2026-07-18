---
name: dotnet-security-review
description: OWASP-based security review of .NET applications. Detects framework and entry points, scans the OWASP Top 10 mapped to .NET patterns (deserialization, injection, auth, crypto, secrets), and emits a graded findings report. Use to audit .NET for vulnerabilities.
---

# .NET Security Review (OWASP)

> "Security is not a product, but a process." — Bruce Schneier

## Core Values

| # | Value | What it means |
|---|-------|---------------|
| 1 | **Validate at boundaries** | Every external input validated at the edge (FluentValidation); never trust client data. |
| 2 | **Parameterized queries only** | EF Core / parameterized ADO.NET everywhere; no string-concatenated SQL. |
| 3 | **Secrets out of code** | No hardcoded secrets; user-secrets / Key Vault / env variables; never logged. |
| 4 | **AuthN/AuthZ at every boundary** | `[Authorize]` / policy checks server-side at each trust boundary; deny by default. |
| 5 | **Least privilege & safe defaults** | Minimal permissions; secure defaults; fail closed. |
| 6 | **Protect data in transit & at rest** | No sensitive data in logs; HTTPS/HSTS; encryption at rest (AES-256). |
| 7 | **Dependencies pinned & audited** | `dotnet list package --vulnerable` in CI; supply chain reviewed. |
| 8 | **Evidence-based, graded findings** | Every finding cites `file:line` + OWASP category + severity. |

## Workflow: DETECT -> SCAN -> EXEC SUMMARY -> FINDINGS

### DETECT
Identify .NET version, app model (Minimal API/MVC/Blazor), data stores, external calls.

### SCAN — .NET Threat Checklist

| OWASP | .NET Check | Severity |
|-------|-----------|----------|
| A01 Broken Access Control | `[Authorize]`/policies on endpoints; anti-forgery on state changes; no IDOR | Critical |
| A02 Cryptographic Failures | `Aes`/`SHA256+`; `RandomNumberGenerator` for tokens; no MD5/SHA1/DES; ASP.NET Identity for passwords | High |
| A03 Injection | EF Core parameterized queries; no `FromSqlRaw` on input; encoded Razor output | Critical |
| A04 Insecure Design / Deserialization | No `BinaryFormatter`/`LosFormatter`; no insecure `TypeNameHandling` | Critical |
| A05 Misconfiguration | Custom errors on; debug off in prod; HSTS; secure cookie flags; CORS locked down | High |
| A06 Vulnerable Components | `dotnet list package --vulnerable` clean; EOL framework flagged | High |
| A07 Auth Failures | Anti-forgery tokens; lockout/throttling on login; secure JWT handling | High |
| A09 Logging Failures | No passwords/tokens/PII in logs; auth failures logged | Medium |

### Risk Grade
**A**: no critical/high · **B**: no critical, <=2 high · **C**: no critical, multiple high · **D**: 1+ critical · **F**: systemic.

## Output Template

```markdown
## Security Review: [project] (.NET [version])
**Risk Grade**: [A-F] | Findings: Critical [N] · High [N] · Medium [N] · Low [N]

### Executive Summary
[2-3 sentences: overall posture, most serious risk, recommended next step.]

| Severity | Location | OWASP | Finding | Remediation |
|----------|----------|-------|---------|-------------|
| CRITICAL | file:line | A03 | [pattern] | [fix] |
```
