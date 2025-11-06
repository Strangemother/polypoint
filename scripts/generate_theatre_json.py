#!/usr/bin/env python3
"""
Generate a JSON file containing metadata about all theatre files.

This script:
1. Collects all 'theatre' files from the theatre/ directory
2. Extracts metadata including:
   - Filename
   - Created and modified timestamps
   - Title from frontmatter in the first comment block
3. Outputs the results to a JSON file

Usage:
    python scripts/generate_theatre_json.py [output_file.json]
"""

import json
import re
import textwrap
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional

import markdown


def extract_frontmatter_from_file(filepath: Path) -> Optional[Dict]:
    """
    Extract frontmatter metadata from the first comment block of a theatre file.
    
    The frontmatter is expected to be in the first /* ... */ comment block
    and formatted as markdown with YAML-style metadata.
    
    Args:
        filepath: Path to the theatre file
        
    Returns:
        Dictionary containing extracted metadata and content description, or None if no metadata found
    """
    try:
        content = filepath.read_text(encoding='utf-8')
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None
    
    # Extract the first comment block
    match = re.search(r"/\*(.*?)\*/", content, re.DOTALL)
    if not match:
        return None
    
    # Check if it's the first thing in the file (ignoring whitespace)
    start = match.start()
    prefix = content[0:start].strip()
    if len(prefix) > 0:
        # The comment is not at the beginning
        return None
    
    # Extract and clean the comment text
    text_data = match.group(1)
    text_data = textwrap.dedent(text_data).strip()
    
    if len(text_data) == 0:
        return None
    
    # Parse with markdown meta extension
    md = markdown.Markdown(extensions=['meta'])
    html = md.convert(text_data)
    
    # Extract metadata
    if not hasattr(md, 'Meta') or not md.Meta:
        return None
    
    # Clean the metadata - meta extension returns lists
    cleaned_meta = {}
    for key, value in md.Meta.items():
        if isinstance(value, list):
            # For single-value fields like 'title', take the first item
            if len(value) == 1:
                cleaned_meta[key] = value[0]
            elif len(value) > 1:
                cleaned_meta[key] = value
            else:
                cleaned_meta[key] = None
        else:
            cleaned_meta[key] = value
    
    # Store the markdown content for description extraction
    cleaned_meta['_markdown_content'] = text_data
    
    return cleaned_meta


def extract_description(frontmatter: Optional[Dict], max_length: int = 150) -> Optional[str]:
    """
    Extract a description from frontmatter metadata or content.
    
    Args:
        frontmatter: Dictionary containing frontmatter metadata
        max_length: Maximum length of description to extract from content
        
    Returns:
        Description string or None
    """
    if not frontmatter:
        return None
    
    # First check if 'description' exists in metadata
    if 'description' in frontmatter and frontmatter['description']:
        return frontmatter['description']
    
    # Otherwise, extract from markdown content
    if '_markdown_content' not in frontmatter:
        return None
    
    content = frontmatter['_markdown_content']
    
    # Split by common YAML separators (---) to find the content after metadata
    parts = re.split(r'^---\s*$', content, flags=re.MULTILINE)
    
    # Get the last part (content after metadata)
    if len(parts) > 1:
        text_content = parts[-1].strip()
    else:
        # Try to extract text after metadata keys
        # Remove lines that look like YAML key:value pairs
        lines = content.split('\n')
        text_lines = []
        in_text = False
        found_empty_after_yaml = False
        
        for line in lines:
            stripped = line.strip()
            
            # Check if line looks like YAML metadata (key: value or list item)
            is_yaml = (re.match(r'^[\w\-]+:\s*', stripped) or 
                      re.match(r'^-\s+', stripped) or
                      stripped.startswith('---'))
            
            if is_yaml:
                # Reset text collection if we find YAML
                if len(text_lines) == 0:
                    continue
                else:
                    # We already started collecting text, so stop
                    break
            # Empty lines might separate metadata from content
            elif stripped == '':
                if not in_text:
                    found_empty_after_yaml = True
                continue
            # This is actual text content
            elif found_empty_after_yaml or in_text:
                in_text = True
                text_lines.append(stripped)
        
        text_content = ' '.join(text_lines).strip()
    
    # Clean up and validate the text content
    if text_content:
        # Check if the content looks like it's still YAML (shouldn't happen but just in case)
        # If it starts with common YAML patterns, it's probably not a description
        if re.match(r'^[\w\-]+:\s*', text_content):
            return None
        
        # Remove extra whitespace
        text_content = re.sub(r'\s+', ' ', text_content)
        
        # If the content is too short or looks like metadata, ignore it
        if len(text_content) < 10:
            return None
        
        # Truncate to max_length
        if len(text_content) > max_length:
            # Try to cut at a word boundary
            truncated = text_content[:max_length]
            last_space = truncated.rfind(' ')
            if last_space > max_length * 0.8:  # Only if we're not cutting too much
                truncated = truncated[:last_space]
            text_content = truncated.strip() + '...'
        
        return text_content if text_content else None
    
    return None


def get_file_timestamps(filepath: Path) -> Dict[str, float]:
    """
    Get the created and modified timestamps for a file.
    
    Args:
        filepath: Path to the file
        
    Returns:
        Dictionary with 'created' and 'modified' timestamps
    """
    stat = filepath.stat()
    return {
        'created': stat.st_ctime,
        'modified': stat.st_mtime,
        'created_iso': datetime.fromtimestamp(stat.st_ctime).isoformat(),
        'modified_iso': datetime.fromtimestamp(stat.st_mtime).isoformat(),
    }


def generate_title_from_filename(filename: str) -> str:
    """
    Generate a human-readable title from a filename.
    
    Args:
        filename: The filename (e.g., 'arc-angles.js')
        
    Returns:
        A formatted title (e.g., 'Arc Angles')
    """
    # Remove extension
    name = Path(filename).stem
    
    # Replace hyphens and underscores with spaces
    name = name.replace('-', ' ').replace('_', ' ')
    
    # Capitalize each word
    title = ' '.join(word.capitalize() for word in name.split())
    
    return title


def collect_theatre_files(theatre_dir: Path) -> List[Dict]:
    """
    Collect metadata for all theatre files in the directory.
    
    Args:
        theatre_dir: Path to the theatre directory
        
    Returns:
        List of dictionaries containing file metadata
    """
    if not theatre_dir.exists():
        raise FileNotFoundError(f"Theatre directory not found: {theatre_dir}")
    
    files_data = []
    
    for filepath in sorted(theatre_dir.iterdir()):
        if not filepath.is_file():
            continue
        
        # Skip non-JS files
        if filepath.suffix != '.js':
            continue
        
        # Get timestamps
        timestamps = get_file_timestamps(filepath)
        
        # Extract frontmatter metadata
        frontmatter = extract_frontmatter_from_file(filepath)
        
        # Get title from frontmatter, or generate from filename
        title = None
        title_auto_generated = False
        
        if frontmatter and 'title' in frontmatter and frontmatter['title']:
            title = frontmatter['title']
        else:
            # Generate title from filename
            title = generate_title_from_filename(filepath.name)
            title_auto_generated = True
        
        # Get description from frontmatter or content
        description = extract_description(frontmatter)
        
        # Build file entry
        file_entry = {
            'name': filepath.name,
            'created': timestamps['created'],
            'modified': timestamps['modified'],
            'created_iso': timestamps['created_iso'],
            'modified_iso': timestamps['modified_iso'],
            'title': title,
            'title_auto_generated': title_auto_generated,
            'description': description,
        }
        
        # Optionally include other frontmatter data (excluding internal fields)
        if frontmatter:
            # Remove internal fields before adding to metadata
            clean_frontmatter = {k: v for k, v in frontmatter.items() 
                               if not k.startswith('_')}
            file_entry['metadata'] = clean_frontmatter
        
        files_data.append(file_entry)
    
    return files_data


def generate_theatre_json(
    theatre_dir: Path,
    output_file: Path,
    pretty: bool = True,
    minimal: bool = False
) -> None:
    """
    Generate a JSON file with metadata about all theatre files.
    
    Args:
        theatre_dir: Path to the theatre directory
        output_file: Path where the JSON file will be saved
        pretty: If True, format JSON with indentation
        minimal: If True, generate minimal version with only essential fields
    """
    print(f"Collecting theatre files from: {theatre_dir}")
    
    files_data = collect_theatre_files(theatre_dir)
    
    # Apply minimal filtering if requested
    if minimal:
        files_data = [
            {
                'name': f['name'],
                'title': f['title'],
                'title_auto_generated': f['title_auto_generated'],
                'created': f['created'],
                'modified': f['modified'],
                'created_iso': f['created_iso'],
                'modified_iso': f['modified_iso'],
                'description': f['description'],
            }
            for f in files_data
        ]
    
    # Create output structure
    output_data = {
        'generated_at': datetime.now().isoformat(),
        'theatre_dir': str(theatre_dir),
        'file_count': len(files_data),
        'files': files_data,
    }
    
    # Write to JSON file
    indent = 2 if pretty else None
    json_content = json.dumps(output_data, indent=indent, ensure_ascii=False)
    
    output_file.write_text(json_content, encoding='utf-8')
    
    mode = "minimal" if minimal else "full"
    format_mode = "pretty" if pretty else "compact"
    print(f"Generated JSON file ({mode}, {format_mode}): {output_file}")
    print(f"Total files processed: {len(files_data)}")
    print(f"Files with original titles: {sum(1 for f in files_data if f.get('title') and not f.get('title_auto_generated', False))}")
    print(f"Files with auto-generated titles: {sum(1 for f in files_data if f.get('title_auto_generated', False))}")
    print(f"Files with descriptions: {sum(1 for f in files_data if f.get('description'))}")


def main():
    """Main entry point for the script."""
    import sys
    import argparse
    
    # Get the project root (parent of scripts directory)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Set up argument parser
    parser = argparse.ArgumentParser(
        description='Generate a JSON file containing metadata about all theatre files.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate full version with pretty formatting (default)
  python scripts/generate_theatre_json.py
  
  # Generate minimal version for UI
  python scripts/generate_theatre_json.py --minimal
  
  # Generate compact (no whitespace) for production
  python scripts/generate_theatre_json.py --minimal --compact
  
  # Specify custom output file
  python scripts/generate_theatre_json.py -o site/static/theatre.json --minimal --compact
        """
    )
    
    parser.add_argument(
        'output',
        nargs='?',
        type=Path,
        default=project_root / 'theatre-files.json',
        help='Output JSON file path (default: theatre-files.json)'
    )
    
    parser.add_argument(
        '-o', '--output-file',
        type=Path,
        dest='output_alt',
        help='Alternative way to specify output file path'
    )
    
    parser.add_argument(
        '-m', '--minimal',
        action='store_true',
        help='Generate minimal version with only essential fields (name, title, dates, description)'
    )
    
    parser.add_argument(
        '-c', '--compact',
        action='store_true',
        help='Generate compact JSON without whitespace/indentation'
    )
    
    parser.add_argument(
        '--theatre-dir',
        type=Path,
        default=project_root / 'theatre',
        help='Path to theatre directory (default: ./theatre)'
    )
    
    args = parser.parse_args()
    
    # Determine output file (prioritize --output-file flag)
    output_file = args.output_alt if args.output_alt else args.output
    
    # Pretty formatting is opposite of compact
    pretty = not args.compact
    
    # Generate the JSON file
    try:
        generate_theatre_json(
            args.theatre_dir,
            output_file,
            pretty=pretty,
            minimal=args.minimal
        )
        print("\nSuccess!")
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
