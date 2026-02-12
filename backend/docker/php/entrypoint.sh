#!/bin/sh
set -e

APP_DIR=${APP_DIR:-/var/www}
APP_USER=${APP_USER:-laravel}
WEB_USER=${WEB_USER:-www-data}

cd "$APP_DIR"

mkdir -p storage/logs bootstrap/cache vendor
chown -R "$WEB_USER":"$WEB_USER" storage bootstrap/cache 2>/dev/null || true
chown -R "$APP_USER":"$APP_USER" vendor 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

if [ ! -f .env ] && [ -f .env.example ]; then
  echo "[entrypoint] .env not found. Using .env.example as base."
  cp .env.example .env
fi

if [ ! -f vendor/autoload.php ]; then
  echo "[entrypoint] Installing PHP dependencies via Composer..."
  gosu "$APP_USER" composer install --no-interaction --prefer-dist --no-progress
fi

if [ -x artisan ]; then
  gosu "$WEB_USER" php artisan storage:link >/dev/null 2>&1 || true
fi

exec "$@"
