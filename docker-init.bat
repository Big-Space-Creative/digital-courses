@echo off
setlocal ENABLEDELAYEDEXPANSION
REM Script de inicializacao do projeto Docker para Windows
REM Use: docker-init.bat

set "BACKEND_DIR=backend"
set "COMPOSE_CMD="

echo ====================================================
echo   Digital Courses - Setup Docker (Windows CMD)
echo ====================================================
echo.

echo [1/9] Verificando se o Docker esta em execucao...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Docker nao esta rodando. Inicie o Docker Desktop e tente novamente.
    goto :error
)
echo OK: Docker esta rodando.
echo.

echo [2/9] Verificando pasta do backend (%BACKEND_DIR%)...
if not exist "%BACKEND_DIR%" (
    echo ERRO: Pasta "%BACKEND_DIR%" nao encontrada. Verifique se o clone foi feito corretamente.
    goto :error
)
echo OK: Pasta do backend encontrada.
echo.

echo [3/9] Detectando comando do Docker Compose...
docker compose version >nul 2>&1
if %errorlevel%==0 (
    set "COMPOSE_CMD=docker compose"
    goto :compose_ok
)

docker-compose version >nul 2>&1
if %errorlevel%==0 (
    set "COMPOSE_CMD=docker-compose"
    goto :compose_ok
)

echo ERRO: Docker Compose nao encontrado. Certifique-se de que o Docker Desktop esta instalado com o Docker Compose habilitado.
goto :error

:compose_ok
echo OK: Usando comando: %COMPOSE_CMD%
echo.

echo [4/9] Garantindo que o arquivo de configuracao .env existe...
REM Copiar .env.docker.example se .env nao existir (preferir config de Docker)
if not exist "%BACKEND_DIR%\.env" (
    if exist "%BACKEND_DIR%\.env.docker.example" (
        echo Criando arquivo .env a partir de .env.docker.example...
        copy "%BACKEND_DIR%\.env.docker.example" "%BACKEND_DIR%\.env" >nul
    ) else (
        echo Aviso: .env.docker.example nao encontrado, usando .env.example...
        if exist "%BACKEND_DIR%\.env.example" (
            copy "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
        ) else (
            echo ERRO: Nenhum arquivo de exemplo de .env encontrado em "%BACKEND_DIR%".
            goto :error
        )
    )
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao criar o arquivo .env.
        goto :error
    )
    echo OK: Arquivo .env criado.
) else (
    echo OK: Arquivo .env ja existe.
)
echo.

REM Sincronizar .env do backend com .env na raiz (usado pelo docker compose para variaveis DB_*, PGADMIN_* etc.)
echo Sincronizando variaveis de ambiente para docker-compose (.env na raiz)...
copy "%BACKEND_DIR%\.env" ".env" >nul
if %errorlevel% neq 0 (
    echo ERRO: Falha ao copiar %%BACKEND_DIR%%\.env para .env na raiz.
    goto :error
)
echo OK: Arquivo .env na raiz atualizado.
echo.

echo [5/9] Construindo imagens Docker (pode demorar)...
%COMPOSE_CMD% -f docker-compose.yml build
if %errorlevel% neq 0 (
    echo ERRO: Falha ao construir as imagens Docker.
    goto :error
)
echo OK: Imagens construidas.
echo.

echo [6/9] Subindo containers em segundo plano...
%COMPOSE_CMD% -f docker-compose.yml up -d
if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar os containers.
    goto :error
)
echo OK: Containers iniciados.
echo.

echo Aguardando o banco de dados PostgreSQL iniciar (15 segundos)...
timeout /t 15 /nobreak >nul
echo.

echo [7/9] Instalando dependencias PHP com Composer dentro do container app...
%COMPOSE_CMD% -f docker-compose.yml exec -T -u root app composer install --no-interaction --prefer-dist --no-progress
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do Composer.
    goto :error
)
echo OK: Dependencias PHP instaladas.
echo.

echo [8/9] Preparando aplicacao Laravel (key, migrations, seeders, caches)...
echo - Gerando chave da aplicacao...
%COMPOSE_CMD% -f docker-compose.yml exec -T app php artisan key:generate --force
if %errorlevel% neq 0 (
    echo ERRO: Falha ao gerar a chave da aplicacao.
    goto :error
)

echo - Rodando migrations...
%COMPOSE_CMD% -f docker-compose.yml exec -T app php artisan migrate --force
if %errorlevel% neq 0 (
    echo ERRO: Falha ao rodar as migrations.
    goto :error
)

echo - Rodando seeders...
%COMPOSE_CMD% -f docker-compose.yml exec -T app php artisan db:seed --force
if %errorlevel% neq 0 (
    echo ERRO: Falha ao rodar os seeders.
    goto :error
)

echo - Gerando caches de configuracao e rotas (quando aplicavel)...
%COMPOSE_CMD% -f docker-compose.yml exec -T app php artisan config:cache
if %errorlevel% neq 0 (
    echo Aviso: Nao foi possivel gerar o cache de configuracao (config:cache).
)
%COMPOSE_CMD% -f docker-compose.yml exec -T app php artisan route:cache

echo - Verificando link simbolico de storage...
%COMPOSE_CMD% -f docker-compose.yml exec -T app php artisan storage:link 2>nul

echo - Ajustando permissoes de storage e cache...
%COMPOSE_CMD% -f docker-compose.yml exec -T app sh -c "chmod -R 775 storage bootstrap/cache 2>/dev/null || true"
%COMPOSE_CMD% -f docker-compose.yml exec -T app sh -c "chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true"
echo OK: Aplicacao Laravel preparada.
echo.

echo [9/9] Finalizando setup...
echo.
echo Setup completo com sucesso.
echo.
echo Servicos principais:
echo   API (Laravel + Nginx): http://localhost:8000
echo   PostgreSQL:            localhost:5432
echo   pgAdmin:               http://localhost:8080
echo   MinIO (S3 API):        http://localhost:9000
echo   MinIO Console:         http://localhost:9001
echo   Redis:                 localhost:6379
echo   Frontend Next.js:      http://localhost:3000  (quando pasta frontend existir com package.json)
echo.
echo Comandos uteis (executar na pasta do projeto):
echo   %COMPOSE_CMD% up -d          ^# Iniciar todos os containers
echo   %COMPOSE_CMD% down           ^# Parar e remover containers
echo   %COMPOSE_CMD% logs -f app    ^# Ver logs do app Laravel
echo   %COMPOSE_CMD% exec app bash  ^# Acessar o container app
echo   %COMPOSE_CMD% exec app php artisan migrate
echo.
echo Observacao: o container "frontend" so executara o servidor Next.js
echo quando a pasta .\frontend existir e tiver um arquivo package.json.
echo.
pause
exit /b 0

:error
echo.
echo ERRO: Ocorreu um problema durante o setup. Verifique as mensagens acima.
echo.
pause
exit /b 1
