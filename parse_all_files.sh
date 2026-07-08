#!/bin/bash
# Parse and process all JavaScript files in point_src directory
# Usage: ./parse_all_files.sh

POINT_SRC_DIR="/workspaces/polypoint/point_src"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ ! -d "$POINT_SRC_DIR" ]; then
    echo -e "${RED}Error: point_src directory not found at ${POINT_SRC_DIR}${NC}"
    exit 1
fi

# Count total files
TOTAL_FILES=$(find "$POINT_SRC_DIR" -name "*.js" -type f | wc -l)
echo -e "${BLUE}Found ${TOTAL_FILES} JavaScript files in point_src${NC}"
echo ""

# Initialize counters
SUCCESS_COUNT=0
FAIL_COUNT=0
FAILED_FILES=()

# Process each JS file
for JS_FILE in "$POINT_SRC_DIR"/*.js; do
    if [ -f "$JS_FILE" ]; then
        FILENAME=$(basename "$JS_FILE")
        echo -e "${YELLOW}Processing ${FILENAME}...${NC}"
        
        # Run the parse_file.sh script
        /workspaces/polypoint/parse_file.sh "$FILENAME" 2>&1 | grep -E "(✓|Error:|Step [12]:)" | head -5
        
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            ((SUCCESS_COUNT++))
            echo -e "${GREEN}✓ ${FILENAME} completed${NC}"
        else
            ((FAIL_COUNT++))
            FAILED_FILES+=("$FILENAME")
            echo -e "${RED}✗ ${FILENAME} failed${NC}"
        fi
        echo ""
    fi
done

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Summary:${NC}"
echo -e "${GREEN}  Successful: ${SUCCESS_COUNT}/${TOTAL_FILES}${NC}"
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}  Failed: ${FAIL_COUNT}/${TOTAL_FILES}${NC}"
    echo -e "${RED}  Failed files:${NC}"
    for failed in "${FAILED_FILES[@]}"; do
        echo -e "${RED}    - ${failed}${NC}"
    done
fi
echo -e "${BLUE}========================================${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}All files processed successfully!${NC}"
    exit 0
else
    exit 1
fi
