#!/usr/bin/env python3
"""
Apply title mappings to theatre files.
"""
import re
from pathlib import Path

def read_mappings(mapping_file):
    """Read the title mappings from file."""
    mappings = {}
    with open(mapping_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                parts = line.split('|')
                if len(parts) == 2:
                    filename = parts[0].strip()
                    new_title = parts[1].strip()
                    mappings[filename] = new_title
    return mappings

def update_title_in_file(filepath, new_title):
    """Update the title in a file's frontmatter."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace title
    # Pattern matches title with optional indentation
    pattern = r'(^\s*title:\s*)(.+?)$'
    
    def replace_title(match):
        indent = match.group(1)
        return f"{indent}{new_title}"
    
    new_content, count = re.subn(pattern, replace_title, content, count=1, flags=re.MULTILINE)
    
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    import sys
    theatre_dir = Path('/workspaces/polypoint/theatre')
    
    if len(sys.argv) > 1:
        mapping_file = Path('/workspaces/polypoint') / sys.argv[1]
    else:
        mapping_file = Path('/workspaces/polypoint/title_mapping.txt')
    
    mappings = read_mappings(mapping_file)
    
    print(f"Loaded {len(mappings)} title mappings\n")
    
    updated_count = 0
    
    for filename, new_title in mappings.items():
        filepath = theatre_dir / filename
        
        if filepath.exists():
            if update_title_in_file(filepath, new_title):
                print(f"  ✓ Updated {filename}: '{new_title}'")
                updated_count += 1
            else:
                print(f"  ✗ Failed to update {filename}")
        else:
            print(f"  ! File not found: {filename}")
    
    print(f"\n{'='*60}")
    print(f"Updated {updated_count} file titles")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
