#!/usr/bin/env python3
"""
Script to add/update titles in the frontmatter of theatre JavaScript files.
"""
import os
import re
from pathlib import Path

def parse_frontmatter(content):
    """Extract frontmatter from the file content."""
    # Match /* at start, then capture everything until */
    match = re.match(r'^/\*\s*(.*?)\*/', content, re.DOTALL)
    if match:
        return match.group(1), match.end()
    return None, 0

def has_title(frontmatter):
    """Check if frontmatter already has a title."""
    if not frontmatter:
        return False
    # Look for title: line
    return bool(re.search(r'^title:\s*.+', frontmatter, re.MULTILINE))

def generate_title_from_filename(filename):
    """Generate a human-readable title from filename."""
    # Remove .js extension
    name = filename.replace('.js', '')
    
    # Handle special cases
    if name.startswith('x-'):
        return f"Experimental: {name[2:].replace('-', ' ').title()}"
    
    # Split by hyphens and capitalize
    words = name.split('-')
    
    # Handle numbers and special words
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
        # Create new frontmatter
        return f"title: {title}\n"
    
    # Check if there's already a '---' separator or other structure
    lines = frontmatter.split('\n')
    
    # Insert title at the beginning (after any initial --- if present)
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

def process_file(filepath):
    """Process a single file to add/update title."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    frontmatter, end_pos = parse_frontmatter(content)
    
    if frontmatter is None:
        print(f"  No frontmatter found in {filepath.name}")
        return False
    
    if has_title(frontmatter):
        print(f"  ✓ {filepath.name} already has a title")
        return False
    
    # Generate title from filename
    title = generate_title_from_filename(filepath.name)
    
    # Add title to frontmatter
    new_frontmatter = add_title_to_frontmatter(frontmatter, title)
    
    # Reconstruct the file
    new_content = f"/*\n{new_frontmatter}*/" + content[end_pos:]
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  + Added title to {filepath.name}: '{title}'")
    return True

def main():
    theatre_dir = Path('/workspaces/polypoint/theatre')
    
    # Get all .js files (excluding subdirectories for now)
    js_files = sorted(theatre_dir.glob('*.js'))
    
    print(f"Found {len(js_files)} JavaScript files in theatre directory\n")
    
    updated_count = 0
    
    for filepath in js_files:
        if process_file(filepath):
            updated_count += 1
    
    print(f"\n{'='*60}")
    print(f"Processed {len(js_files)} files")
    print(f"Updated {updated_count} files with new titles")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
