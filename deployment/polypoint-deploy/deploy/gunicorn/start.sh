#!/bin/bash

# Navigate to the Django project directory
cd /path/to/polypoint/site/beta

# Activate the virtual environment
source /path/to/your/venv/bin/activate

# Start the Gunicorn server for the polypoint.io domain
exec gunicorn polypoint_beta.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 30 \
    --log-level info \
    --access-logfile - \
    --error-logfile -