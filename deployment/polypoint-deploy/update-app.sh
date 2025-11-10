#!/bin/bash
set -e  # Exit on any error

echo "=== Starting Application Update ==="
echo ""

# Check if running as root, if so switch to site user for git operations
if [ "$(id -u)" -eq 0 ]; then
    echo "→ Running as root, switching to site user for git/app operations..."
    su - site << 'EOSU'
set -e
cd /home/site/apps/polypoint
git pull --no-ff origin main

# Activate virtual environment
source /home/site/apps/polypoint/.venv/bin/activate

# Install/update dependencies (commented out)
# pip install -r /home/site/apps/polypoint/site/beta/requirements.txt

# Collect static files
cd /home/site/apps/polypoint/site/beta
python3 manage.py collectstatic --noinput

echo "✓ Application updated successfully"
EOSU

    # Back as root - restart services
    echo "→ Restarting gunicorn service..."
    systemctl restart gunicorn-polypointjs-com.service

    echo "→ Restarting nginx..."
    systemctl restart nginx

    echo ""
    echo "=== Service Status ==="
    systemctl status gunicorn-polypointjs-com.service --no-pager
else
    # Running as site user already
    echo "→ Running as site user, performing git pull and app updates..."
    cd /home/site/apps/polypoint
    git pull --no-ff origin main

    # Activate virtual environment
    source /home/site/apps/polypoint/.venv/bin/activate

    # Install/update dependencies (commented out)
    # pip install -r /home/site/apps/polypoint/site/beta/requirements.txt

    # Collect static files
    cd /home/site/apps/polypoint/site/beta
    python3 manage.py collectstatic --noinput

    echo "✓ Application updated successfully"
    
    # Use sudo for service restarts when running as site user
    echo "→ Restarting gunicorn service..."
    sudo systemctl restart gunicorn-polypointjs-com.service

    echo "→ Restarting nginx..."
    sudo systemctl restart nginx

    echo ""
    echo "=== Service Status ==="
    sudo systemctl status gunicorn-polypointjs-com.service --no-pager
fi

echo ""
echo "✓ Update completed successfully!"
