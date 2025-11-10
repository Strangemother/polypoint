# Theatre Title Processing Scripts

This directory contains Python scripts and data files used to analyze and update frontmatter titles for all 462 JavaScript files in the `/workspaces/polypoint/theatre` directory.

## Overview

The scripts analyze file content to generate meaningful, descriptive titles based on actual functionality rather than just filenames.

## Scripts

### Core Processing Scripts
- **`add_frontmatter.py`** - Adds frontmatter blocks to files that don't have any
- **`add_titles.py`** - Initial title generator based on filenames
- **`process_all_theatre_files.py`** - Batch processes all theatre files including subdirectories

### Analysis Scripts
- **`extract_file_contents.py`** - Consolidates first ~100 lines of all theatre files into single file for efficient analysis
- **`analyze_and_suggest_titles.py`** - First automated content analysis attempt
- **`comprehensive_analysis.py`** - Advanced content analysis with keyword detection for physics, rendering, interaction patterns

### Application Script
- **`apply_title_mappings.py`** - Applies title mappings from a mapping file to actual theatre files
  - Usage: `python3 apply_title_mappings.py <mapping_file>`
  - Preserves indentation and frontmatter formatting

## Data Files

### Generated Content
- **`theatre_files_content.txt`** (1171.6 KB) - Consolidated content from all 462 theatre files for single-read analysis

### Mapping Files
- **`title_mapping.txt`** - Initial manual mapping (38 entries)
- **`title_suggestions.txt`** - Initial automated suggestions
- **`comprehensive_title_mapping.txt`** - First comprehensive mapping (158 suggestions)
- **`curated_title_mapping.txt`** - Final curated mapping (222 entries) ✓ Applied successfully

## Results

All 462 theatre files now have meaningful, content-based titles including:
- Physics simulations (springs, collisions, gravity)
- Curve rendering (Bezier, arcs, splines)
- Particle effects and animations
- 3D projections and transformations
- Interactive demonstrations

## Example Transformations

- `throw-old.js` → "Point Collision with Mass and Rotation"
- `brain.js` → "Brain.js Neural Network Library"
- `squirqle.js` → "Squircle Shape (Square-Circle)"
- `spring-blob.js` → "Spring-Based Blob"
- `starfield-example.js` → "Starfield Parallax Effect"
