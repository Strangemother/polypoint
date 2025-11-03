#!/bin/sh
set -e

cd site
source env/bin/activate
cd beta/
./run.sh "$@"