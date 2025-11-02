#!/bin/bash

# Script to install color-bits and create a single bundled JS file in point_src/third_party

set -e  # Exit on error

echo "Installing color-bits package..."
pnpm install color-bits

echo "Creating third_party directory..."
mkdir -p point_src/third_party

echo "Bundling color-bits into a single file..."
# Use esbuild to bundle the library into a single file with global variable
npx --yes esbuild node_modules/color-bits/build/index.js \
  --bundle \
  --format=iife \
  --global-name=colorBits \
  --outfile=point_src/third_party/color-bits.js \
  --platform=browser \
  --target=es2020

echo "Adding header comment to bundled file..."
# Extract metadata from package.json
PACKAGE_NAME=$(node -p "require('./node_modules/color-bits/package.json').name")
PACKAGE_VERSION=$(node -p "require('./node_modules/color-bits/package.json').version")
PACKAGE_DESCRIPTION=$(node -p "require('./node_modules/color-bits/package.json').description")
PACKAGE_HOMEPAGE=$(node -p "require('./node_modules/color-bits/package.json').homepage")
PACKAGE_LICENSE=$(node -p "require('./node_modules/color-bits/package.json').license")

# Create header comment
HEADER="/**
 * ${PACKAGE_NAME} v${PACKAGE_VERSION}
 * ${PACKAGE_DESCRIPTION}
 * 
 * @source ${PACKAGE_HOMEPAGE}
 * @license ${PACKAGE_LICENSE}
 * 
 * This is a bundled version of the library for use in this project.
 * See the original repository for full documentation and source code.
 * 
 * Usage:
 *   <script src=\"./point_src/third_party/color-bits.js\"></script>
 *   <script>
 *     // Access via global colorBits object
 *     const color = colorBits.rgb(255, 0, 0);
 *   </script>
 */
"

# Prepend header to the bundled file
echo "$HEADER" | cat - point_src/third_party/color-bits.js > point_src/third_party/color-bits.js.tmp
mv point_src/third_party/color-bits.js.tmp point_src/third_party/color-bits.js

echo "✓ color-bits bundled to point_src/third_party/color-bits.js"
ls -lh point_src/third_party/color-bits.js
