# Metricas de Exito

## 1. Metricas de Producto (KPIs de negocio)

| KPI | Objetivo | Como se mide | Frecuencia | Responsable |
|-----|---------|-------------|------------|-------------|
| **Usuarios Registrados** | 100,000 en los primeros 12 meses | Sistema de registro + analitica de producto | Mensual | Product Manager |
| **Usuarios Activos Mensuales (MAU)** | 30% de usuarios registrados (30,000 MAU) | Trackeo de sesiones y actividad (login, check-in, interaccion con features) | Mensual | Product Manager |
| **Usuarios Activos Diarios (DAU)** | 10% de MAU (3,000 DAU) | Trackeo de sesiones diarias | Semanal | Product Manager |
| **DAU/MAU Ratio (Stickiness)** | >= 30% (indicador de habito) | DAU / MAU * 100 | Semanal | Product Manager |
| **Comunidades Activas Creadas** | 5,000 comunidades activas en 12 meses | Conteo de comunidades con al menos 10 miembros y 1 evento/mes | Mensual | Product Manager |
| **Tasa de Conversion Free → Premium** | >= 5% de comunidades activas | Comunidades Premium / Comunidades activas totales * 100 | Mensual | Product Manager |
| **Ingresos Mensuales Recurrentes (MRR)** | $50,000 MRR al mes 12 | Suma de suscripciones Premium activas (B2B + B2C) | Mensual | CEO / Finanzas |
| **Customer Acquisition Cost (CAC)** | < $50 por comunidad Premium | Gasto total en marketing y ventas / Nuevas comunidades Premium | Trimestral | Marketing |
| **Customer Lifetime Value (LTV)** | > $500 (LTV:CAC >= 10:1) | Ingreso promedio por comunidad Premium * vida media (meses) | Trimestral | Finanzas |

## 2. Metricas de Engagement

| KPI | Objetivo | Como se mide | Frecuencia | Responsable |
|-----|---------|-------------|------------|-------------|
| **Eventos Creados por Comunidad/mes** | >= 8 eventos/comunidad activa | Conteo de eventos creados en el calendario | Mensual | Product Manager |
| **Tasa de RSVP** | >= 60% de miembros RSVP por evento | RSVPs / Miembros invitados * 100 | Semanal | Product Manager |
| **Tasa de Check-in Real** | >= 70% de RSVPs positivos | Check-ins / RSVPs "Si" * 100 | Semanal | Product Manager |
| **Insignias Otorgadas por Usuario/mes** | >= 2 insignias/usuario activo | Conteo de insignias otorgadas por el motor | Mensual | Product Manager |
| **Retos Completados** | >= 30% de retos iniciados | Retos completados / Retos iniciados * 100 | Mensual | Product Manager |
| **Interacciones Sociales por Usuario/mes** | >= 10 interacciones/usuario activo | Suma de: comentarios, reacciones, comparticiones, menciones | Mensual | Product Manager |

## 3. Metricas de Retencion

| KPI | Objetivo | Como se mide | Frecuencia | Responsable |
|-----|---------|-------------|------------|-------------|
| **Retencion Dia 1** | >= 60% | Usuarios que retornan dentro de 24 horas tras registro | Semanal | Product Manager |
| **Retencion Dia 7** | >= 40% | Usuarios activos 7 dias despues del registro | Semanal | Product Manager |
| **Retencion Dia 30** | >= 25% | Usuarios activos 30 dias despues del registro | Mensual | Product Manager |
| **Churn Rate (comunidades Premium)** | < 5% mensual | Comunidades Premium canceladas / Comunidades Premium activas * 100 | Mensual | Product Manager |
| **Tasa de reactivacion** | >= 10% de usuarios inactivos | Usuarios que retoman actividad tras 30+ dias inactivos / Usuarios inactivos totales | Mensual | Product Manager |

## 4. Metricas Tecnicas (Calidad y Rendimiento)

| KPI | Objetivo | Como se mide | Frecuencia | Responsable |
|-----|---------|-------------|------------|-------------|
| **Disponibilidad (Uptime)** | >= 99.5% (gratuito), >= 99.9% (Premium) | Health checks + monitoreo externo (synthetic tests) | Continuo (alerta) | DevOps / SRE |
| **P95 Latencia API** | < 200ms (lectura), < 500ms (escritura) | APM (Application Performance Monitoring) | Continuo (alerta) | DevOps / Tech Lead |
| **Error Rate** | < 1% de requests | Errores 5xx / Total requests * 100 | Continuo (alerta) | DevOps / Tech Lead |
| **Time to Recovery (MTTR)** | < 30 minutos para incidentes criticos | Tiempo desde alerta hasta restauracion del servicio | Por incidente | DevOps / SRE |
| **Cobertura de Tests** | >= 80% unit, >= 60% integracion | Herramienta de cobertura del stack (Coverlet, JaCoCo, pytest-cov) | Semanal | Tech Lead |
| **Deuda Tecnica (SonarQube)** | Debt Ratio < 5%, duplicacion < 3% | SonarQube / SonarCloud | Semanal | Tech Lead |
| **Tiempo de Build CI** | < 10 min (unit), < 20 min (+integration) | Pipeline CI/CD | Por build | Tech Lead |
| **Frecuencia de Deploy** | Al menos 1 deploy/semana a produccion | Conteo de releases | Semanal | DevOps |

## 5. Metricas Financieras

| KPI | Objetivo | Como se mide | Frecuencia | Responsable |
|-----|---------|-------------|------------|-------------|
| **Burn Rate** | < $30,000/mes en fase inicial | Gasto total mensual (cloud + equipo + herramientas) | Mensual | CEO / Finanzas |
| **Runway** | >= 18 meses de operacion | Capital disponible / Burn rate mensual | Mensual | CEO / Finanzas |
| **Costo Cloud por Comunidad** | < $5/mes por comunidad activa | Costo cloud total / Comunidades activas | Mensual | DevOps / Finanzas |
| **Margen Bruto (servicios Premium)** | > 70% | (Ingresos Premium - Costo cloud atribuible) / Ingresos Premium * 100 | Trimestral | Finanzas |
