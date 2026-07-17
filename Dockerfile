FROM php:8.3-cli-alpine

RUN apk add --no-cache \
        nodejs npm \
        postgresql-dev \
        oniguruma-dev \
        libzip-dev \
        zip unzip git \
    && docker-php-ext-install pdo pdo_pgsql bcmath mbstring

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN composer dump-autoload --optimize \
    && npm run build \
    && npm cache clean --force \
    && rm -rf node_modules

RUN chmod +x docker/entrypoint.sh

EXPOSE 10000
ENTRYPOINT ["docker/entrypoint.sh"]
