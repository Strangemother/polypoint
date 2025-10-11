#!/bin/bash

# Navigate to the Django project directory
cd /home/site/apps/polypoint/site/beta

# Activate the virtual environment
source /home/site/apps/polypoint/.venv/bin/activate

# Start the Gunicorn server using the config file
exec gunicorn -c "$1" polypoint_beta.wsgi:application