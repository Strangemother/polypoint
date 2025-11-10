#!/usr/bin/env python3
"""
Extract first ~100 lines of each JS file for analysis.
"""
import os
import re
from pathlib import Path

def extract_frontmatter_and_preview(filepath, preview_lines=100):
    """Extract frontmatter and first preview_lines of code."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Get first preview_lines
        preview = ''.join(lines[:preview_lines])
        return preview
    except Exception as e:
        return f"ERROR: {e}"

def main():
    theatre_dir = Path('/workspaces/polypoint/theatre')
    output_file = Path('/workspaces/polypoint/theatre_files_content.txt')
    
    # Get all .js files recursively
    js_files = sorted(theatre_dir.rglob('*.js'))
    js_files = [f for f in js_files if 'images' not in f.parts]
    
    print(f"Extracting content from {len(js_files)} files...")
    
    with open(output_file, 'w', encoding='utf-8') as out:
        for filepath in js_files:
            relative_path = filepath.relative_to(theatre_dir)
            
            out.write(f"\n{'='*80}\n")
            out.write(f"FILE: {relative_path}\n")
            out.write(f"{'='*80}\n\n")
            
            content = extract_frontmatter_and_preview(filepath)
            out.write(content)
            out.write(f"\n\n{'='*80}\n")
            out.write(f"END: {relative_path}\n")
            out.write(f"{'='*80}\n\n\n")
    
    print(f"Content extracted to: {output_file}")
    print(f"File size: {output_file.stat().st_size / 1024:.1f} KB")

if __name__ == '__main__':
    main()
