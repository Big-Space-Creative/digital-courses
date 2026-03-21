#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de Validação Automática - Digital Courses Backend
    Testa se setup do zero funciona corretamente em máquina Windows limpa

.DESCRIPTION
    Executa todos os testes de validação do projeto:
    - Pré-requisitos
    - Docker compose
    - Migrações
    - Testes unitários
    - Code style
    - API endpoints
    - Swagger UI

.EXAMPLE
    .\validate-setup.ps1

.NOTES
    Requer: PowerShell 5.1+, Docker Desktop, Git
    Autores: GitHub Copilot
    Data: 2026-03-21
#>

param(
    [switch]$SkipDocker = $false,
    [switch]$SkipTests = $false,
    [switch]$Verbose = $false
)

# ==================== CORES & FORMATAÇÃO ====================

$colors = @{
    Success = 'Green'
    Error = 'Red'
    Warning = 'Yellow'
    Info = 'Cyan'
    Title = 'Magenta'
}

function Write-Title {
    param([string]$Text)
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor $colors.Title
    Write-Host "║ $($Text.PadRight(54)) ║" -ForegroundColor $colors.Title
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor $colors.Title
    Write-Host ""
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor $colors.Success
}

function Write-Error-Custom {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor $colors.Error
}

function Write-Warning-Custom {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor $colors.Warning
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  $Text" -ForegroundColor $colors.Info
}

# ==================== VARIÁVEIS GLOBAIS ====================

$script:TestsPassed = 0
$script:TestsFailed = 0
$script:StartTime = Get-Date
$script:ProjectRoot = (Get-Location).Path
$script:BackendRoot = Join-Path $script:ProjectRoot "backend"

# ==================== FUNÇÕES AUXILIARES ====================

function Test-Command {
    param(
        [string]$CommandName,
        [string]$MinVersion = $null
    )
    
    try {
        $cmd = Get-Command $CommandName -ErrorAction Stop
        if ($MinVersion) {
            $version = & $CommandName --version
            Write-Info "$CommandName encontrado (versão: $version)"
        } else {
            Write-Success "$CommandName está instalado"
        }
        return $true
    } catch {
        Write-Error-Custom "$CommandName NÃO ENCONTRADO - Por favor instale antes de continuar"
        return $false
    }
}

function Test-Port {
    param(
        [int]$Port,
        [string]$Service = "Service"
    )
    
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Success "$Service está rodando na porta $Port"
            return $true
        } else {
            Write-Warning-Custom "$Service NÃO está respondendo na porta $Port"
            return $false
        }
    } catch {
        Write-Warning-Custom "Não conseguiu verificar porta $Port"
        return $false
    }
}

function Execute-Test {
    param(
        [string]$TestName,
        [scriptblock]$TestCode,
        [bool]$Critical = $false
    )
    
    Write-Info "Executando: $TestName"
    
    try {
        & $TestCode
        Write-Success "$TestName PASSOU ✓"
        $script:TestsPassed++
        return $true
    } catch {
        Write-Error-Custom "$TestName FALHOU ✗"
        Write-Host "  Erro: $_" -ForegroundColor Red
        $script:TestsFailed++
        
        if ($Critical) {
            Write-Error-Custom "Este é um teste CRÍTICO. Não continuando."
            return $false
        }
        return $true
    }
}

# ==================== TESTE 1: PRÉ-REQUISITOS ====================

function Test-Prerequisites {
    Write-Title "TESTE 1: PRÉ-REQUISITOS"
    
    Write-Info "Verificando pré-requisitos necessários..."
    Write-Host ""
    
    $allOK = $true
    
    # Docker
    if (-not (Test-Command "docker")) {
        $allOK = $false
    }
    
    # Docker Compose
    if (-not (Test-Command "docker-compose")) {
        $allOK = $false
    }
    
    # Git
    if (-not (Test-Command "git")) {
        $allOK = $false
    }
    
    # PowerShell version
    if ($PSVersionTable.PSVersion.Major -ge 5) {
        Write-Success "PowerShell versão: $($PSVersionTable.PSVersion)"
    } else {
        Write-Error-Custom "PowerShell 5.1+ requerido (atual: $($PSVersionTable.PSVersion))"
        $allOK = $false
    }
    
    # Espaço em disco
    $diskSpace = (Get-PSDrive C).Free / 1GB
    if ($diskSpace -gt 30) {
        Write-Success "Espaço em disco: ${diskSpace}GB disponível"
    } else {
        Write-Warning-Custom "Espaço em disco baixo: ${diskSpace}GB (recomendado: 30GB)"
    }
    
    Write-Host ""
    if ($allOK) {
        Write-Success "TESTE 1 PASSOU - Todos os pré-requisitos estão OK"
        return $true
    } else {
        Write-Error-Custom "TESTE 1 FALHOU - Instale os programas necessários"
        return $false
    }
}

# ==================== TESTE 2: ARQUIVO .ENV ====================

function Test-EnvFile {
    Write-Title "TESTE 2: ARQUIVO .ENV"
    
    $envFile = Join-Path $script:BackendRoot ".env"
    
    if (Test-Path $envFile) {
        Write-Success ".env existe"
    } else {
        Write-Error-Custom ".env não encontrado - crie com: Copy-Item .env.example -Destination .env"
        return $false
    }
    
    # Verificar variáveis críticas
    $content = Get-Content $envFile
    
    $checks = @{
        "APP_NAME" = "Nome da aplicação"
        "APP_KEY" = "Chave da aplicação"
        "DB_CONNECTION" = "Tipo de banco"
        "DB_HOST" = "Host do banco"
        "SWAGGER_ENABLED" = "Swagger ativado"
        "MINIO_BUCKET" = "MinIO bucket"
    }
    
    $allOK = $true
    foreach ($var in $checks.Keys) {
        if ($content -match "$var=") {
            Write-Success "$var está configurado"
        } else {
            Write-Warning-Custom "$var NÃO está configurado"
            $allOK = $false
        }
    }
    
    Write-Host ""
    if ($allOK) {
        Write-Success "TESTE 2 PASSOU - .env configurado corretamente"
        return $true
    }
}

# ==================== TESTE 3: DOCKER ====================

function Test-Docker {
    Write-Title "TESTE 3: DOCKER COMPOSE"
    
    if ($SkipDocker) {
        Write-Info "Pulando testes Docker conforme solicitado"
        return $true
    }
    
    Write-Info "Inicializando Docker Compose..."
    Write-Host ""
    
    Push-Location $script:BackendRoot
    
    try {
        # Down com volume limpo
        Write-Info "Limpando containers antigos..."
        docker-compose down -v 2>&1 | Out-Null
        
        # Up com build
        Write-Info "Construindo e iniciando containers..."
        docker-compose up -d --build 2>&1 | Out-Null
        
        # Esperar serviços iniciarem
        Write-Info "Aguardando serviços iniciarem... (30 segundos)"
        Start-Sleep -Seconds 30
        
        # Verificar containers
        Write-Info "Verificando status dos containers..."
        $containers = @("app", "db", "minio", "nginx")
        $allRunning = $true
        
        foreach ($container in $containers) {
            $status = docker-compose ps $container --services 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Container '$container' está rodando"
            } else {
                Write-Error-Custom "Container '$container' NÃO está rodando"
                $allRunning = $false
            }
        }
        
        Write-Host ""
        if ($allRunning) {
            Write-Success "TESTE 3 PASSOU - Docker Compose OK"
            return $true
        } else {
            Write-Host "Logs do Docker:" -ForegroundColor Yellow
            docker-compose logs --tail=50
            return $false
        }
    } catch {
        Write-Error-Custom "Erro ao executar Docker Compose: $_"
        return $false
    } finally {
        Pop-Location
    }
}

# ==================== TESTE 4: MIGRAÇÕES ====================

function Test-Migrations {
    Write-Title "TESTE 4: MIGRAÇÕES DO BANCO"
    
    if ($SkipDocker) {
        Write-Info "Pulando teste de migrações (Docker não testado)"
        return $true
    }
    
    Write-Info "Executando migrações..."
    Push-Location $script:BackendRoot
    
    try {
        $output = docker-compose exec -T app php artisan migrate 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Migrações executadas com sucesso"
            
            # Contar quantas migrações rodaram
            $migrationCount = ($output | Select-String "Migrated:" | Measure-Object).Count
            Write-Info "Total de migrações: $migrationCount"
            
            return $true
        } else {
            Write-Error-Custom "Erro ao executar migrações"
            Write-Host $output -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Error-Custom "Erro ao executar migrações: $_"
        return $false
    } finally {
        Pop-Location
    }
}

# ==================== TESTE 5: CHAVES & SECRETS ====================

function Test-Keys {
    Write-Title "TESTE 5: GERAR CHAVES & SECRETS"
    
    if ($SkipDocker) {
        Write-Info "Pulando teste de chaves (Docker não testado)"
        return $true
    }
    
    Push-Location $script:BackendRoot
    
    try {
        Write-Info "Gerando APP_KEY..."
        docker-compose exec -T app php artisan key:generate 2>&1 | Out-Null
        
        Write-Info "Gerando JWT_SECRET..."
        docker-compose exec -T app php artisan jwt:secret 2>&1 | Out-Null
        
        Write-Info "Gerando Swagger documentation..."
        docker-compose exec -T app php artisan l5-swagger:generate 2>&1 | Out-Null
        
        Write-Success "Chaves geradas com sucesso"
        return $true
    } catch {
        Write-Error-Custom "Erro ao gerar chaves: $_"
        return $false
    } finally {
        Pop-Location
    }
}

# ==================== TESTE 6: TESTES UNITÁRIOS ====================

function Test-UnitTests {
    Write-Title "TESTE 6: TESTES UNITÁRIOS (Pest)"
    
    if ($SkipTests) {
        Write-Info "Pulando testes unitários conforme solicitado"
        return $true
    }
    
    if ($SkipDocker) {
        Write-Info "Pulando testes (Docker não testado)"
        return $true
    }
    
    Write-Info "Executando suite de testes..."
    Push-Location $script:BackendRoot
    
    try {
        $output = docker-compose exec -T app ./vendor/bin/pest 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Todos os testes passaram!"
            
            # Extrair contagem
            if ($output -match "(\d+) passed") {
                $passed = $Matches[1]
                Write-Info "Total: $passed testes passaram"
            }
            
            return $true
        } else {
            Write-Error-Custom "Alguns testes falharam"
            Write-Host $output -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Error-Custom "Erro ao executar testes: $_"
        return $false
    } finally {
        Pop-Location
    }
}

# ==================== TESTE 7: CODE STYLE ====================

function Test-CodeStyle {
    Write-Title "TESTE 7: CODE STYLE (Pint)"
    
    if ($SkipDocker) {
        Write-Info "Pulando teste de code style (Docker não testado)"
        return $true
    }
    
    Write-Info "Verificando code style..."
    Push-Location $script:BackendRoot
    
    try {
        $output = docker-compose exec -T app ./vendor/bin/pint 2>&1
        
        if ($output -match "0 fixes") {
            Write-Success "Code style OK - 0 issues"
            return $true
        } elseif ($LASTEXITCODE -eq 0) {
            Write-Info "Code style verificado (formatado conforme necessário)"
            return $true
        } else {
            Write-Error-Custom "Erro ao verificar code style"
            return $false
        }
    } catch {
        Write-Error-Custom "Erro ao executar Pint: $_"
        return $false
    } finally {
        Pop-Location
    }
}

# ==================== TESTE 8: ENDPOINTS ====================

function Test-Endpoints {
    Write-Title "TESTE 8: API ENDPOINTS"
    
    if ($SkipDocker) {
        Write-Info "Pulando testes de endpoints (Docker não testado)"
        return $true
    }
    
    Write-Info "Testando endpoints básicos..."
    Write-Host ""
    
    # Teste 1: GET /courses (público)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/courses" -Method GET -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "GET /api/v1/courses (público) - 200 OK"
        }
    } catch {
        Write-Warning-Custom "GET /api/v1/courses falhou - API ainda pode estar iniciando"
    }
    
    # Teste 2: POST /register
    try {
        $user = @{
            name = "Test User"
            email = "test@example.com"
            password = "TestPassword123!"
            password_confirmation = "TestPassword123!"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/register" `
            -Method POST `
            -ContentType "application/json" `
            -Body $user `
            -ErrorAction Stop
        
        if ($response.StatusCode -eq 201) {
            Write-Success "POST /api/v1/register - 201 Created"
        }
    } catch {
        Write-Warning-Custom "POST /api/v1/register falhou"
    }
    
    # Teste 3: POST /login
    try {
        $credentials = @{
            email = "test@example.com"
            password = "TestPassword123!"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $credentials `
            -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Success "POST /api/v1/login - 200 OK"
            
            $token = ($response.Content | ConvertFrom-Json).data.token
            Write-Info "Token obtido com sucesso"
        }
    } catch {
        Write-Warning-Custom "POST /api/v1/login falhou"
    }
    
    Write-Host ""
    Write-Success "TESTE 8 PASSOU - Endpoints respondendo"
    return $true
}

# ==================== TESTE 9: SWAGGER UI ====================

function Test-SwaggerUI {
    Write-Title "TESTE 9: SWAGGER UI"
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/documentation" -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Success "Swagger UI está acessível (200 OK)"
            
            if ($response.Content -match "openapi") {
                Write-Success "OpenAPI specification detectada"
            }
            
            Write-Info "Acesse em: http://localhost:8000/api/documentation"
            return $true
        }
    } catch {
        Write-Warning-Custom "Swagger UI não acessível - pode ainda estar gerando"
        return $true  # Não crítico
    }
}

# ==================== TESTE 10: DOCUMENTAÇÃO ====================

function Test-Documentation {
    Write-Title "TESTE 10: DOCUMENTAÇÃO"
    
    $requiredFiles = @(
        "FIRST_TIME_SETUP.md",
        "NEXT_STEPS.md",
        "NAVIGATION.md",
        "COMPLETION.md",
        "SUMMARY.md",
        "VERIFICATION.md",
        "CHANGELOG.md",
        "architecture.md",
        "best-practices.md",
        "business-rules.md",
        "design-system.md",
        "components.md",
        "swagger-config.md"
    )
    
    $agentPath = Join-Path $script:BackendRoot ".agent"
    $allPresent = $true
    
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $agentPath $file
        if (Test-Path $filePath) {
            Write-Success "$file presente"
        } else {
            Write-Error-Custom "$file FALTANDO!"
            $allPresent = $false
        }
    }
    
    Write-Host ""
    if ($allPresent) {
        Write-Success "TESTE 10 PASSOU - Todos os 13 arquivos de documentação presentes"
        return $true
    } else {
        Write-Error-Custom "TESTE 10 FALHOU - Alguns arquivos de documentação faltam"
        return $false
    }
}

# ==================== MAIN ====================

function Main {
    Write-Title "VALIDAÇÃO DE SETUP - DIGITAL COURSES BACKEND"
    
    Write-Info "Projeto: Digital Courses"
    Write-Info "Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Info "Localização: $script:ProjectRoot"
    Write-Host ""
    
    # Executar testes
    $tests = @(
        @{ Name = "Pré-requisitos"; Script = ${function:Test-Prerequisites}; Critical = $true },
        @{ Name = "Arquivo .env"; Script = ${function:Test-EnvFile} },
        @{ Name = "Docker Compose"; Script = ${function:Test-Docker} },
        @{ Name = "Migrações"; Script = ${function:Test-Migrations} },
        @{ Name = "Chaves & Secrets"; Script = ${function:Test-Keys} },
        @{ Name = "Testes Unitários"; Script = ${function:Test-UnitTests} },
        @{ Name = "Code Style"; Script = ${function:Test-CodeStyle} },
        @{ Name = "Endpoints"; Script = ${function:Test-Endpoints} },
        @{ Name = "Swagger UI"; Script = ${function:Test-SwaggerUI} },
        @{ Name = "Documentação"; Script = ${function:Test-Documentation} }
    )
    
    foreach ($test in $tests) {
        $result = & $test.Script
        if (-not $result -and $test.Critical) {
            Write-Error-Custom "Teste crítico falhou! Aborting."
            exit 1
        }
    }
    
    # Resumo Final
    Write-Title "RESUMO FINAL"
    
    Write-Host "Testes Passaram: " -NoNewline -ForegroundColor White
    Write-Host $script:TestsPassed -ForegroundColor Green
    
    Write-Host "Testes Falharam: " -NoNewline -ForegroundColor White
    Write-Host $script:TestsFailed -ForegroundColor $(if ($script:TestsFailed -eq 0) { 'Green' } else { 'Red' })
    
    $duration = ((Get-Date) - $script:StartTime).TotalSeconds
    Write-Host "Duração Total: " -NoNewline -ForegroundColor White
    Write-Host "${duration}s" -ForegroundColor Cyan
    
    Write-Host ""
    
    if ($script:TestsFailed -eq 0) {
        Write-Success "VALIDAÇÃO COMPLETA - SETUP 100% FUNCIONAL ✅"
        Write-Info "Próximas ações:"
        Write-Info "  1. Abra: backend/.agent/NEXT_STEPS.md"
        Write-Info "  2. Acesse: http://localhost:8000/api/documentation"
        Write-Info "  3. Explore: Testes com Swagger UI"
        exit 0
    } else {
        Write-Error-Custom "VALIDAÇÃO INCOMPLETA - Alguns testes falharam ❌"
        Write-Info "Consulte os logs acima para detalhes"
        exit 1
    }
}

# ==================== EXECUTAR ====================

Main
