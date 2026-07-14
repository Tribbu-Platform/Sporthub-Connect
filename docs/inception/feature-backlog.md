# Feature Backlog Inicial

> **Criterio de priorizacion:** MoSCoW (Must Have, Should Have, Could Have, Won't Have - this release).
> Las features estan ordenadas por prioridad dentro de cada grupo.

---

## Must Have (MVP - Release v1.0)

| ID | Nombre | Descripcion | Prioridad | Dependencias | Estimacion (Semanas) |
|----|--------|-------------|-----------|-------------|---------------------|
| **F001** | Registro, Autenticacion y Perfiles de Usuario | Registro con email/contraseña y OAuth2 (Google, Microsoft). Perfiles deportivos dinamicos con roles (admin, capitan, jugador, entrenador). Auto-evaluacion de nivel de habilidad. Gestion de identidad y sesiones. | Must Have | — | 4 |
| **F002** | Gestion de Comunidades y Membresias | Creacion, configuracion y administracion de comunidades/clubes. Segmentacion en sub-grupos por categoria, edad o disciplina. Invitacion y aprobacion de miembros. Roles y permisos dentro de la comunidad. | Must Have | F001 | 5 |
| **F003** | Calendario Inteligente de Eventos | Creacion de eventos (entrenamientos, partidos, torneos, eventos sociales) con fecha, lugar, cupo y detalles. Vista de calendario mensual/semanal. Notificaciones de eventos. | Must Have | F002 | 4 |
| **F004** | RSVP y Sistema de Check-in | Confirmacion de asistencia (Si/No/Tal vez) a eventos. Check-in mediante codigo. Validacion basica de participacion. Historial de asistencias por miembro. | Must Have | F003 | 3 |
| **F005** | Motor de Insignias (Badges) | Sistema automatizado de otorgamiento de insignias por hitos (asistencia, rendimiento, constancia). Catalogo inicial de 10 insignias con criterios configurables. Vitrina de insignias en perfil. | Must Have | F004 | 4 |
| **F006** | Sistema de XP y Niveles | Acumulacion de puntos de experiencia (XP) por actividades (asistencia, check-ins, eventos). Sistema de niveles con thresholds. Progresion visible en perfil. | Must Have | F004 | 3 |
| **F007** | Leaderboards y Rankings | Tablas de clasificacion por comunidad, sub-grupo y globales. Rankings filtrables por periodo (semanal, mensual, historico). Categorias de ranking (XP total, asistencias, insignias). | Must Have | F005, F006 | 3 |

## Should Have (v1.5)

| ID | Nombre | Descripcion | Prioridad | Dependencias | Estimacion (Semanas) |
|----|--------|-------------|-----------|-------------|---------------------|
| **F008** | Moneda Virtual "SportCoins" | Sistema de puntos canjeables por beneficios. Acumulacion por actividades y logros. Wallet digital en perfil. Historial de transacciones. | Should Have | F006 | 4 |
| **F009** | Retos Dinamicos (Challenges) | Desafios temporales individuales y colectivos (ej. "Asiste a 10 entrenamientos este mes", "Corre 50km en grupo"). Creacion de retos personalizados por admin/capitan. Tracking de progreso. | Should Have | F005, F006 | 5 |
| **F010** | Comunicacion y Notificaciones | Notificaciones push y email para eventos, insignias, retos cumplidos, recordatorios. Feed de actividad de la comunidad. Menciones y comentarios basicos en eventos. | Should Have | F003, F005, F009 | 4 |
| **F011** | Panel de Administracion (Backoffice) | Dashboard de administracion para admins de club: miembros, eventos, estadisticas basicas de engagement, configuracion de comunidad. Exportacion de datos (CSV/PDF). | Should Have | F002 | 4 |

## Could Have (v2.0)

| ID | Nombre | Descripcion | Prioridad | Dependencias | Estimacion (Semanas) |
|----|--------|-------------|-----------|-------------|---------------------|
| **F012** | Motor Avanzado de Torneos | Creacion de torneos con formatos (liga, playoffs, grupos, suizo). Generacion automatica de fixtures. Tablas de posiciones. Gestion de resultados. | Could Have | F003, F004 | 8 |
| **F013** | Pasarela de Pagos Integrada | Cobro de cuotas de membresia, inscripciones a eventos/torneos, penalizaciones por ausencia. Integracion con Stripe/MercadoPago. Gestion de facturacion. | Could Have | F002, F011 | 6 |
| **F014** | Integracion con Wearables | Conexion con Strava, Garmin, Apple Health y Fitbit. Sincronizacion automatica de actividades deportivas. XP aumentado por actividades verificadas con wearable. | Could Have | F006 | 6 |
| **F015** | Marketplace de Beneficios | Redencion de SportCoins por beneficios ofrecidos por marcas aliadas (descuentos, productos, servicios). Portal de administracion para marcas. Tracking de redenciones. | Could Have | F008 | 5 |
| **F016** | Validacion Antifraude en Eventos | Geolocalizacion para verificar presencia en eventos. QR dinamicos regenerados periodicamente para check-in. Verificacion por proximidad Bluetooth. | Could Have | F004 | 4 |
| **F017** | Analitica Avanzada de Engagement | Dashboard de metricas avanzadas: retencion, churn, asistencia, progresion XP, cohortes. Reportes exportables. Alertas de baja engagement. | Could Have | F007, F011 | 5 |

## Won't Have (this release / Futuro)

| ID | Nombre | Descripcion | Prioridad | Dependencias |
|----|--------|-------------|-----------|-------------|
| **F018** | Personalizacion y Marca Blanca | White-label para clubes: branding, dominio propio, colores, logos. Templates personalizables. | Won't Have | F011 |
| **F019** | Aplicacion Movil Nativa | App nativa iOS y Android con funcionalidades offline, notificaciones push nativas, acceso a camara y GPS. | Won't Have | Multiple |
| **F020** | Estadisticas Avanzadas y Scouting | Perfiles de rendimiento avanzados, comparativas, predicciones. Scouting deportivo semi-profesional. | Won't Have | F014 |
| **F021** | Gestion de Espacios y Logistica | Reserva de canchas/espacios, control de cupos, coordinacion de disponibilidad, historial de uso. | Won't Have | F003 |
| **F022** | Multi-idioma (i18n) | Soporte completo para español, ingles, portugues y frances. Traduccion de contenido y notificaciones. | Won't Have | F010 |

---

## Resumen de estimaciones

| Release | Features | Semanas estimadas |
|---------|----------|-------------------|
| MVP (v1.0) | F001 - F007 | 26 semanas (~6.5 meses) |
| v1.5 | F008 - F011 | 17 semanas (~4.2 meses) |
| v2.0 | F012 - F017 | 34 semanas (~8.5 meses) |
| **Total** | **F001 - F017** | **~77 semanas (~19 meses)** |
