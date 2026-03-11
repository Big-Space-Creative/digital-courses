#!/bin/sh
set -e

APP_DIR=${APP_DIR:-/var/www}
APP_USER=${APP_USER:-laravel}
WEB_USER=${WEB_USER:-www-data}

echo "========================================"
echo "🚀 Iniciando Digital Courses API..."
echo "========================================"

cd "$APP_DIR"

# Criar diretórios necessários e configurar permissões
echo "[entrypoint] Configurando permissões..."
mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views storage/framework/testing storage/app/public bootstrap/cache vendor
chown -R "$WEB_USER":"$WEB_USER" storage bootstrap/cache 2>/dev/null || true
chown -R "$APP_USER":"$APP_USER" vendor 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

if [ ! -f .env ] && [ -f .env.example ]; then
  echo "[entrypoint] .env não encontrado. Usando .env.example como base."
  cp .env.example .env
  chown "$WEB_USER":"$WEB_USER" .env
fi

if [ ! -f vendor/autoload.php ]; then
  echo "[entrypoint] 📦 Instalando dependências PHP via Composer..."
  gosu "$APP_USER" composer install --no-interaction --prefer-dist --no-progress --no-scripts
  echo "[entrypoint] ✅ Dependências instaladas!"
  
  # Reconfigurar permissões após composer install e antes dos scripts
  chown -R "$WEB_USER":"$WEB_USER" storage bootstrap/cache 2>/dev/null || true
  chmod -R 775 storage bootstrap/cache 2>/dev/null || true
  
  echo "[entrypoint] 📦 Executando scripts do Composer..."
  gosu "$WEB_USER" composer run-script post-autoload-dump
  echo "[entrypoint] ✅ Scripts executados com sucesso!"
fi

# Garantir permissões corretas sempre
chown -R "$WEB_USER":"$WEB_USER" storage bootstrap/cache 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# Tornar artisan executável
chmod +x artisan 2>/dev/null || true

if [ -f artisan ]; then
  # Verificar se APP_KEY está vazia e gerar se necessário
  if ! grep -q "^APP_KEY=base64:" .env 2>/dev/null; then
    echo "[entrypoint] 🔑 Gerando chave da aplicação..."
    gosu "$WEB_USER" php artisan key:generate --force
    echo "[entrypoint] ✅ Chave gerada!"
  fi
  
  # Verificar se JWT_SECRET está vazia e gerar se necessário
  if ! grep -q "^JWT_SECRET=" .env 2>/dev/null || grep -q "^JWT_SECRET=$" .env 2>/dev/null; then
    echo "[entrypoint] 🔐 Gerando JWT secret..."
    gosu "$WEB_USER" php artisan jwt:secret --force
    echo "[entrypoint] ✅ JWT secret gerado!"
  fi
  
  # Aguardar banco de dados estar disponível
  echo "[entrypoint] ⏳ Aguardando banco de dados..."
  MAX_TRIES=30
  COUNT=0
  until gosu "$WEB_USER" php artisan db:show >/dev/null 2>&1 || [ $COUNT -eq $MAX_TRIES ]; do
    COUNT=$((COUNT+1))
    echo "[entrypoint] Tentativa $COUNT/$MAX_TRIES..."
    sleep 2
  done
  
  if [ $COUNT -eq $MAX_TRIES ]; then
    echo "[entrypoint] ⚠️  Não foi possível conectar ao banco de dados"
  else
    echo "[entrypoint] ✅ Banco de dados conectado!"
    
    # Rodar migrations
    echo "[entrypoint] 🗄️  Executando migrações..."
    if gosu "$WEB_USER" php artisan migrate --force; then
      echo "[entrypoint] ✅ Migrações executadas com sucesso!"
    else
      echo "[entrypoint] ⚠️  Erro ao executar migrações"
    fi
  fi
  
  # Storage link
  gosu "$WEB_USER" php artisan storage:link >/dev/null 2>&1 || true

  # Criar diretório para a spec Swagger e garantir permissões para www-data
  mkdir -p storage/api-docs
  chown -R "$WEB_USER":"$WEB_USER" storage/api-docs
  chmod -R 775 storage/api-docs

  # Gerar spec Swagger na inicialização
  echo "[entrypoint] 📄 Gerando documentação Swagger..."
  if gosu "$WEB_USER" php artisan l5-swagger:generate; then
    echo "[entrypoint] ✅ Swagger gerado com sucesso!"
  else
    echo "[entrypoint] ⚠️  Aviso: Swagger não pôde ser gerado agora (será gerado na primeira requisição)"
  fi
  
  echo ""
  echo "========================================"
  echo "✨ Digital Courses API pronta!"
  echo "========================================"
  echo "📍 Backend API: http://localhost:8000"
  echo "📍 Frontend: http://localhost:3000"
  echo "📍 pgAdmin: http://localhost:8080"
  echo "📍 MinIO: http://localhost:9001"
  echo "========================================"
fi

exec "$@"
