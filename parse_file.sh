#!/bin/bash
# Parse and process a JavaScript file
# Usage: ./parse_file.sh <filename.js>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <filename.js>"
    echo "Example: $0 point.js"
    exit 1
fi

FILENAME="$1"
BASENAME="${FILENAME%.js}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Parsing ${FILENAME} with Node.js parser...${NC}"
cd /workspaces/polypoint/js_parser
node parse-file.js "$FILENAME"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to parse ${FILENAME}${NC}"
    exit 1
fi

TREE_FILE="/workspaces/polypoint/docs/trees/${BASENAME}-js-tree.json"

if [ ! -f "$TREE_FILE" ]; then
    echo -e "${RED}Error: Tree file not found at ${TREE_FILE}${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Tree file created${NC}"
echo ""
echo -e "${BLUE}Step 2: Processing tree with Python processor...${NC}"
cd /workspaces/polypoint/py_tools
python run-tree2.py "$TREE_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to process tree file${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Successfully parsed and processed ${FILENAME}${NC}"
echo -e "${BLUE}Output files:${NC}"
echo "  - Tree: $TREE_FILE"
echo "  - Program: /workspaces/polypoint/docs/trees/clean/stash/${BASENAME}-js/program.json"
echo "  - References: /workspaces/polypoint/docs/trees/clean/stash/${BASENAME}-js/references.json"
echo ""
echo -e "${BLUE}View in browser: http://localhost:8000/files/file/${BASENAME}/${NC}"
