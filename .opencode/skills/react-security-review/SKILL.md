---
name: react-security-review
description: OWASP-based security review of React/TypeScript front-ends. Detects framework (Vite/CRA/Next), scans the OWASP Top 10 mapped to React client-side risks (XSS, URL injection, bundled secrets, token storage, dependency CVEs, CSP, open redirects), and emits a graded findings report. Use to audit React for vulnerabilities.
---

# React Security Review (OWASP)

> "Security is not a product, but a process." — Bruce Schneier

## Core Values

| # | Value | What it means |
|---|-------|---------------|
| 1 | **Validate at boundaries** | Every external input (URL params, `postMessage`, API responses) validated/typed. |
| 2 | **No raw HTML from untrusted data** | JSX escapes by default; `dangerouslySetInnerHTML` only with DOMPurify-sanitized content. |
| 3 | **Secrets out of the bundle** | No API keys/tokens in client code; only `VITE_`/`NEXT_PUBLIC_` values shipped. |
| 4 | **AuthN/AuthZ is server-enforced** | Client guards are UX, not security. The API enforces authorization. |
| 5 | **Least privilege & safe defaults** | Minimal OAuth scopes; `target="_blank"` + `rel="noopener noreferrer"`. |
| 6 | **Protect data in transit & at rest** | TLS only; tokens in memory/httpOnly cookies, not `localStorage`. |
| 7 | **Dependencies pinned & audited** | Lockfile committed; `npm audit` in CI. |

## Workflow: DETECT -> SCAN -> EXEC SUMMARY -> FINDINGS

### React Threat Checklist

| OWASP | React Check | Severity |
|-------|------------|----------|
| A01 Broken Access Control | Auth enforced by API; no sensitive data client-filtered; no IDOR | Critical |
| A02 Cryptographic Failures | Tokens in httpOnly cookies, not localStorage; HTTPS only | High |
| A03 Injection (XSS) | JSX auto-escapes intact; `dangerouslySetInnerHTML` only on sanitized HTML (DOMPurify); no `javascript:` URLs; no `eval()` | Critical |
| A04 Insecure Design | `rel="noopener noreferrer"` on `target="_blank"`; `postMessage` checks `origin` | High |
| A05 Misconfiguration | CSP header present; no source maps in prod; no `*` CORS | High |
| A06 Vulnerable Components | `npm audit` clean; lockfile committed; no abandoned deps | High |
| A07 Auth/Session | Tokens cleared on logout; no long-lived tokens; refresh handled securely | High |
| A08 Integrity Failures | Third-party scripts use SRI (`integrity` attribute); no dynamic import of untrusted URLs | High |
| A09 Logging Failures | No tokens/PII in analytics/error trackers (scrub before Sentry) | Medium |
| A10 Open Redirect | Redirect targets allow-listed; user input validated for image/iframe `src` | High |

### Risk Grade
**A**: no critical/high · **B**: no critical, <=2 high · **C**: no critical, multiple high · **D**: 1+ critical · **F**: systemic.
