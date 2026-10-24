#!/bin/bash
# Runs once, as root, on the first boot of the instance.
set -euo pipefail

apt-get update -y
apt-get install -y nginx

mkdir -p /var/www/eva2
chown -R ubuntu:ubuntu /var/www/eva2

# Placeholder until the first deploy uploads the real build.
cat > /var/www/eva2/index.html <<'HTML'
<!doctype html><html><body><h1>Server ready. Run infra/deploy.sh to publish the app.</h1></body></html>
HTML

cat > /etc/nginx/sites-available/eva2 <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/eva2;
    index index.html;
    server_tokens off;

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    # Vite puts a content hash in every asset name, so they can be cached forever.
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback: unknown paths (/admin, /checkout...) return index.html
    # and React Router decides what to render. Without this, reloading any
    # route other than / would give an nginx 404.
    location / {
        add_header Cache-Control "no-cache";
        try_files $uri $uri/ /index.html;
    }
}
NGINX

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/eva2 /etc/nginx/sites-enabled/eva2

nginx -t
systemctl enable nginx
systemctl restart nginx
