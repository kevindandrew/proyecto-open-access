#!/bin/sh
set -e

php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

if [ "$RUN_MIGRATIONS" = "true" ]; then
    php artisan migrate --force
fi

if [ "$RUN_SEEDERS" = "true" ]; then
    php artisan db:seed --force
fi

exec php artisan serve --host 0.0.0.0 --port "${PORT:-10000}"
