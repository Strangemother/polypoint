#!/bin/bash

# Activate the virtual environment
source /home/site/apps/polypoint/.venv/bin/activate

# Change to the Django project directory
cd /home/site/apps/polypoint/site/beta || exit 1

# Get the absolute path to the config file
CONFIG_PATH="/home/site/apps/polypoint/deploy/gunicorn/$1"

# Start the Gunicorn server using the config file
exec gunicorn -c "$CONFIG_PATH" primary.wsgi:application