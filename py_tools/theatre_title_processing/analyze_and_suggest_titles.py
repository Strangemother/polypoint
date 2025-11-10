#!/usr/bin/env python3
"""
Analyze the consolidated file content and suggest better titles.
"""
import re
from pathlib import Path

def extract_file_info(content_block):
    """Extract key information from a file's content block."""
    lines = content_block.split('\n')
    
    # Get filename
    filename = None
    for line in lines[:5]:
        if line.startswith('FILE:'):
            filename = line.split('FILE:')[1].strip()
            break
    
    # Get current title
    current_title = None
    for line in lines[:50]:
        title_match = re.search(r'^\s*title:\s*(.+?)$', line, re.IGNORECASE)
        if title_match:
            current_title = title_match.group(1).strip()
            break
    
    # Get categories
    categories = []
    in_categories = False
    for line in lines[:50]:
        if re.match(r'^\s*categories?:', line, re.IGNORECASE):
            in_categories = True
            continue
        if in_categories:
            if line.strip() and not line.strip().startswith('files') and not line.strip().startswith('---'):
                categories.append(line.strip())
            else:
                break
    
    # Analyze content for keywords
    content_preview = '\n'.join(lines[:100]).lower()
    
    keywords = {
        'collision': 'collision' in content_preview or 'collide' in content_preview,
        'gravity': 'gravity' in content_preview,
        'spring': 'spring' in content_preview or 'elasticity' in content_preview,
        'rope': 'rope' in content_preview or 'chain' in content_preview,
        'drag': 'dragging' in content_preview or 'drag' in content_preview,
        'bezier': 'bezier' in content_preview,
        'curve': 'curve' in content_preview,
        'arc': 'arc' in content_preview and 'ctx.arc' in content_preview,
        'catenary': 'catenary' in content_preview,
        'grid': 'grid' in content_preview,
        'particle': 'particle' in content_preview,
        'emitter': 'emit' in content_preview or 'emitter' in content_preview,
        'rotation': 'rotation' in content_preview or 'rotate' in content_preview,
        'angle': 'angle' in content_preview,
        'mirror': 'mirror' in content_preview,
        'reflect': 'reflect' in content_preview,
        'tangent': 'tangent' in content_preview,
        'pendulum': 'pendulum' in content_preview,
        'orbit': 'orbit' in content_preview,
        'follow': 'follow' in content_preview,
        'track': 'track' in content_preview,
        '3d': 'pseudo3d' in content_preview or '3d' in content_preview,
        'gradient': 'gradient' in content_preview,
        'text': 'text' in content_preview or 'label' in content_preview,
        'lerp': 'lerp' in content_preview,
        'easing': 'easing' in content_preview,
        'quadtree': 'quadtree' in content_preview,
        'midi': 'midi' in content_preview,
        'neural': 'neural' in content_preview or 'brain' in content_preview,
        'brownian': 'brownian' in content_preview,
        'svg': 'svg' in content_preview,
    }
    
    # Extract description if present
    description = None
    for i, line in enumerate(lines[:60]):
        if '---' in line and i > 5:
            # Look for description after ---
            for desc_line in lines[i+1:i+10]:
                if desc_line.strip() and not desc_line.startswith('/*') and not desc_line.startswith('*/'):
                    description = desc_line.strip()
                    break
            break
    
    return {
        'filename': filename,
        'current_title': current_title,
        'categories': categories,
        'keywords': keywords,
        'description': description,
        'content_preview': content_preview[:500]
    }

def suggest_title(info):
    """Suggest a better title based on analyzed information."""
    filename = info['filename']
    current = info['current_title']
    keywords = info['keywords']
    categories = info['categories']
    desc = info['description']
    
    # If title is obviously good, keep it
    good_titles = [
        'ball bearing', 'catenary', 'pendulum', 'brownian', 
        'collision', 'gravity', 'quadtree', 'neural net',
        'gradient', 'bezier', 'tangent', 'arc', 'mirror'
    ]
    
    if current and any(good in current.lower() for good in good_titles):
        if len(current) > 8 and not current.lower().startswith('example'):
            return None  # Keep current title
    
    # Bad title patterns
    bad_patterns = ['example', 'lorp', 'throw', 'brain', 'x-', 'test', 'demo']
    
    if not current or any(bad in current.lower() for bad in bad_patterns):
        # Generate new title based on content
        title_parts = []
        
        # Use description if available
        if desc and len(desc) > 10 and len(desc) < 60:
            return desc
        
        # Build from keywords
        if keywords.get('collision'):
            title_parts.append('Collision')
        if keywords.get('gravity'):
            title_parts.append('with Gravity')
        if keywords.get('spring'):
            title_parts.append('Spring')
        if keywords.get('rope'):
            title_parts.append('Rope' if not 'chain' in filename else 'Chain')
        if keywords.get('bezier'):
            title_parts.append('Bezier Curve')
        if keywords.get('catenary'):
            title_parts.append('Catenary')
        if keywords.get('arc'):
            title_parts.append('Arc')
        if keywords.get('pendulum'):
            title_parts.append('Pendulum')
        if keywords.get('mirror'):
            title_parts.append('Mirror')
        if keywords.get('tangent'):
            title_parts.append('Tangent')
        if keywords.get('emitter'):
            title_parts.append('Particle Emitter')
        if keywords.get('lerp'):
            title_parts.append('Interpolation')
        if keywords.get('gradient'):
            title_parts.append('Gradient')
        if keywords.get('brownian'):
            title_parts.append('Brownian Motion')
        if keywords.get('neural'):
            return 'Brain.js Neural Network Library'
        
        if title_parts:
            return ' '.join(title_parts[:3])  # Limit to 3 parts
    
    return None

def main():
    content_file = Path('/workspaces/polypoint/theatre_files_content.txt')
    output_file = Path('/workspaces/polypoint/title_suggestions.txt')
    
    with open(content_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by file markers
    file_blocks = re.split(r'={80}\nFILE:', content)
    
    suggestions = []
    
    for block in file_blocks[1:]:  # Skip first empty block
        block = 'FILE:' + block
        info = extract_file_info(block)
        
        if info['filename']:
            suggested = suggest_title(info)
            if suggested:
                suggestions.append({
                    'file': info['filename'],
                    'current': info['current_title'],
                    'suggested': suggested
                })
    
    # Write suggestions
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write("# Title Suggestions\n")
        out.write("# Format: filename | current_title | suggested_title\n\n")
        
        for s in suggestions:
            out.write(f"{s['file']} | {s['current']} | {s['suggested']}\n")
    
    print(f"Generated {len(suggestions)} title suggestions")
    print(f"Output written to: {output_file}")

if __name__ == '__main__':
    main()
