#!/bin/bash

# Update package list and install necessary packages
sudo apt update
sudo apt install -y python3-pip python3-venv nginx

# Navigate to the project directory
cd /path/to/polypoint-deploy/site/beta/

# Create a virtual environment
python3 -m venv .venv

# Activate the virtual environment
source .venv/bin/activate

# Install required Python packages
pip install -r /path/to/polypoint-deploy/requirements.txt

# Collect static files
bash /path/to/polypoint-deploy/deploy/scripts/collectstatic.sh

# Run database migrations
bash /path/to/polypoint-deploy/deploy/scripts/migrate.sh

# Start Gunicorn services
sudo systemctl start gunicorn-polypoint-io
sudo systemctl start gunicorn-polypointjs-com

# Enable services to start on boot
sudo systemctl enable gunicorn-polypoint-io
sudo systemctl enable gunicorn-polypointjs-com

# Start Nginx
sudo systemctl start nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

echo "Server setup and deployment completed successfully."