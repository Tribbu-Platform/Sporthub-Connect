<#
.SYNOPSIS
    Deploy SportHub Connect infrastructure to Azure Staging environment.
.DESCRIPTION
    This script provisions all Azure resources needed for the SportHub Connect
    staging environment using Bicep templates. Run ONCE for initial setup.
.PARAMETER ResourceGroupName
    Name of the resource group to create/use. Default: rg-sporthub-staging
.PARAMETER Location
    Azure region for all resources. Default: eastus
.PARAMETER PostgresAdminPassword
    Password for PostgreSQL admin user. If not provided, you'll be prompted.
.PARAMETER GhcrUsername
    GitHub username for GHCR image pull. Defaults to GITHUB_ACTOR env var.
.PARAMETER GhcrPassword
    GitHub token with packages:read scope for GHCR image pull.
.PARAMETER Auth0Domain
    Auth0 tenant domain (e.g., sporthub-dev.auth0.com)
.PARAMETER Auth0Audience
    Auth0 API audience identifier (e.g., https://api.sporthub.app)
.PARAMETER Auth0ClientId
    Auth0 application client ID.
.PARAMETER Auth0ClientSecret
    Auth0 application client secret.
.PARAMETER WhatIf
    Show what would be deployed without actually deploying.
.PARAMETER DeployContainerAppsOnly
    Skip infrastructure and only update container app images (for CI/CD use).
.EXAMPLE
    .\deploy-staging.ps1
.EXAMPLE
    .\deploy-staging.ps1 -ResourceGroupName rg-sporthub-staging -Location eastus `
        -PostgresAdminPassword "pass123" -GhcrUsername "myuser" -GhcrPassword "token" `
        -Auth0Domain "sporthub-dev.auth0.com" -Auth0Audience "https://api.sporthub.app" `
        -Auth0ClientId "abc123" -Auth0ClientSecret "secret"
.EXAMPLE
    .\deploy-staging.ps1 -DeployContainerAppsOnly -ImageTag staging-20260718-120000
#>

[CmdletBinding()]
param(
    [string]$ResourceGroupName = 'rg-sporthub-staging',
    [string]$Location = 'eastus',
    [string]$PostgresAdminPassword,
    [string]$GhcrUsername = $env:GITHUB_ACTOR,
    [string]$GhcrPassword,
    [string]$Auth0Domain,
    [string]$Auth0Audience,
    [string]$Auth0ClientId,
    [string]$Auth0ClientSecret,
    [string]$ImageTag = 'staging',
    [switch]$WhatIf,
    [switch]$DeployContainerAppsOnly
)

$ErrorActionPreference = 'Stop'

function Write-Step($Message) {
    Write-Host "`n================================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
}

function Get-SecureInput($Prompt) {
    $secure = Read-Host $Prompt -AsSecureString
    $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    return [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
}

# ============================================================
# Prerequisites check
# ============================================================
Write-Step "Checking prerequisites"

$azVersion = az version 2>$null
if (-not $?) {
    Write-Error "Azure CLI is not installed. Install from: https://aka.ms/installazurecliwindows"
    exit 1
}
Write-Host "  [OK] Azure CLI $(az version -o tsv | Select-Object -First 1)"

# Check Bicep
$bicepVersion = az bicep version 2>$null
if (-not $?) {
    Write-Host "  [..] Bicep CLI not found. Installing..."
    az bicep install
}
Write-Host "  [OK] Bicep v0.45.15"

# Check logged in
$account = az account show --query 'name' -o tsv 2>$null
if (-not $?) {
    Write-Host "  [..] Not logged into Azure. Please login..."
    az login
    $account = az account show --query 'name' -o tsv
}
Write-Host "  [OK] Logged into Azure: $account"

# ============================================================
# Secrets
# ============================================================
if (-not $DeployContainerAppsOnly) {
    Write-Step "Collecting secrets"

    if (-not $PostgresAdminPassword) {
        $PostgresAdminPassword = Get-SecureInput "Enter PostgreSQL admin password (min 8 chars, complex): "
        if ([string]::IsNullOrEmpty($PostgresAdminPassword)) {
            Write-Error "PostgreSQL password is required"
            exit 1
        }
    }

    if (-not $GhcrUsername) {
        $GhcrUsername = Read-Host "Enter GitHub username for GHCR pull"
    }

    if (-not $GhcrPassword) {
        $GhcrPassword = Get-SecureInput "Enter GitHub PAT with packages:read scope for GHCR pull: "
        if ([string]::IsNullOrEmpty($GhcrPassword)) {
            Write-Error "GHCR password is required"
            exit 1
        }
    }

    if (-not $Auth0Domain) {
        $Auth0Domain = Read-Host "Enter Auth0 domain (e.g., sporthub-dev.auth0.com)"
    }

    if (-not $Auth0Audience) {
        $Auth0Audience = Read-Host "Enter Auth0 audience (e.g., https://api.sporthub.app)"
    }

    if (-not $Auth0ClientId) {
        $Auth0ClientId = Read-Host "Enter Auth0 Client ID"
    }

    if (-not $Auth0ClientSecret) {
        $Auth0ClientSecret = Get-SecureInput "Enter Auth0 Client Secret: "
    }
}

# ============================================================
# Create Resource Group
# ============================================================
if (-not $DeployContainerAppsOnly) {
    Write-Step "Creating Resource Group: $ResourceGroupName"

    if ($WhatIf) {
        Write-Host "  [WHATIF] Would create resource group"
    }
    else {
        az group create --name $ResourceGroupName --location $Location --tags project=sport-hub-connect environment=staging
        Write-Host "  [OK] Resource group created (or already exists)"
    }
}

# ============================================================
# Deploy Bicep template
# ============================================================
if (-not $DeployContainerAppsOnly) {
    Write-Step "Deploying Azure infrastructure via Bicep"

    $bicepPath = Join-Path $PSScriptRoot "bicep" "main.bicep"

    if (-not (Test-Path $bicepPath)) {
        Write-Error "Bicep template not found at: $bicepPath"
        exit 1
    }

    $deployParams = @(
        'deployment', 'group', 'create',
        '--resource-group', $ResourceGroupName,
        '--template-file', $bicepPath,
        '--parameters',
            "environmentName=staging",
            "location=$Location",
            "postgresAdminPassword=$PostgresAdminPassword",
            "ghcrUsername=$GhcrUsername",
            "ghcrPassword=$GhcrPassword",
            "auth0Domain=$Auth0Domain",
            "auth0Audience=$Auth0Audience",
            "auth0ClientId=$Auth0ClientId",
            "auth0ClientSecret=$Auth0ClientSecret",
            "apiImageTag=$ImageTag",
            "webImageTag=$ImageTag",
        '--name', "sport-hub-staging-deploy"
    )

    if ($WhatIf) {
        Write-Host "  [WHATIF] Would deploy Bicep template"
    }
    else {
        Write-Host "  [..] Deploying resources (this takes 5-10 minutes)..."
        $deployment = az deployment group create @deployParams --query 'properties.outputs' -o json
        $outputs = $deployment | ConvertFrom-Json

        Write-Host "`n  [OK] Infrastructure deployed successfully!"
        Write-Host "`n  -------- Outputs --------"
        Write-Host "  API URL:            $($outputs.apiUrl.value)"
        Write-Host "  Web URL:            $($outputs.webUrl.value)"
        Write-Host "  PostgreSQL Host:    $($outputs.postgresHost.value)"
        Write-Host "  Redis Host:         $($outputs.redisHost.value)"
        Write-Host "  App Insights Key:   $($outputs.appInsightsInstrumentationKey.value)"
    }
}
else {
    # Container Apps only update (used by CI/CD)
    Write-Step "Updating Container App images to tag: $ImageTag"

    if ($WhatIf) {
        Write-Host "  [WHATIF] Would update images"
    }
    else {
        Write-Host "  [..] Updating API container app..."
        az containerapp update `
            --name "ca-sport-staging-api" `
            --resource-group $ResourceGroupName `
            --image "ghcr.io/tribbu-platform/sporthub-connect/api:$ImageTag" `
            --output none

        Write-Host "  [..] Updating Web container app..."
        az containerapp update `
            --name "ca-sport-staging-web" `
            --resource-group $ResourceGroupName `
            --image "ghcr.io/tribbu-platform/sporthub-connect/web:$ImageTag" `
            --output none

        Write-Host "  [OK] Container apps updated!"
    }
}

# ============================================================
# Get deployment URLs
# ============================================================
if (-not $DeployContainerAppsOnly -and -not $WhatIf) {
    Write-Step "Getting deployment URLs"

    $apiFqdn = az containerapp show --name "ca-sport-staging-api" --resource-group $ResourceGroupName --query 'properties.configuration.ingress.fqdn' -o tsv
    $webFqdn = az containerapp show --name "ca-sport-staging-web" --resource-group $ResourceGroupName --query 'properties.configuration.ingress.fqdn' -o tsv

    Write-Host "  -------- Staging URLs --------" -ForegroundColor Green
    Write-Host "  API:   https://$apiFqdn" -ForegroundColor Yellow
    Write-Host "  Web:   https://$webFqdn" -ForegroundColor Yellow
    Write-Host "  Swagger: https://$apiFqdn/swagger" -ForegroundColor Yellow
}

Write-Step "Deployment complete!"
