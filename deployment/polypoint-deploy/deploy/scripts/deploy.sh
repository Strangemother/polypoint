#!/bin/bash

# Set environment variables for the domains
export $(cat deploy/env/polypoint.io.env | xargs)
export $(cat deploy/env/polypointjs.com.env | xargs)

# Navigate to the Django project directory
cd site/beta

# Run database migrations
echo "Running database migrations..."
python3 manage.py migrate

# Collect static files
echo "Collecting static files..."
python3 manage.py collectstatic --noinput

# Restart Gunicorn services
echo "Restarting Gunicorn services..."
sudo systemctl restart gunicorn-polypoint-io
sudo systemctl restart gunicorn-polypointjs-com

# Restart Nginx to apply any configuration changes
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Deployment completed successfully!"