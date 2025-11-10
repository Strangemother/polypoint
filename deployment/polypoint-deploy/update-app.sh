#!/bin/bash
set -e  # Exit on any error

echo "=== Starting Application Update ==="
echo ""

# Navigate to the application directory
echo "→ Changing to application directory..."
cd /home/site/apps/polypoint

# Pull latest changes
echo "→ Pulling latest changes from git..."
git pull --no-ff origin main

# Activate virtual environment
echo "→ Activating virtual environment..."
source /home/site/apps/polypoint/.venv/bin/activate

# Install/update dependencies
# echo "→ Installing dependencies..."
# pip install -r /home/site/apps/polypoint/site/beta/requirements.txt

# Collect static files
echo "→ Collecting static files..."
cd /home/site/apps/polypoint/site/beta
python3 manage.py collectstatic --noinput

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
