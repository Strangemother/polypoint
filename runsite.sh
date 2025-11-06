#!/bin/bash
set -e

cd site
source env/bin/activate
cd beta/
python manage.py runserver "$@"