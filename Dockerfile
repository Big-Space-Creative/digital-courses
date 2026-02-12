# Dockerfile para Laravel (PHP 8.4 com FPM, alinhado com composer.lock)
FROM php:8.4-fpm

# Argumentos de build
ARG user=laravel
ARG uid=1000

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gosu \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    libzip-dev \
    && docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip opcache

# Instalar Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Limpar cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Criar usuário do sistema para rodar Composer e Artisan
RUN useradd -G www-data,root -u $uid -d /home/$user $user
RUN mkdir -p /home/$user/.composer && \
    chown -R $user:$user /home/$user

# Configurar diretório de trabalho
WORKDIR /var/www

# Copiar arquivos existentes da aplicação (apenas backend)
COPY --chown=$user:$user backend/ /var/www
COPY --chown=$user:$user backend/docker/php/entrypoint.sh /usr/local/bin/app-entrypoint
RUN chmod +x /usr/local/bin/app-entrypoint

# Ajustar permissões (criar pastas se nao existirem para evitar erro no build)
RUN mkdir -p /var/www/storage /var/www/bootstrap/cache \
    && chown -R $user:$user /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# Mudar para o usuário criado
USER root

# Expor porta 9000 para PHP-FPM
EXPOSE 9000

ENTRYPOINT ["app-entrypoint"]
CMD ["php-fpm"]
