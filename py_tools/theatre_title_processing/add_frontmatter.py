#!/usr/bin/env python3
"""
Script to add frontmatter to files that don't have any.
"""
import os
import re
from pathlib import Path

def has_frontmatter(content):
    """Check if file has frontmatter."""
    return content.strip().startswith('/*')

def generate_title_from_filename(filename):
    """Generate a human-readable title from filename."""
    name = filename.replace('.js', '')
    
    if name.startswith('x-'):
        return f"Experimental: {name[2:].replace('-', ' ').title()}"
    
    words = name.split('-')
    title_words = []
    for word in words:
        if word.isdigit():
            title_words.append(word)
        elif word in ['3d', '2d', 'com', 'fps', 'svg', 'qt', 'midi', 'vad', 'rk4']:
            title_words.append(word.upper())
        elif word == 'pseudo3d' or word.startswith('pseudo3d'):
            title_words.append('Pseudo-3D')
        else:
            title_words.append(word.capitalize())
    
    return ' '.join(title_words)

def add_frontmatter_to_file(filepath):
    """Add frontmatter to a file that doesn't have any."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if has_frontmatter(content):
        print(f"  ✓ {filepath.name} already has frontmatter")
        return False
    
    title = generate_title_from_filename(filepath.name)
    
    # Create basic frontmatter
    frontmatter = f"""/*
title: {title}
*/
"""
    
    new_content = frontmatter + content
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  + Added frontmatter to {filepath.name}: '{title}'")
    return True

def main():
    # List of files that need frontmatter
    files_to_fix = [
        'arc-pointlist-another-alt.js',
        'brain.js',
        'midi-tracks.js',
        'multisheet-component-v1.js',
        'multisheet-component-v2.js',
        'pixel-fix.js',
        'point-line.js',
        'pointer-lock.js',
        'protractor-point.editor.js',
        'qt-quadtree.js',
        'qt-rectangle.js',
        'qt-sketch.js',
        'screen-lock.js',
        'snapshot-upload.js',
        'vad-wave.js',
        'x-a.js',
    ]
    
    theatre_dir = Path('/workspaces/polypoint/theatre')
    
    print(f"Adding frontmatter to {len(files_to_fix)} files\n")
    
    updated_count = 0
    
    for filename in files_to_fix:
        filepath = theatre_dir / filename
        if filepath.exists():
            if add_frontmatter_to_file(filepath):
                updated_count += 1
        else:
            print(f"  ! File not found: {filename}")
    
    print(f"\n{'='*60}")
    print(f"Processed {len(files_to_fix)} files")
    print(f"Added frontmatter to {updated_count} files")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
