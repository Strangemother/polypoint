#!/bin/bash
set -e  # Exit on any error

echo "=== Starting Application Update ==="
echo ""

APP_ROOT="/home/site/apps/polypoint"
DEPLOY_ROOT="$APP_ROOT/deployment/polypoint-deploy"
NGINX_SRC_DIR="$DEPLOY_ROOT/deploy/nginx"
NGINX_SITES_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_LINK="/etc/nginx/sites-enabled/polypointjs.com.conf"
SITE_UPDATE_SCRIPT="$DEPLOY_ROOT/app/update-site-app.sh"

# Check if running as root, if so switch to site user for git operations
if [ "$(id -u)" -eq 0 ]; then
    echo "→ Running as root, switching to site user for git/app operations..."
    su - site << 'EOSU'
set -e
bash /home/site/apps/polypoint/deployment/polypoint-deploy/app/update-site-app.sh \
    /home/site/apps/polypoint
EOSU

    echo "→ Syncing nginx site configs from repository..."
    install -m 644 "$NGINX_SRC_DIR/polypointjs.com.conf" "$NGINX_SITES_DIR/polypointjs.com.conf"
    install -m 644 "$NGINX_SRC_DIR/polypointjs.com.improved.conf" "$NGINX_SITES_DIR/polypointjs.com.improved.conf"

    if [ -L "$NGINX_ENABLED_LINK" ]; then
        echo "→ Active nginx site config: $(readlink -f "$NGINX_ENABLED_LINK")"
    fi

    echo "→ Testing nginx config..."
    nginx -t

    # Back as root - restart services
    echo "→ Restarting gunicorn service..."
    systemctl restart gunicorn-polypointjs-com.service

    echo "→ Reloading nginx..."
    systemctl reload nginx

    echo ""
    echo "=== Service Status ==="
    systemctl status gunicorn-polypointjs-com.service --no-pager
else
    # Running as site user already
    echo "→ Running as site user, performing git pull and app updates..."
    bash "$SITE_UPDATE_SCRIPT" "$APP_ROOT"

    echo "→ Syncing nginx site configs from repository..."
    sudo install -m 644 "$NGINX_SRC_DIR/polypointjs.com.conf" "$NGINX_SITES_DIR/polypointjs.com.conf"
    sudo install -m 644 "$NGINX_SRC_DIR/polypointjs.com.improved.conf" "$NGINX_SITES_DIR/polypointjs.com.improved.conf"

    if [ -L "$NGINX_ENABLED_LINK" ]; then
        echo "→ Active nginx site config: $(readlink -f "$NGINX_ENABLED_LINK")"
    fi

    echo "→ Testing nginx config..."
    sudo nginx -t
    
    # Use sudo for service restarts when running as site user
    echo "→ Restarting gunicorn service..."
    sudo systemctl restart gunicorn-polypointjs-com.service

    echo "→ Reloading nginx..."
    sudo systemctl reload nginx

    echo ""
    echo "=== Service Status ==="
    sudo systemctl status gunicorn-polypointjs-com.service --no-pager
fi

echo ""
echo "✓ Update completed successfully!"
