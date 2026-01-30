@echo off
REM Script de inicialização do projeto Docker para Windows
REM Use: docker-init.bat

set BACKEND_DIR=backend

echo 🐳 Iniciando setup Docker para digital-courses...
echo.

REM Verificar se Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando. Inicie o Docker Desktop e tente novamente.
    exit /b 1
)

echo ✅ Docker está rodando
echo.

REM Copiar .env.docker.example se .env não existir (preferir config de Docker)
if not exist %BACKEND_DIR%\.env (
    if exist %BACKEND_DIR%\.env.docker.example (
        echo 📝 Criando arquivo .env a partir de .env.docker.example...
        copy %BACKEND_DIR%\.env.docker.example %BACKEND_DIR%\.env
    ) else (
        echo ⚠️  .env.docker.example não encontrado, usando .env.example...
        copy %BACKEND_DIR%\.env.example %BACKEND_DIR%\.env
    )
    echo ✅ Arquivo .env criado
) else (
    echo ✅ Arquivo .env já existe
)
echo.

REM Build das imagens
echo 🔨 Construindo imagens Docker...
docker-compose build

REM Subir containers
echo 🚀 Iniciando containers...
docker-compose up -d

REM Aguardar PostgreSQL iniciar
echo ⏳ Aguardando PostgreSQL iniciar (15s)...
timeout /t 15 /nobreak >nul

REM Instalar dependências do Composer
echo 📦 Instalando dependências do Composer...
docker-compose exec -T app composer install --no-interaction

REM Gerar chave da aplicação
echo 🔑 Gerando chave da aplicação...
docker-compose exec -T app php artisan key:generate

REM Rodar migrations
echo 🗄️ Rodando migrations...
docker-compose exec -T app php artisan migrate --force

REM Rodar seeders
echo 🌱 Rodando seeders...
docker-compose exec -T app php artisan db:seed --force

REM Ajustar permissões
echo 🔧 Ajustando permissões...
docker-compose exec -T app chmod -R 775 storage bootstrap/cache
docker-compose exec -T app chown -R www-data:www-data storage bootstrap/cache

echo.
echo ✅ Setup completo!
echo.
echo 🌐 API disponível em: http://localhost:8000
echo 🗄️ pgAdmin em: http://localhost:8080
echo 🗄️ PostgreSQL em: localhost:5432
echo 📦 MinIO (S3) em: http://localhost:9000 (console: http://localhost:9001)
echo 🔴 Redis em: localhost:6379
echo.
echo Comandos úteis:
echo   docker-compose up -d          # Iniciar containers
echo   docker-compose down           # Parar containers
echo   docker-compose logs -f app    # Ver logs do app
echo   docker-compose exec app bash  # Acessar container
echo   docker-compose exec app php artisan migrate
echo.
echo Lembrete: o frontend React/Next.js roda em .\frontend (container "frontend").
echo.
pause
