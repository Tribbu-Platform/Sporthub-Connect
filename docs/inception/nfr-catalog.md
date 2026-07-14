# Catalogo de Requisitos No Funcionales (NFR)

## 1. Rendimiento

| ID | Requisito | Metrica | Objetivo |
|----|-----------|---------|----------|
| NFR-P01 | Latencia de API (p95) | Tiempo de respuesta | < 200ms para endpoints de lectura, < 500ms para escritura |
| NFR-P02 | Latencia de carga de pagina inicial (SPA) | Time to Interactive (TTI) | < 2 segundos en conexion 4G |
| NFR-P03 | Throughput de sistema | Requests por segundo (rps) | Capacidad para 500 rps en operaciones de lectura concurrentes |
| NFR-P04 | Procesamiento de leaderboards | Tiempo de actualizacion | Actualizacion en < 5 segundos tras procesar evento de XP |
| NFR-P05 | Carga de imagenes/perfiles | Tiempo de carga | < 500ms para thumbnails (cache CDN), < 2s para imagenes full-size |
| NFR-P06 | Procesamiento batch (insignias nocturno) | Tiempo total de ejecucion | < 15 minutos para procesar todas las comunidades activas |

## 2. Seguridad

| ID | Requisito | Metrica | Objetivo |
|----|-----------|---------|----------|
| NFR-S01 | Autenticacion multi-factor (MFA) | Disponibilidad | TOTP y WebAuthn para cuentas admin/premium |
| NFR-S02 | Cifrado en transito | Protocolo | TLS 1.3 obligatorio, HTTP Strict Transport Security (HSTS) |
| NFR-S03 | Cifrado en reposo | Estandar | AES-256 para datos personales, AES-128 para resto |
| NFR-S04 | Gestion de secretos | Herramienta | Azure Key Vault / HashiCorp Vault, zero secrets en codigo fuente |
| NFR-S05 | Rotacion de credenciales | Frecuencia | API keys: 90 dias, certificados TLS: 1 año, secrets de BD: 180 dias |
| NFR-S06 | Proteccion contra ataques comunes | OWASP Top 10 | Mitigacion de SQL injection, XSS, CSRF, SSRF, IDOR, rate limiting |
| NFR-S07 | Auditoria de seguridad | Frecuencia | SAST en CI/CD, DAST trimestral, PenTest externo anual |
| NFR-S08 | Consentimiento de datos (GDPR) | Funcionalidad | Consentimiento granular y revocable para datos de salud (wearables) |
| NFR-S09 | Derecho al olvido | Tiempo de ejecucion | Borrado completo de datos personales en < 72 horas tras solicitud |

## 3. Disponibilidad

| ID | Requisito | Metrica | Objetivo |
|----|-----------|---------|----------|
| NFR-D01 | Disponibilidad del servicio (SLA) | Uptime | 99.5% para capa gratuita, 99.9% para capa Premium |
| NFR-D02 | Recuperacion ante desastres (RTO) | Recovery Time Objective | < 4 horas para servicios criticos, < 24 horas para no criticos |
| NFR-D03 | Recuperacion de datos (RPO) | Recovery Point Objective | < 1 hora (perdida maxima de datos en desastre) |
| NFR-D04 | Ventanas de mantenimiento | Impacto | Mantenimiento sin downtime (blue-green o canary deployments) |
| NFR-D05 | Degradacion graceful | Comportamiento | Funcionalidades no criticas se desactivan (no crashean) bajo carga extrema |
| NFR-D06 | Health checks | Endpoints | `/health` (liveness) y `/health/ready` (readiness) en todos los servicios |

## 4. Escalabilidad

| ID | Requisito | Metrica | Objetivo |
|----|-----------|---------|----------|
| NFR-E01 | Escalabilidad horizontal | Arquitectura | Todos los servicios stateless, escalables horizontalmente sin limite fijo |
| NFR-E02 | Usuarios concurrentes (año 1) | Capacidad | Soportar 10,000 usuarios activos simultaneos |
| NFR-E03 | Usuarios registrados (año 1) | Capacidad | Soportar 100,000 usuarios registrados totales |
| NFR-E04 | Comunidades (año 1) | Capacidad | Soportar 5,000 comunidades activas |
| NFR-E05 | Escalabilidad de leaderboards | Comunidades por leaderboard | Soportar comunidades de hasta 5,000 miembros en rankings sin degradacion |
| NFR-E06 | Volumen de eventos de dominio | Eventos/dia | Capacidad de procesar 500,000 eventos de dominio/dia |
| NFR-E07 | Auto-scaling | Tiempo de reaccion | Escalar up en < 3 minutos ante incremento de carga |

## 5. Compliance / Regulatorio

| ID | Requisito | Metrica | Objetivo |
|----|-----------|---------|----------|
| NFR-C01 | GDPR (Union Europea) | Cumplimiento | 100% compliance: consentimiento, portabilidad, derecho al olvido, DPO designado |
| NFR-C02 | LOPD / LOPDGDD (España) | Cumplimiento | Adecuacion a normativa española si aplica |
| NFR-C03 | PCI-DSS (modulo de pagos) | Nivel | PCI-DSS Nivel 4 (hasta 20,000 transacciones/año), externalizacion a Stripe para reducir alcance |
| NFR-C04 | Accesibilidad (WCAG) | Nivel | WCAG 2.1 Nivel AA en frontend web |
| NFR-C05 | Residencia de datos | Opcion | Datos almacenados en regiones especificas (EU, US, LATAM) segun preferencia del cliente (Premium) |
| NFR-C06 | Logs de auditoria | Retencion | Logs de acceso y cambios en datos personales: 1 año minimo |

## 6. Observabilidad

| ID | Requisito | Metrica | Objetivo |
|----|-----------|---------|----------|
| NFR-O01 | Logging estructurado | Formato | JSON estructurado con correlation ID, trace ID y span ID en todos los servicios |
| NFR-O02 | Trazas distribuidas | Herramienta | OpenTelemetry + Jaeger/Azure Monitor, muestreo 100% en errores, 10% en exitos |
| NFR-O03 | Metricas de aplicacion | Herramienta | Prometheus + Grafana o Azure Monitor, dashboards por bounded context |
| NFR-O04 | Alertas | Tipos | Alertas por: latencia > p95, error rate > 1%, disponibilidad < 99.5%, costos cloud > presupuesto |
| NFR-O05 | Health checks | Tipos | Liveness, Readiness y Startup probes en todos los servicios |
| NFR-O06 | Log retention | Periodo | Logs de aplicacion: 30 dias, logs de auditoria: 1 año, metricas: 90 dias |

## 7. Mantenibilidad

| ID | Requisito | Metrica | Objetivo |
|----|-----------|---------|----------|
| NFR-M01 | Cobertura de codigo | Porcentaje | >= 80% unit tests, >= 60% integration tests en servicios core |
| NFR-M02 | Deuda tecnica | SonarQube | Duplicacion < 3%, complejidad ciclomatica < 10, debt ratio < 5% |
| NFR-M03 | Documentacion | Artefactos | ADRs en `docs/architecture.md`, API docs en Swagger/OpenAPI 3.0, dominio documentado en DDD |
| NFR-M04 | Estandarizacion de codigo | Herramientas | Linter + formateador automatico por stack, conventions doc, .editorconfig unificado |
| NFR-M05 | Tiempo de build CI | Duracion | < 10 minutos para build + tests unitarios, < 20 minutos incluyendo integracion |
| NFR-M06 | Versionado | Estrategia | Semantic Versioning (SemVer), Git Flow branching, conventional commits |
