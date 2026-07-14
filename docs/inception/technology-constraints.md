# Restricciones Tecnologicas

## 1. Plataformas Obligatorias

- **Web (PWA first):** La plataforma debe funcionar como aplicacion web progresiva (PWA) con soporte offline basico para consulta de eventos y perfil. No se desarrolla app nativa en MVP (F019 - futura).
- **Navegadores soportados:** Chrome, Firefox, Safari, Edge (ultimas 2 versiones principales). Soporte movil completo (responsive design).
- **API RESTful:** Todos los servicios exponen API REST con OpenAPI 3.0 (Swagger). gRPC considerado para comunicacion interna entre servicios en evolucion futura a microservicios.

## 2. Lenguajes / Runtimes Permitidos

El proyecto se desarrolla como **monorepo** con la siguiente matriz de decisiones:

| Capa | Opciones evaluadas | Decision | Justificacion |
|------|-------------------|----------|---------------|
| **Backend API** | .NET, Python, Go, Node.js, Java, Rust | **C# / .NET 8** | Tipado fuerte para modelo de dominio complejo (DDD), excelente ORM (EF Core), SignalR para real-time, rendimiento nativo, madurez enterprise, skill `dotnet-microservice` disponible |
| **Frontend Web** | Blazor, React, Angular, Vue, Svelte | **React + TypeScript** | Ecosistema mas maduro para PWAs, amplia disponibilidad de talento, excelente SSR/SSG con Next.js, integracion robusta con APIs REST |
| **Base de Datos Principal** | PostgreSQL, SQL Server, MySQL, MongoDB | **PostgreSQL** | Open source, excelente soporte JSON/Document, full-text search, GIS (geolocalizacion), CTEs recursivas (leaderboards), RLS (multi-tenant) |
| **Cache / Sesiones** | Redis, Memcached | **Redis** | Leaderboards en tiempo real con Sorted Sets, caché distribuido, SignalR backplane, pub/sub para eventos |
| **Bus de Mensajeria** | RabbitMQ, Kafka, Azure Service Bus, AWS SQS | **RabbitMQ** (inicial), migrable a **Kafka** | RabbitMQ suficiente para MVP con volumen moderado de eventos de dominio. Kafka se considera para evolucion a event streaming masivo |
| **Search** | Elasticsearch, MeiliSearch, PostgreSQL FTS | **PostgreSQL FTS** (inicial), **MeiliSearch** (futuro) | El full-text search nativo de PostgreSQL cubre MVP. MeiliSearch se añade cuando el volumen lo justifique |
| **Almacenamiento de Archivos** | Azure Blob, AWS S3, MinIO | **Azure Blob Storage** o **AWS S3** | Segun proveedor cloud elegido. MinIO para desarrollo local |

### Skills disponibles en `.opencode/skills/`:

| Stack | Skill Backend | Skill TDD | Skill BDD | Cobertura |
|-------|--------------|-----------|-----------|-----------|
| .NET 8 | `dotnet-microservice` | `tdd-dotnet` | `bdd-dotnet` | ✅ Completa |
| Python | `python-fastapi` | `tdd-pytest` | `bdd-python` | ✅ Completa |
| Go | `go-chi` | `tdd-go` | — | ⚠️ Sin BDD |
| Node.js | `node-express` | `tdd-jest` | `bdd-javascript` | ✅ Completa |
| Java | `spring-boot` | `tdd-junit` | — | ⚠️ Sin BDD |
| Rust | `rust-axum` | `tdd-rust` | — | ⚠️ Sin BDD |

### Decision de stack:

**Stack principal: C# / .NET 8 + React/TypeScript** con PostgreSQL, Redis y RabbitMQ.

Justificacion detallada:
1. **Dominio complejo → Tipado fuerte:** SportHub tiene un modelo de dominio denso (comunidades, eventos, gamificacion, pagos, rankings). C# con su sistema de tipos, records, pattern matching y LINQ permite expresar reglas de negocio de forma concisa y segura.
2. **EF Core para persistencia:** El ORM mas maduro del ecosistema .NET. Soporta herencia (TPH/TPT), owned types (value objects de DDD), shadow properties, intercepciones. Ideal para un modelo DDD complejo.
3. **SignalR para real-time:** Leaderboards en vivo, notificaciones push, actualizaciones de RSVP. Sin dependencias externas adicionales.
4. **Alto rendimiento:** .NET 8 es uno de los runtimes mas rapidos (TechEmpower benchmarks top 10). GC de baja latencia, compilacion AOT disponible si es necesario.
5. **Skills completos:** `dotnet-microservice`, `tdd-dotnet` y `bdd-dotnet` estan disponibles.
6. **Frontend React/TypeScript:** Aunque no tiene skill en `.opencode/skills/` (solo backend), TypeScript aporta tipado fuerte en frontend alineandose con la filosofia del backend. El ecosistema React es el mas probado para PWAs.

## 3. Proveedores Cloud

| Proveedor | Evaluacion | Estado |
|-----------|------------|--------|
| **Azure** | Integracion nativa con .NET, Azure DevOps/GitHub Actions, App Service, AKS | ✅ Opcion primaria recomendada |
| **AWS** | ECS/EKS, RDS PostgreSQL, ElastiCache, S3. Maduro, amplio ecosistema | ✅ Alternativa valida |
| **GCP** | Cloud Run, Cloud SQL, Memorystore. Bueno para serverless | ⬜ Opcion terciaria |

**Desarrollo local:** Docker Compose con todos los servicios (API, PostgreSQL, Redis, RabbitMQ, Frontend).

## 4. Restricciones de Compliance Tecnica

- **Proteccion de datos:** Datos personales (PII) deben estar cifrados en reposo (AES-256) y en transito (TLS 1.3). Los datos de salud (wearables) requieren cifrado adicional y consentimiento explicito.
- **PCI-DSS:** El procesamiento de pagos se externaliza a Stripe (tokenizacion) para reducir el alcance PCI. No se almacenan numeros de tarjeta en servidores propios.
- **GDPR:** Los usuarios deben poder exportar sus datos (portabilidad) y solicitar eliminacion (derecho al olvido). Mecanismo implementado desde v1.0.
- **Logs:** No se debe registrar PII en logs. Usar IDs anonimizados para trazabilidad.
- **Autenticacion:** OAuth 2.0 + OpenID Connect. No implementar autenticacion propia (usar Identity Provider externo como Auth0, Azure AD B2C o Keycloak).

## 5. Make vs Buy Decisions Preliminares

| Componente | Decision | Justificacion |
|------------|----------|---------------|
| **Autenticacion y Autorizacion** | **Buy** (Auth0 / Azure AD B2C) | Seguridad critica. No reinventar. OAuth2 + OIDC out-of-the-box. MFA, social login, passwordless incluidos. |
| **Pasarela de Pagos** | **Buy** (Stripe) | PCI-DSS complejo. Stripe Checkout/SDK reduce alcance. Soportado globalmente. |
| **Email / Notificaciones push** | **Buy** (SendGrid + Firebase Cloud Messaging) | APIs maduras, precios por volumen. No mantener infraestructura de envio. |
| **CDN** | **Buy** (Cloudflare / Azure CDN) | Cache de assets estaticos, imagenes de perfil. Costo minimo, gran impacto en rendimiento. |
| **Monitoreo / APM** | **Buy** (Azure Monitor / Datadog) | OpenTelemetry como capa de instrumentacion. Backend gestionado para no mantener infraestructura. |
| **CI/CD** | **Buy** (GitHub Actions) | Incluido con GitHub. Action runners auto-gestionados si se requiere. |
| **Motor de Gamificacion** | **Make** | Core del producto, diferenciador clave. No existen soluciones off-the-shelf adecuadas al dominio deportivo. |
| **Sistema de Leaderboards** | **Make** (Redis Sorted Sets + .NET) | Logica de negocio especifica (formulas, categorias) requiere implementacion propia. Redis optimiza el ranking en tiempo real. |
| **Calendarizacion (iCal)** | **Make** | Generacion de feeds iCal/.ics y consumo de calendarios externos. Simple de implementar. |
| **Integracion Wearables** | **Make** (con SDKs externos) | Cada proveedor (Strava, Garmin) tiene su propia API. Capa de abstraccion propia para normalizar datos. |

## 6. Principios de Arquitectura

- **Clean Architecture:** Separacion en capas: Domain, Application, Infrastructure, Presentation (API).
- **Domain-Driven Design:** Bounded contexts definidos. Agregados como unica puerta de entrada. Eventos de dominio para comunicacion entre bounded contexts.
- **CQRS (Query/Command):** Separacion de operaciones de lectura (queries optimizadas) y escritura (commands con validacion). No Event Sourcing en MVP.
- **SOLID:** Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- **API First:** Contratos OpenAPI 3.0 definidos antes de implementar.
- **Infrastructure as Code:** Docker Compose para local, Terraform/Bicep para cloud.
- **Observability First:** Health checks, logging estructurado, trazas distribuidas y metricas desde el dia 1.
