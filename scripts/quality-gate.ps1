# ============================================================
# quality-gate.ps1 — SportHub Connect
# Quality Gate unificado para ejecucion local antes de commit/PR
#
# Uso:
#   .\scripts\quality-gate.ps1                    # Analisis completo
#   .\scripts\quality-gate.ps1 -BackendOnly       # Solo backend
#   .\scripts\quality-gate.ps1 -FrontendOnly      # Solo frontend
#   .\scripts\quality-gate.ps1 -SkipTests         # Sin tests (solo lint + build + SCA)
#
# Fase: Quality (HU-level) — se ejecuta por cada User Story
# ============================================================

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$SkipTests,
    [switch]$SkipSCA,
    [switch]$JsonOutput
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\.."
$FrontendDir = "$ProjectRoot\frontend\sport-hub-web"

# Resultados
$Results = @{
    Backend = @{
        Format    = @{ Pass = $false; Issues = 0; Details = "" }
        Build     = @{ Pass = $false; Warnings = 0; Errors = 0; Details = "" }
        Tests     = @{ Pass = $false; Total = 0; Failed = 0; Details = "" }
        SCA       = @{ Pass = $false; High = 0; Critical = 0; Details = "" }
    }
    Frontend = @{
        Lint      = @{ Pass = $false; Issues = 0; Details = "" }
        TypeCheck = @{ Pass = $false; Details = "" }
        Tests     = @{ Pass = $false; Total = 0; Failed = 0; Details = "" }
        SCA       = @{ Pass = $false; High = 0; Critical = 0; Details = "" }
    }
    OverallPass = $false
}

function Write-Step {
    param([string]$Message, [string]$Status = "RUN")
    $icon = switch ($Status) {
        "RUN"  { "[...]" }
        "OK"   { "[PASS]" }
        "FAIL" { "[FAIL]" }
        "WARN" { "[WARN]" }
        "SKIP" { "[SKIP]" }
    }
    Write-Host "$icon $Message"
}

function Write-Result {
    param([bool]$Pass, [string]$Message)
    if ($Pass) {
        Write-Host "       -> $Message" -ForegroundColor Green
    } else {
        Write-Host "       -> $Message" -ForegroundColor Red
    }
}

# ============================================================
# HEADER
# ============================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SportHub Connect — Quality Gate" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# BACKEND (.NET)
# ============================================================
if (-not $FrontendOnly) {
    Write-Host "=== BACKEND (.NET 10) ===" -ForegroundColor Yellow
    Write-Host ""

    # --- 1. Formateo de codigo ---
    Write-Step "dotnet format --verify-no-changes"
    try {
        $formatOutput = & dotnet format --verify-no-changes --verbosity normal 2>&1
        $formatExit = $LASTEXITCODE
        
        if ($formatExit -eq 0) {
            $Results.Backend.Format.Pass = $true
            Write-Step "Formateo de codigo" "OK"
        } else {
            $Results.Backend.Format.Pass = $false
            $Results.Backend.Format.Issues = ($formatOutput | Select-String "warning" | Measure-Object).Count
            Write-Step "Formateo de codigo" "FAIL"
            Write-Result $false "Se encontraron $($Results.Backend.Format.Issues) problemas de formateo"
            if ($formatOutput) {
                $formatOutput | Select-Object -Last 20 | ForEach-Object { Write-Host "         $_" -ForegroundColor DarkGray }
            }
        }
    } catch {
        $Results.Backend.Format.Pass = $false
        $Results.Backend.Format.Details = $_.Exception.Message
        Write-Step "Formateo de codigo" "FAIL"
        Write-Result $false $_.Exception.Message
    }
    Write-Host ""

    # --- 2. Build con Roslyn Analyzers ---
    Write-Step "dotnet build (Roslyn Analyzers + SonarAnalyzer)"
    try {
        $buildOutput = & dotnet build --no-restore -warnaserror 2>&1
        $buildExit = $LASTEXITCODE
        
        # Contar warnings y errores
        $warnings = ($buildOutput | Select-String "warning \w+" | Measure-Object).Count
        $errors = ($buildOutput | Select-String "error \w+" | Measure-Object).Count
        
        if ($buildExit -eq 0 -and $errors -eq 0) {
            $Results.Backend.Build.Pass = $true
            $Results.Backend.Build.Warnings = $warnings
            Write-Step "Build y Roslyn Analyzers" "OK"
            Write-Result $true "$warnings warnings, $errors errors"
        } else {
            $Results.Backend.Build.Pass = $false
            $Results.Backend.Build.Errors = $errors
            $Results.Backend.Build.Warnings = $warnings
            Write-Step "Build y Roslyn Analyzers" "FAIL"
            Write-Result $false "$warnings warnings, $errors errors"
            
            # Mostrar los errores relevantes (CA, S, IDE)
            $buildOutput | Select-String "(CA\d{4}|S\d{4}|IDE\d{4})" | Select-Object -First 30 | ForEach-Object {
                $line = $_.Line.Trim()
                if ($line -match "error") {
                    Write-Host "         $line" -ForegroundColor Red
                } elseif ($line -match "warning") {
                    Write-Host "         $line" -ForegroundColor Yellow
                }
            }
        }
    } catch {
        $Results.Backend.Build.Pass = $false
        $Results.Backend.Build.Details = $_.Exception.Message
        Write-Step "Build y Roslyn Analyzers" "FAIL"
        Write-Result $false $_.Exception.Message
    }
    Write-Host ""

    # --- 3. Tests + Arquitectura ---
    if (-not $SkipTests) {
        Write-Step "dotnet test (unit + integration + architecture)"
        try {
            $testOutput = & dotnet test --no-build --configuration Debug --verbosity normal 2>&1
            $testExit = $LASTEXITCODE
            
            # Parsear resultados
            $totalTests = 0
            $failedTests = 0
            $passedTests = 0
            
            if ($testOutput -match "Total tests: (\d+)") { $totalTests = [int]$Matches[1] }
            if ($testOutput -match "Failed: (\d+)") { $failedTests = [int]$Matches[1] }
            if ($testOutput -match "Passed: (\d+)") { $passedTests = [int]$Matches[1] }
            
            $Results.Backend.Tests.Total = $totalTests
            $Results.Backend.Tests.Failed = $failedTests
            
            if ($testExit -eq 0 -and $failedTests -eq 0) {
                $Results.Backend.Tests.Pass = $true
                Write-Step "Tests" "OK"
                Write-Result $true "Total: $totalTests, Passed: $passedTests, Failed: $failedTests"
            } else {
                $Results.Backend.Tests.Pass = $false
                Write-Step "Tests" "FAIL"
                Write-Result $false "Total: $totalTests, Passed: $passedTests, Failed: $failedTests"
                
                # Mostrar tests fallidos
                $testOutput | Select-String "Failed " | Select-Object -First 20 | ForEach-Object {
                    Write-Host "         $_" -ForegroundColor Red
                }
            }
        } catch {
            $Results.Backend.Tests.Pass = $false
            $Results.Backend.Tests.Details = $_.Exception.Message
            Write-Step "Tests" "FAIL"
            Write-Result $false $_.Exception.Message
        }
    } else {
        $Results.Backend.Tests.Pass = $true
        Write-Step "Tests (saltados con -SkipTests)" "SKIP"
    }
    Write-Host ""

    # --- 4. SCA — Dependencias ---
    if (-not $SkipSCA) {
        Write-Step "dotnet list package --vulnerable"
        try {
            $scaOutput = & dotnet list package --vulnerable 2>&1
            $scaExit = $LASTEXITCODE
            
            # Analizar salida para vulnerabilidades
            $highVulns = ($scaOutput | Select-String "high" | Measure-Object).Count
            $criticalVulns = ($scaOutput | Select-String "critical" | Measure-Object).Count
            
            if ($highVulns -eq 0 -and $criticalVulns -eq 0) {
                $Results.Backend.SCA.Pass = $true
                Write-Step "SCA — Dependencias NuGet" "OK"
                Write-Result $true "Sin vulnerabilidades high/critical"
            } else {
                $Results.Backend.SCA.Pass = $false
                $Results.Backend.SCA.High = $highVulns
                $Results.Backend.SCA.Critical = $criticalVulns
                Write-Step "SCA — Dependencias NuGet" "FAIL"
                Write-Result $false "$highVulns high, $criticalVulns critical"
                
                # Mostrar las vulnerabilidades
                $scaOutput | Select-String "(high|critical)" -Context 0,1 | ForEach-Object {
                    Write-Host "         $_" -ForegroundColor Red
                }
            }
        } catch {
            $Results.Backend.SCA.Pass = $false
            $Results.Backend.SCA.Details = $_.Exception.Message
            Write-Step "SCA — Dependencias NuGet" "FAIL"
            Write-Result $false $_.Exception.Message
        }
    } else {
        $Results.Backend.SCA.Pass = $true
        Write-Step "SCA — Dependencias NuGet (saltado con -SkipSCA)" "SKIP"
    }
    Write-Host ""
}

# ============================================================
# FRONTEND (React / Next.js)
# ============================================================
if (-not $BackendOnly) {
    Write-Host "=== FRONTEND (Next.js 16 / React 19) ===" -ForegroundColor Yellow
    Write-Host ""

    Push-Location $FrontendDir
    try {
        # --- 5. Lint ---
        Write-Step "npm run lint"
        try {
            $lintOutput = & npm run lint 2>&1
            $lintExit = $LASTEXITCODE
            
            if ($lintExit -eq 0) {
                $Results.Frontend.Lint.Pass = $true
                Write-Step "ESLint" "OK"
                Write-Result $true "Sin issues"
            } else {
                $Results.Frontend.Lint.Pass = $false
                Write-Step "ESLint" "FAIL"
                
                # Contar issues
                $warningCount = ($lintOutput | Select-String "warning" | Measure-Object).Count
                $errorCount = ($lintOutput | Select-String "error" | Measure-Object).Count
                $Results.Frontend.Lint.Issues = $warningCount + $errorCount
                Write-Result $false "$warningCount warnings, $errorCount errors"
                
                $lintOutput | Select-Object -Last 20 | ForEach-Object {
                    Write-Host "         $_" -ForegroundColor DarkGray
                }
            }
        } catch {
            $Results.Frontend.Lint.Pass = $false
            $Results.Frontend.Lint.Details = $_.Exception.Message
            Write-Step "ESLint" "FAIL"
            Write-Result $false $_.Exception.Message
        }
        Write-Host ""

        # --- 6. TypeScript Check ---
        Write-Step "npm run type-check (tsc --noEmit)"
        try {
            $tscOutput = & npm run type-check 2>&1
            $tscExit = $LASTEXITCODE
            
            if ($tscExit -eq 0) {
                $Results.Frontend.TypeCheck.Pass = $true
                Write-Step "TypeScript Check" "OK"
                Write-Result $true "Sin errores de tipo"
            } else {
                $Results.Frontend.TypeCheck.Pass = $false
                Write-Step "TypeScript Check" "FAIL"
                
                # Contar errores
                $typeErrors = ($tscOutput | Select-String "error TS\d+" | Measure-Object).Count
                Write-Result $false "$typeErrors errores de tipo encontrados"
                
                $tscOutput | Select-String "error TS\d+" | Select-Object -First 15 | ForEach-Object {
                    Write-Host "         $_" -ForegroundColor Red
                }
            }
        } catch {
            $Results.Frontend.TypeCheck.Pass = $false
            $Results.Frontend.TypeCheck.Details = $_.Exception.Message
            Write-Step "TypeScript Check" "FAIL"
            Write-Result $false $_.Exception.Message
        }
        Write-Host ""

        # --- 7. Tests ---
        if (-not $SkipTests) {
            Write-Step "npm run test -- --coverage"
            try {
                $vitestOutput = & npm run test -- --run --coverage 2>&1
                $vitestExit = $LASTEXITCODE
                
                # Parsear resultados de Vitest
                $totalFTests = 0
                $failedFTests = 0
                
                if ($vitestOutput -match "Tests\s+(\d+)\s+failed\s+\|\s+(\d+)\s+passed") {
                    $failedFTests = [int]$Matches[1]
                    $totalFPassed = [int]$Matches[2]
                    $totalFTests = $failedFTests + $totalFPassed
                }
                
                $Results.Frontend.Tests.Total = $totalFTests
                $Results.Frontend.Tests.Failed = $failedFTests
                
                if ($vitestExit -eq 0 -and $failedFTests -eq 0) {
                    $Results.Frontend.Tests.Pass = $true
                    Write-Step "Vitest Tests" "OK"
                    Write-Result $true "Total: $totalFTests, Failed: $failedFTests"
                } else {
                    $Results.Frontend.Tests.Pass = $false
                    Write-Step "Vitest Tests" "FAIL"
                    Write-Result $false "Total: $totalFTests, Failed: $failedFTests"
                    
                    $vitestOutput | Select-String "FAIL|×" | Select-Object -First 20 | ForEach-Object {
                        Write-Host "         $_" -ForegroundColor Red
                    }
                }
            } catch {
                $Results.Frontend.Tests.Pass = $false
                $Results.Frontend.Tests.Details = $_.Exception.Message
                Write-Step "Vitest Tests" "FAIL"
                Write-Result $false $_.Exception.Message
            }
        } else {
            $Results.Frontend.Tests.Pass = $true
            Write-Step "Vitest Tests (saltados con -SkipTests)" "SKIP"
        }
        Write-Host ""

        # --- 8. SCA — npm audit ---
        if (-not $SkipSCA) {
            Write-Step "npm audit"
            try {
                $auditOutput = & npm audit --audit-level=high 2>&1
                $auditExit = $LASTEXITCODE
                
                if ($auditExit -eq 0) {
                    $Results.Frontend.SCA.Pass = $true
                    Write-Step "SCA — Dependencias npm" "OK"
                    Write-Result $true "Sin vulnerabilidades high/critical"
                } else {
                    $Results.Frontend.SCA.Pass = $false
                    
                    # Parsear el summary
                    $auditJson = & npm audit --json 2>&1 | ConvertFrom-Json
                    if ($auditJson.metadata.vulnerabilities) {
                        $v = $auditJson.metadata.vulnerabilities
                        $Results.Frontend.SCA.High = $v.high
                        $Results.Frontend.SCA.Critical = $v.critical
                        Write-Step "SCA — Dependencias npm" "FAIL"
                        Write-Result $false "high: $($v.high), critical: $($v.critical), moderate: $($v.moderate)"
                    }
                    
                    $auditOutput | Select-Object -Last 15 | ForEach-Object {
                        Write-Host "         $_" -ForegroundColor Yellow
                    }
                }
            } catch {
                $Results.Frontend.SCA.Pass = $false
                $Results.Frontend.SCA.Details = $_.Exception.Message
                Write-Step "SCA — Dependencias npm" "FAIL"
                Write-Result $false $_.Exception.Message
            }
        } else {
            $Results.Frontend.SCA.Pass = $true
            Write-Step "SCA — Dependencias npm (saltado con -SkipSCA)" "SKIP"
        }
        Write-Host ""
    } finally {
        Pop-Location
    }
}

# ============================================================
# RESUMEN
# ============================================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DEL QUALITY GATE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$allPass = $true

if (-not $FrontendOnly) {
    Write-Host "--- Backend ---" -ForegroundColor Yellow
    $items = @(
        @{ Label = "Formateo";            Result = $Results.Backend.Format.Pass },
        @{ Label = "Build + Analyzers";   Result = $Results.Backend.Build.Pass },
        @{ Label = "Tests";               Result = $Results.Backend.Tests.Pass },
        @{ Label = "SCA (NuGet)";         Result = $Results.Backend.SCA.Pass }
    )
    foreach ($item in $items) {
        $mark = if ($item.Result) { "[PASS]" } else { $allPass = $false; "[FAIL]" }
        $color = if ($item.Result) { "Green" } else { "Red" }
        Write-Host "  $mark $($item.Label)" -ForegroundColor $color
    }
    Write-Host ""
}

if (-not $BackendOnly) {
    Write-Host "--- Frontend ---" -ForegroundColor Yellow
    $items = @(
        @{ Label = "ESLint";              Result = $Results.Frontend.Lint.Pass },
        @{ Label = "TypeScript Check";    Result = $Results.Frontend.TypeCheck.Pass },
        @{ Label = "Vitest Tests";        Result = $Results.Frontend.Tests.Pass },
        @{ Label = "SCA (npm)";           Result = $Results.Frontend.SCA.Pass }
    )
    foreach ($item in $items) {
        $mark = if ($item.Result) { "[PASS]" } else { $allPass = $false; "[FAIL]" }
        $color = if ($item.Result) { "Green" } else { "Red" }
        Write-Host "  $mark $($item.Label)" -ForegroundColor $color
    }
    Write-Host ""
}

$Results.OverallPass = $allPass

if ($allPass) {
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "  QUALITY GATE: PASSED" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
} else {
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "  QUALITY GATE: FAILED" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
}

Write-Host ""

# Salida JSON opcional
if ($JsonOutput) {
    $Results | ConvertTo-Json -Depth 3 | Write-Output
}

# Exit code: 0 si todo pasó, 1 si algo falló
if (-not $allPass) {
    exit 1
}
exit 0
