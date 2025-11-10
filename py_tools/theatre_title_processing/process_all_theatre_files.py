#!/usr/bin/env python3
"""
Script to process all JavaScript files in theatre directory including subdirectories.
"""
import os
import re
from pathlib import Path

def parse_frontmatter(content):
    """Extract frontmatter from the file content."""
    match = re.match(r'^/\*\s*(.*?)\*/', content, re.DOTALL)
    if match:
        return match.group(1), match.end()
    return None, 0

def has_title(frontmatter):
    """Check if frontmatter already has a title."""
    if not frontmatter:
        return False
    return bool(re.search(r'^title:\s*.+', frontmatter, re.MULTILINE))

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

def add_title_to_frontmatter(frontmatter, title):
    """Add title to frontmatter if it doesn't exist."""
    if not frontmatter:
        return f"title: {title}\n"
    
    lines = frontmatter.split('\n')
    result_lines = []
    title_added = False
    
    for i, line in enumerate(lines):
        if i == 0 and line.strip() == '---':
            result_lines.append(line)
            result_lines.append(f"title: {title}")
            title_added = True
        elif not title_added and (line.strip().startswith('categories') or 
                                   line.strip().startswith('files:') or
                                   line.strip().startswith('tags:') or
                                   line.strip() == '---'):
            result_lines.append(f"title: {title}")
            result_lines.append(line)
            title_added = True
        else:
            result_lines.append(line)
    
    if not title_added:
        result_lines.insert(0, f"title: {title}")
    
    return '\n'.join(result_lines)

def add_frontmatter_with_title(content, title):
    """Add new frontmatter with title to content that has none."""
    frontmatter = f"""/*
title: {title}
*/
"""
    return frontmatter + content

def process_file(filepath, relative_path):
    """Process a single file to add/update title."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    frontmatter, end_pos = parse_frontmatter(content)
    
    # Generate title from filename
    title = generate_title_from_filename(filepath.name)
    
    if frontmatter is None:
        # No frontmatter at all - add it
        new_content = add_frontmatter_with_title(content, title)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  + Added frontmatter to {relative_path}: '{title}'")
        return True
    
    if has_title(frontmatter):
        print(f"  ✓ {relative_path} already has a title")
        return False
    
    # Add title to existing frontmatter
    new_frontmatter = add_title_to_frontmatter(frontmatter, title)
    new_content = f"/*\n{new_frontmatter}*/" + content[end_pos:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  + Added title to {relative_path}: '{title}'")
    return True

def main():
    theatre_dir = Path('/workspaces/polypoint/theatre')
    
    # Get all .js files recursively
    js_files = sorted(theatre_dir.rglob('*.js'))
    
    # Exclude certain directories if needed
    js_files = [f for f in js_files if 'images' not in f.parts]
    
    print(f"Found {len(js_files)} JavaScript files in theatre directory (including subdirectories)\n")
    
    updated_count = 0
    
    for filepath in js_files:
        relative_path = filepath.relative_to(theatre_dir)
        if process_file(filepath, relative_path):
            updated_count += 1
    
    print(f"\n{'='*60}")
    print(f"Processed {len(js_files)} files")
    print(f"Updated {updated_count} files")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
