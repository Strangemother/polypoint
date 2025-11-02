#!/bin/bash
# Convenience wrapper for parse-file.js

cd "$(dirname "$0")"
node parse-file.js "$@"
