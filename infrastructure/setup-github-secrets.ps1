<#
.SYNOPSIS
    Configure GitHub secrets for SportHub Connect CI/CD
.DESCRIPTION
    This script creates/updates all required GitHub secrets for the 
    SportHub Connect CI/CD pipelines. Requires GitHub CLI (gh).
.PARAMETER Repo
    GitHub repository (owner/name). Default: auto-detected from git remote
.PARAMETER AzureCredsPath
    Path to Azure service principal JSON file
.EXAMPLE
    .\setup-github-secrets.ps1 -AzureCredsPath ./azure-creds.json
#>

[CmdletBinding()]
param(
    [string]$Repo,
    [string]$AzureCredsPath
)

$ErrorActionPreference = 'Stop'

function Set-Secret($Name, $Value, $IsSecret = $true) {
    if ($IsSecret) {
        gh secret set $Name --body $Value --repo $Repo
    }
    else {
        gh variable set $Name --body $Value --repo $Repo
    }
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   $Name configured" -ForegroundColor Green
    }
    else {
        Write-Host "   Failed to set $Name" -ForegroundColor Red
    }
}

function Read-Secure($Prompt) {
    $secure = Read-Host $Prompt -AsSecureString
    $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    return [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
}

# ============================================================
# Prerequisites
# ============================================================
Write-Host "`n" -ForegroundColor Cyan
Write-Host "  SportHub Connect  GitHub Secrets Setup" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan

# Check gh CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) is not installed. Install from: https://cli.github.com/"
    exit 1
}

# Check logged in to gh
gh auth status 2>$null | Out-Null
if (-not $?) {
    Write-Host "    Not logged into GitHub CLI. Please run: gh auth login"
    exit 1
}

# Detect repo if not provided
if (-not $Repo) {
    $remote = git config --get remote.origin.url 2>$null
    if ($remote -match 'github\.com[/:](.+)\.git$') {
        $Repo = $matches[1]
    }
    elseif ($remote -match 'github\.com[/:](.+)$') {
        $Repo = $matches[1]
    }
    else {
        $Repo = Read-Host "Enter GitHub repository (owner/name)"
    }
}
Write-Host "`n   Repository: $Repo" -ForegroundColor Yellow

# ============================================================
# Collect secrets
# ============================================================
Write-Host "`n Collecting secrets " -ForegroundColor Cyan

# Azure Credentials
if ($AzureCredsPath -and (Test-Path $AzureCredsPath)) {
    $azureCreds = Get-Content $AzureCredsPath -Raw
    Write-Host "   Azure credentials loaded from $AzureCredsPath"
}
else {
    Write-Host "    Azure credentials file not found. You'll need to provide them."
    Write-Host "  Create a Service Principal first:"
    Write-Host "    az ad sp create-for-rbac --name sp-sport-hub-staging --role contributor --scopes /subscriptions/... --sdk-auth"
    $jsonInput = Read-Host "Paste the JSON here (or press Enter to skip)"
    if ([string]::IsNullOrEmpty($jsonInput)) {
        $azureCredsPath = Read-Host "Enter path to Azure credentials JSON file"
        if (Test-Path $azureCredsPath) {
            $azureCreds = Get-Content $azureCredsPath -Raw
        }
        else {
            Write-Warning "Skipping Azure credentials. You'll need to set them manually."
            $azureCreds = $null
        }
    }
    else {
        $azureCreds = $jsonInput
    }
}

$postgresPassword = Read-Secure "PostgreSQL Admin Password"
$ghcrUsername = Read-Host "GitHub Username for GHCR"
$ghcrPassword = Read-Secure "GitHub PAT (packages:read + repo scopes)"
$auth0Domain = Read-Host "Auth0 Domain (e.g., sporthub-dev.auth0.com)"
$auth0Audience = Read-Host "Auth0 Audience (e.g., https://api.sporthub.app)"
$auth0ClientId = Read-Host "Auth0 Client ID"
$auth0ClientSecret = Read-Secure "Auth0 Client Secret"

# ============================================================
# Set secrets
# ============================================================
Write-Host "`n Creating GitHub secrets " -ForegroundColor Cyan

if ($azureCreds) {
    Set-Secret "AZURE_CREDENTIALS" $azureCreds
}
Set-Secret "POSTGRES_ADMIN_PASSWORD" $postgresPassword
Set-Secret "GHCR_USERNAME" $ghcrUsername
Set-Secret "GHCR_PASSWORD" $ghcrPassword
Set-Secret "AUTH0_DOMAIN" $auth0Domain
Set-Secret "AUTH0_AUDIENCE" $auth0Audience
Set-Secret "AUTH0_CLIENT_ID" $auth0ClientId
Set-Secret "AUTH0_CLIENT_SECRET" $auth0ClientSecret

Write-Host "`n" -ForegroundColor Green
Write-Host "   GitHub secrets configured!" -ForegroundColor Green
Write-Host "  Next: Run .\deploy-staging.ps1 to provision Azure resources"
Write-Host "" -ForegroundColor Green

