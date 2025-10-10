#!/bin/bash

# Navigate to the Django project directory
cd /workspaces/polypoint/site/beta

# Activate the virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Run database migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Exit the script
exit 0