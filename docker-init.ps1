param(
    [string]$BackendDir = "backend"
)

$ErrorActionPreference = "Continue"

# Garantir que o script sempre roda a partir da pasta do projeto (onde o .ps1 esta)
$ProjectRoot = $PSScriptRoot
if (-not $ProjectRoot) {
    $ProjectRoot = Split-Path -Parent $PSCommandPath
}
Set-Location $ProjectRoot

Write-Host "====================================================" 
Write-Host "  Digital Courses - Setup Docker (PowerShell)" 
Write-Host "====================================================" 
Write-Host "Pasta do projeto: $ProjectRoot" 
Write-Host ""

# Passo 1: Verificar Docker
Write-Host "[1/9] Verificando se o Docker esta em execucao..."
docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Docker nao esta rodando. Inicie o Docker Desktop e tente novamente." -ForegroundColor Red
    Read-Host "Pressione ENTER para sair"
    exit 1
}
Write-Host "OK: Docker esta rodando." -ForegroundColor Green
Write-Host ""

# Passo 2: Verificar pasta do backend
$BackendPath = Join-Path $ProjectRoot $BackendDir
Write-Host "[2/9] Verificando pasta do backend ($BackendPath)..."
if (-not (Test-Path $BackendPath)) {
    Write-Host "ERRO: Pasta '$BackendPath' nao encontrada. Verifique se o clone foi feito corretamente." -ForegroundColor Red
    Read-Host "Pressione ENTER para sair"
    exit 1
}
Write-Host "OK: Pasta do backend encontrada." -ForegroundColor Green
Write-Host ""

# Detectar comando docker compose
Write-Host "[3/9] Detectando comando do Docker Compose..."
$script:UseDockerSubcommand = $false

# Testar 'docker-compose' (preferencial)
docker-compose version *> $null
if ($LASTEXITCODE -eq 0) {
    $script:UseDockerSubcommand = $false
}
else {
    # Testar 'docker compose' (plugin v2)
    docker compose version *> $null
    if ($LASTEXITCODE -eq 0) {
        $script:UseDockerSubcommand = $true
    }
    else {
        Write-Host "ERRO: Docker Compose (docker-compose ou docker compose) nao foi encontrado. Certifique-se de que o Docker Desktop esta instalado com o Docker Compose habilitado." -ForegroundColor Red
        Read-Host "Pressione ENTER para sair"
        exit 1
    }
}

if ($script:UseDockerSubcommand) {
    Write-Host "OK: Usando comando: docker compose" -ForegroundColor Green
}
else {
    Write-Host "OK: Usando comando: docker-compose" -ForegroundColor Green
}
Write-Host ""

# Helper para checar ultimo codigo de saida
function Check-LastExitCode {
    param(
        [string]$StepDescription
    )
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha na etapa: $StepDescription" -ForegroundColor Red
        Read-Host "Pressione ENTER para sair"
        exit 1
    }
}

# Passo 4: Garantir .env
Write-Host "[4/9] Garantindo que o arquivo de configuracao .env existe..."
$envPath = Join-Path $BackendPath ".env"
$envDockerExample = Join-Path $BackendPath ".env.docker.example"
$envExample = Join-Path $BackendPath ".env.example"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envDockerExample) {
        Write-Host "Criando arquivo .env a partir de .env.docker.example..."
        Copy-Item $envDockerExample $envPath -Force
    }
    elseif (Test-Path $envExample) {
        Write-Host "Aviso: .env.docker.example nao encontrado, usando .env.example..."
        Copy-Item $envExample $envPath -Force
    }
    else {
        Write-Host "ERRO: Nenhum arquivo de exemplo de .env encontrado em '$BackendDir'." -ForegroundColor Red
        Read-Host "Pressione ENTER para sair"
        exit 1
    }

    if (-not (Test-Path $envPath)) {
        Write-Host "ERRO: Falha ao criar o arquivo .env." -ForegroundColor Red
        Read-Host "Pressione ENTER para sair"
        exit 1
    }
    Write-Host "OK: Arquivo .env criado." -ForegroundColor Green
}
else {
    Write-Host "OK: Arquivo .env ja existe." -ForegroundColor Green
    }
    Write-Host ""

# Passo 5: Build imagens
Write-Host "[5/9] Construindo imagens Docker (pode demorar)..."
$ComposeFile = Join-Path $ProjectRoot 'docker-compose.yml'
if (-not (Test-Path $ComposeFile)) {
    Write-Host "ERRO: Arquivo docker-compose.yml nao encontrado em '$ProjectRoot'." -ForegroundColor Red
    Read-Host "Pressione ENTER para sair"
    exit 1
}
Write-Host "Usando arquivo de compose: $ComposeFile"
if ($script:UseDockerSubcommand) {
    docker compose --env-file $envPath -f $ComposeFile build
}
else {
    docker-compose --env-file $envPath -f $ComposeFile build
}
Check-LastExitCode -StepDescription "build das imagens Docker"
Write-Host "OK: Imagens construidas." -ForegroundColor Green
Write-Host ""

# Passo 6: Subir containers
Write-Host "[6/9] Subindo containers em segundo plano..."
if ($script:UseDockerSubcommand) {
    docker compose --env-file $envPath -f $ComposeFile up -d
}
else {
    docker-compose --env-file $envPath -f $ComposeFile up -d
}
Check-LastExitCode -StepDescription "subir containers"
Write-Host "OK: Containers iniciados." -ForegroundColor Green
Write-Host ""

Write-Host "Aguardando o banco de dados PostgreSQL iniciar (3 segundos)..."
Start-Sleep -Seconds 3
Write-Host ""

# Passo 7: Composer install
Write-Host "[7/9] Instalando dependencias PHP com Composer dentro do container app..."
if ($script:UseDockerSubcommand) {
    docker compose --env-file $envPath -f $ComposeFile exec -T -u root app composer install --no-interaction --prefer-dist --no-progress
}
else {
    docker-compose --env-file $envPath -f $ComposeFile exec -T -u root app composer install --no-interaction --prefer-dist --no-progress
}
Check-LastExitCode -StepDescription "composer install"
Write-Host "OK: Dependencias PHP instaladas." -ForegroundColor Green
Write-Host ""

# Passo 8: Preparar Laravel (key, migrate, seed, caches)
Write-Host "[8/9] Preparando aplicacao Laravel (key, migrations, seeders, caches)..."

Write-Host "- Gerando chave da aplicacao..."
if ($script:UseDockerSubcommand) {
    docker compose --env-file $envPath -f $ComposeFile exec -T app php artisan key:generate --force
}
else {
    docker-compose --env-file $envPath -f $ComposeFile exec -T app php artisan key:generate --force
}
Check-LastExitCode -StepDescription "php artisan key:generate"

Write-Host "- Rodando migrations..."
if ($script:UseDockerSubcommand) {
    docker compose --env-file $envPath -f $ComposeFile exec -T app php artisan migrate --force
}
else {
    docker-compose --env-file $envPath -f $ComposeFile exec -T app php artisan migrate --force
}
Check-LastExitCode -StepDescription "php artisan migrate"

Write-Host "- Rodando seeders..."
if ($script:UseDockerSubcommand) {
    docker compose --env-file $envPath -f $ComposeFile exec -T app php artisan db:seed --force
}
else {
    docker-compose --env-file $envPath -f $ComposeFile exec -T app php artisan db:seed --force
}
Check-LastExitCode -StepDescription "php artisan db:seed"

Write-Host "- Gerando caches de configuracao e rotas (quando aplicavel)..."
if ($script:UseDockerSubcommand) {
    docker compose --env-file $envPath -f $ComposeFile exec -T app php artisan config:cache
}
else {
    docker-compose --env-file $envPath -f $ComposeFile exec -T app php artisan config:cache
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "Aviso: Nao foi possivel gerar o cache de configuracao (config:cache)." -ForegroundColor Yellow
}
if ($script:UseDockerSubcommand) {
    docker compose --env-file $envPath -f $ComposeFile exec -T app php artisan route:cache
}
else {
    docker-compose --env-file $envPath -f $ComposeFile exec -T app php artisan route:cache
}

Write-Host "- Verificando link simbolico de storage..."
if ($script:UseDockerSubcommand) {
    docker compose --env-file $envPath -f $ComposeFile exec -T app php artisan storage:link *> $null
}
else {
    docker-compose --env-file $envPath -f $ComposeFile exec -T app php artisan storage:link *> $null
}

Write-Host "- Ajustando permissoes de storage e cache..."
if ($script:UseDockerSubcommand) {
    docker compose --env-file $envPath -f $ComposeFile exec -T app sh -c "chmod -R 775 storage bootstrap/cache 2>/dev/null || true"
    docker compose --env-file $envPath -f $ComposeFile exec -T app sh -c "chown -R www-data:www-data storage/bootstrap/cache 2>/dev/null || true"
}
else {
    docker-compose --env-file $envPath -f $ComposeFile exec -T app sh -c "chmod -R 775 storage bootstrap/cache 2>/dev/null || true"
    docker-compose --env-file $envPath -f $ComposeFile exec -T app sh -c "chown -R www-data-www-data storage/bootstrap/cache 2>/dev/null || true"
}
Write-Host "OK: Aplicacao Laravel preparada." -ForegroundColor Green
Write-Host ""

# Passo 9: Finalizacao
Write-Host "[9/9] Finalizando setup..."
Write-Host ""
Write-Host "Setup completo com sucesso." -ForegroundColor Green
Write-Host ""
Write-Host "Servicos principais:" 
Write-Host "  API (Laravel + Nginx): http://localhost:8000"
Write-Host "  PostgreSQL:            localhost:5432"
Write-Host "  pgAdmin:               http://localhost:8080"
Write-Host "  MinIO (S3 API):        http://localhost:9000"
Write-Host "  MinIO Console:         http://localhost:9001"
Write-Host "  Redis:                 localhost:6379"
Write-Host "  Frontend Next.js:      http://localhost:3000  (quando pasta 'frontend' existir com package.json)"
Write-Host ""
Write-Host "Comandos uteis (executar na pasta do projeto):" 
if ($script:UseDockerSubcommand) {
    Write-Host "  docker compose up -d          # Iniciar todos os containers"
    Write-Host "  docker compose down           # Parar e remover containers"
    Write-Host "  docker compose logs -f app    # Ver logs do app Laravel"
    Write-Host "  docker compose exec app bash  # Acessar o container app"
    Write-Host "  docker compose exec app php artisan migrate"
}
else {
    Write-Host "  docker-compose up -d          # Iniciar todos os containers"
    Write-Host "  docker-compose down           # Parar e remover containers"
    Write-Host "  docker-compose logs -f app    # Ver logs do app Laravel"
    Write-Host "  docker-compose exec app bash  # Acessar o container app"
    Write-Host "  docker-compose exec app php artisan migrate"
}
Write-Host ""
Write-Host "Observacao: o container 'frontend' so executara o servidor Next.js" 
Write-Host "quando a pasta .\\frontend existir e tiver um arquivo package.json." 
Write-Host ""

Read-Host "Pressione ENTER para sair"
exit 0
