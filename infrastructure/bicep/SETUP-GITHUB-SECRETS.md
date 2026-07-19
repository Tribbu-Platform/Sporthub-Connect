# Configurar GitHub Secrets para Staging

## Prerrequisitos

- Una suscripcion de Azure activa
- [Azure CLI](https://aka.ms/installazurecliwindows) instalado localmente
- GitHub CLI (`gh`) instalado (opcional, para configurar secrets via CLI)
- Cuenta en [Auth0](https://auth0.com) con tenant configurado

---

## Paso 1: Crear Service Principal en Azure

El pipeline de GitHub Actions necesita un Service Principal con permisos para modificar los Container Apps.

```powershell
# Login a Azure
az login

# Crear Service Principal (anota el JSON que devuelve)
az ad sp create-for-rbac --name "sp-sport-hub-staging" --role contributor `
    --scopes /subscriptions/$(az account show --query id -o tsv) `
    --sdk-auth
```

Esto devuelve un JSON como este:
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "..."
}
```

> **Importante**: Si quieres limitar el alcance a solo el Resource Group de staging:
> ```powershell
> az group create --name rg-sporthub-staging --location eastus
> az ad sp create-for-rbac --name "sp-sport-hub-staging" --role contributor `
>     --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-sporthub-staging `
>     --sdk-auth
> ```

---

## Paso 2: Agregar Secrets en GitHub

### Via GitHub UI

1. Ve a: `Settings → Secrets and variables → Actions`
2. Agrega los siguientes **Repository secrets**:

| Secret | Valor |
|--------|-------|
| `AZURE_CREDENTIALS` | El JSON completo del paso 1 |
| `POSTGRES_ADMIN_PASSWORD` | Password para PostgreSQL (min 8 chars, complejo) |
| `AUTH0_DOMAIN` | `sporthub-dev.auth0.com` (o tu tenant) |
| `AUTH0_AUDIENCE` | `https://api.sporthub.app` (o tu audience) |
| `AUTH0_CLIENT_ID` | Client ID de tu aplicacion Auth0 |
| `AUTH0_CLIENT_SECRET` | Client Secret de tu aplicacion Auth0 |
| `GHCR_USERNAME` | Tu usuario de GitHub |
| `GHCR_PASSWORD` | GitHub PAT con scope `packages:read` y `repo` |

### Via GitHub CLI

```powershell
# Instalar gh cli si no lo tienes
winget install GitHub.cli
gh auth login

# Configurar secrets (reemplaza valores)
gh secret set AZURE_CREDENTIALS --repo "tribbu-platform/sporthub-connect" < .\creds.json
gh secret set POSTGRES_ADMIN_PASSWORD --body "TuPasswordSegura123!" --repo "tribbu-platform/sporthub-connect"
gh secret set AUTH0_DOMAIN --body "sporthub-dev.auth0.com" --repo "tribbu-platform/sporthub-connect"
gh secret set AUTH0_AUDIENCE --body "https://api.sporthub.app" --repo "tribbu-platform/sporthub-connect"
gh secret set AUTH0_CLIENT_ID --body "abc123" --repo "tribbu-platform/sporthub-connect"
gh secret set AUTH0_CLIENT_SECRET --body "secret123" --repo "tribbu-platform/sporthub-connect"
gh secret set GHCR_USERNAME --body "tribbu" --repo "tribbu-platform/sporthub-connect"
gh secret set GHCR_PASSWORD --body "ghp_..." --repo "tribbu-platform/sporthub-connect"
```

---

## Paso 3: Crear GitHub Environment "staging"

1. GitHub UI: `Settings → Environments → New Environment`
2. Nombre: `staging`
3. Agrega los **Environment secrets** (iguales a los repo secrets)
4. Opcional: configura **Required reviewers** para aprobacion manual
5. Opcional: configura **Wait timer** (ej. 5 minutos para cancelar)

---

## Paso 4: Configurar Auth0

Si aun no tienes Auth0 configurado:

1. Crea cuenta en [Auth0](https://auth0.com)
2. Crea una **Application** de tipo `Regular Web Application` o `Single Page Application`
3. Anota `Domain`, `Client ID`, `Client Secret`
4. Configura `Allowed Callback URLs`:
   - `https://ca-sport-staging-web.*.azurecontainerapps.io/api/auth/callback`
   - `http://localhost:3000/api/auth/callback`
5. Configura `Allowed Logout URLs`:
   - `https://ca-sport-staging-web.*.azurecontainerapps.io`
   - `http://localhost:3000`
6. Configura `Allowed Web Origins`:
   - `https://ca-sport-staging-web.*.azurecontainerapps.io`
   - `http://localhost:3000`
7. Crea una **API** con identifier: `https://api.sporthub.app`

---

## Paso 5: Desplegar infraestructura por primera vez

```powershell
# Desde la raiz del repositorio
cd infrastructure
.\deploy-staging.ps1
```

El script te pedira las contraseñas/secrets que falten y creara todos los recursos Azure.

---

## Paso 6: Verificar el deploy

1. Despues del deploy inicial, ve a GitHub Actions
2. El workflow `Deploy to Staging` se ejectura automaticamente en push a `develop`
3. Verifica que ambos health checks (API y Web) pasen
4. Accede a las URLs que aparecen en el summary del workflow

---

## Troubleshooting

### Error: "No subscriptions found"
```
az login
```

### Error: "Container app not found"
El Bicep template no se ha desplegado aun. Ejecuta primero `deploy-staging.ps1`

### Error: "Access denied" en GHCR
Asegurate que el PAT tenga scope `packages:read` y `repo`

### Health check falla
```
# Ver logs del container app
az containerapp logs show --name ca-sport-staging-api --resource-group rg-sporthub-staging --tail 50

# Ver revisiones activas
az containerapp revision list --name ca-sport-staging-api --resource-group rg-sporthub-staging -o table
```
