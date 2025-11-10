#!/bin/bash
set -e  # Exit on any error

echo "=== Starting Application Update ==="
echo ""

# Run git pull and application updates as the site user
echo "→ Pulling latest changes and updating application as site user..."
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

# Restart gunicorn service
echo "→ Restarting gunicorn service..."
sudo systemctl restart gunicorn-polypointjs-com.service

# Restart nginx
echo "→ Restarting nginx..."
sudo systemctl restart nginx

# Check service status
echo ""
echo "=== Service Status ==="
sudo systemctl status gunicorn-polypointjs-com.service --no-pager

echo ""
echo "✓ Update completed successfully!"
