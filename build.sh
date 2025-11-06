#!/bin/bash

# Polypoint Build Script
# Simple wrapper around the Node.js build script

set -e

echo "🚀 Building Polypoint distribution files..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Run the build
node build-minify.js

echo ""
echo "✅ Build complete! Distribution files are in ./dist/"
echo ""
echo "Usage examples:"
echo "  <script src=\"dist/point.bundle.min.js\"></script>"
echo "  <script src=\"dist/stage.bundle.min.js\"></script>"
echo ""
