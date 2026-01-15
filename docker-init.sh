#!/bin/bash

# Script de inicialização do projeto Docker
# Use: ./docker-init.sh

echo "🐳 Iniciando setup Docker para digital-courses..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker Desktop e tente novamente."
    exit 1
fi

echo "✅ Docker está rodando"

# Copiar .env.example se .env não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado"
else
    echo "✅ Arquivo .env já existe"
fi

# Build das imagens
echo "🔨 Construindo imagens Docker..."
docker-compose build

# Subir containers
echo "🚀 Iniciando containers..."
docker-compose up -d

# Aguardar MySQL iniciar
echo "⏳ Aguardando MySQL iniciar (15s)..."
sleep 15

# Instalar dependências do Composer
echo "📦 Instalando dependências do Composer..."
docker-compose exec -T app composer install --no-interaction

# Gerar chave da aplicação
echo "🔑 Gerando chave da aplicação..."
docker-compose exec -T app php artisan key:generate

# Rodar migrations
echo "🗄️ Rodando migrations..."
docker-compose exec -T app php artisan migrate --force

# Rodar seeders
echo "🌱 Rodando seeders..."
docker-compose exec -T app php artisan db:seed --force

# Ajustar permissões
echo "🔧 Ajustando permissões..."
docker-compose exec -T app chmod -R 775 storage bootstrap/cache
docker-compose exec -T app chown -R www-data:www-data storage bootstrap/cache

echo ""
echo "✅ Setup completo!"
echo ""
echo "🌐 Aplicação disponível em: http://localhost:8000"
echo "🎨 Vite (frontend) em: http://localhost:5173"
echo "🗄️ MySQL em: localhost:3306"
echo "🔴 Redis em: localhost:6379"
echo ""
echo "Comandos úteis:"
echo "  docker-compose up -d          # Iniciar containers"
echo "  docker-compose down           # Parar containers"
echo "  docker-compose logs -f app    # Ver logs do app"
echo "  docker-compose exec app bash  # Acessar container"
echo "  docker-compose exec app php artisan migrate"
echo ""
