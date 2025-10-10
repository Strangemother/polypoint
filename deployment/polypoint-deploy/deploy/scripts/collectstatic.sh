#!/bin/bash

# Navigate to the Django project directory
cd /workspaces/polypoint/site/beta

# Collect static files
echo "Collecting static files..."
python3 manage.py collectstatic --noinput

echo "Static files collected successfully."