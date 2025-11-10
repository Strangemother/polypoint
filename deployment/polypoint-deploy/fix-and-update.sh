#!/bin/bash
set -e  # Exit on any error

echo "=== One-time Fix and Update ==="
echo ""

# First, pull the latest changes as the site user
echo "→ Pulling latest changes as site user..."
su - site << 'EOSU'
cd /home/site/apps/polypoint
git pull --no-ff origin main
echo "✓ Latest code pulled"
EOSU

# Now run the updated deployment script
echo ""
echo "→ Running updated deployment script..."
cd /home/site/apps/polypoint/deployment/polypoint-deploy
./update-app.sh

echo ""
echo "✓ Fix and update completed!"
