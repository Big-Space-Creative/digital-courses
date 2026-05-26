FROM nginx:alpine

# Copiar configuração customizada
COPY backend/docker/nginx/conf.d/app.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos públicos estáticos do Laravel
COPY backend/public /var/www/public
