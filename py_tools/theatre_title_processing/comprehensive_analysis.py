#!/usr/bin/env python3
"""
Comprehensive title analysis - identify all files with poor titles and suggest improvements.
"""
import re
from pathlib import Path

def extract_file_content(content_file):
    """Extract all file blocks from the consolidated content."""
    with open(content_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    file_blocks = []
    current_file = None
    current_content = []
    
    for line in content.split('\n'):
        if line.startswith('FILE:'):
            if current_file:
                file_blocks.append({
                    'filename': current_file,
                    'content': '\n'.join(current_content[:150])  # First 150 lines
                })
            current_file = line.split('FILE:')[1].strip()
            current_content = []
        elif line.startswith('END:'):
            continue
        else:
            current_content.append(line)
    
    return file_blocks

def get_current_title(content):
    """Extract current title from content."""
    for line in content.split('\n')[:50]:
        match = re.search(r'^\s*title:\s*(.+?)$', line, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None

def get_description(content):
    """Extract description from frontmatter."""
    lines = content.split('\n')
    in_desc = False
    description_lines = []
    
    for i, line in enumerate(lines[:80]):
        if '---' in line and i > 5:
            in_desc = True
            continue
        if in_desc:
            if line.strip() and not line.startswith('*/') and not line.startswith('/*'):
                if len(line.strip()) > 10:
                    description_lines.append(line.strip())
            if line.strip() == '*/':
                break
    
    if description_lines:
        desc = ' '.join(description_lines[:2])
        if len(desc) > 80:
            desc = desc[:77] + '...'
        return desc
    return None

def analyze_content_for_title(filename, content):
    """Analyze content and suggest a descriptive title."""
    lower_content = content.lower()
    
    # Keywords and patterns
    patterns = {
        # Physics & Motion
        'gravity': r'gravity',
        'collision': r'collision|collide|bounce',
        'spring': r'spring|elastic',
        'constraint': r'constraint|leash|distance constraint',
        'rope': r'rope|chain|string',
        'pendulum': r'pendulum',
        'physics': r'velocity|acceleration|force',
        
        # Curves & Lines
        'bezier': r'bezier|bezier curve',
        'catenary': r'catenary',
        'curve': r'curve|spline',
        'arc': r'ctx\.arc|arc\(',
        'tangent': r'tangent',
        'bisect': r'bisect',
        
        # Geometry
        'circle': r'circle|circular',
        'ellipse': r'ellipse',
        'polygon': r'polygon|ngon',
        'rectangle': r'rect|rectangle',
        'grid': r'grid',
        
        # Rendering
        'gradient': r'gradient|grad',
        'blur': r'blur|filter',
        'text': r'text|label|string',
        'color': r'color|hue|rgb|hsl',
        'stroke': r'stroke|line',
        'fill': r'fill|fillstyle',
        
        # Interaction
        'drag': r'dragging|drag',
        'click': r'click|onclick|mousedown',
        'hover': r'hover',
        'touch': r'touch',
        'keyboard': r'keyboard|keydown',
        
        # Animation
        'lerp': r'lerp|interpolat',
        'easing': r'easing|ease',
        'rotation': r'rotation|rotate|spin',
        'animation': r'animate|animation',
        
        # Particles
        'emitter': r'emitter|emit|particle',
        'brownian': r'brownian',
        
        # 3D
        'pseudo3d': r'pseudo3d|3d',
        
        # Special
        'mirror': r'mirror|reflect',
        'follow': r'follow|track',
        'orbit': r'orbit',
        'lookat': r'lookat',
        'spiral': r'spiral',
        'quadtree': r'quadtree',
        'midi': r'midi',
        'svg': r'svg',
        'neural': r'neural|brain\.js',
    }
    
    found = {}
    for key, pattern in patterns.items():
        if re.search(pattern, lower_content):
            found[key] = True
    
    # Build title based on filename and content
    name_parts = filename.replace('.js', '').split('-')
    
    # Check for specific patterns in code
    title_hints = []
    
    # Check comments for descriptions
    comment_match = re.search(r'/\*\*?\s*\n\s*\*?\s*(.+?)\n', content)
    if comment_match:
        hint = comment_match.group(1).strip('* ')
        if len(hint) > 10 and len(hint) < 60:
            title_hints.append(hint)
    
    # Look for class names
    class_match = re.search(r'class\s+(\w+)', content)
    if class_match and class_match.group(1) != 'MainStage':
        title_hints.append(class_match.group(1))
    
    return found, title_hints

def should_improve_title(filename, current_title):
    """Determine if a title needs improvement."""
    if not current_title:
        return True
    
    title_lower = current_title.lower()
    
    # Bad patterns
    bad_patterns = [
        'example',
        'test',
        'demo',
        r'^\w+ \d+$',  # "Something 2"
        r'^\w+ Example \d+$',
        'another',
        'alt',
        'raw',
        'main',
    ]
    
    # Very generic single-word titles
    if len(current_title.split()) == 1 and len(current_title) < 10:
        return True
    
    for pattern in bad_patterns:
        if re.search(pattern, title_lower):
            return True
    
    return False

def suggest_better_title(filename, content, current_title):
    """Generate a better title suggestion."""
    
    # First check for description
    desc = get_description(content)
    if desc and len(desc) > 15 and len(desc) < 70:
        # Clean up description
        desc = re.sub(r'^\s*\*+\s*', '', desc)
        desc = re.sub(r'\s+', ' ', desc)
        return desc.strip()
    
    found, hints = analyze_content_for_title(filename, content)
    
    # Build title from analysis
    title_parts = []
    name = filename.replace('.js', '').replace('-', ' ').title()
    
    # Special cases based on filename patterns
    if 'clock' in filename:
        if 'face' in filename:
            return 'Clock Face Display'
        if 'stopwatch' in filename:
            return 'Stopwatch Timer'
    
    if 'rainbow' in filename:
        if 'arc' in filename:
            return 'Rainbow Colored Arc Path'
    
    if 'cluster' in filename:
        return 'Point Clustering Animation'
    
    if 'emit' in filename or 'emitter' in filename:
        if found.get('curve'):
            title_parts.append('Curve')
        title_parts.append('Particle Emitter')
        return ' '.join(title_parts) if title_parts else 'Particle Emitter System'
    
    if 'com' in filename:
        return 'Center of Mass Calculation'
    
    if 'spread' in filename:
        return 'Point Spread Distribution'
    
    if 'split' in filename:
        if 'bar' in filename:
            return 'Split Bar Interface'
        if 'zip' in filename:
            return 'Zipper Split Effect'
        if 'circle' in filename:
            return 'Circle Split Warp Effect'
        return 'Point Split Operation'
    
    # Use content analysis
    if found.get('collision'):
        if found.get('gravity'):
            return 'Collision Physics with Gravity'
        if found.get('spring'):
            return 'Spring Collision Response'
        return 'Point Collision Detection'
    
    if found.get('catenary'):
        return 'Catenary Curve Chain'
    
    if found.get('bezier'):
        if found.get('drag'):
            return 'Draggable Bezier Curve'
        return 'Bezier Curve Drawing'
    
    if found.get('spring'):
        if found.get('rope'):
            return 'Spring-Based Rope Physics'
        return 'Spring Physics System'
    
    if found.get('arc'):
        if 'point' in filename and 'line' in filename:
            return 'Arc Between Point and Line'
        if 'pointlist' in filename:
            return 'Arc Path Through Points'
        if 'radial' in filename:
            return 'Radial Arc Pattern'
        if 'sweep' in filename:
            return 'Arc Sweep Animation'
    
    if found.get('gradient'):
        if 'conic' in filename:
            return 'Conic Gradient'
        if 'radial' in filename:
            return 'Radial Gradient'
        if 'linear' in filename:
            return 'Linear Gradient'
        return 'Gradient Color Effect'
    
    if found.get('grid'):
        if 'panning' in filename:
            return 'Pannable Grid System'
        if 'flag' in filename:
            return 'Grid Flag Wave Effect'
        if 'pillow' in filename:
            return 'Grid Pillow Deformation'
        return 'Grid Layout System'
    
    if found.get('follow'):
        if found.get('gravity'):
            return 'Follow Point with Gravity'
        return 'Point Following Behavior'
    
    if found.get('pseudo3d'):
        if 'cube' in filename:
            return 'Pseudo-3D Cube Rotation'
        if 'sphere' in filename:
            return 'Pseudo-3D Sphere Rendering'
        if 'plane' in filename:
            return 'Pseudo-3D Plane Projection'
        if 'tetra' in filename:
            return 'Pseudo-3D Tetrahedron'
        return 'Pseudo-3D Rendering'
    
    # Default to cleaned filename
    return name

def main():
    content_file = Path('/workspaces/polypoint/theatre_files_content.txt')
    output_file = Path('/workspaces/polypoint/comprehensive_title_mapping.txt')
    
    file_blocks = extract_file_content(content_file)
    
    suggestions = []
    
    for block in file_blocks:
        filename = block['filename']
        content = block['content']
        current_title = get_current_title(content)
        
        if should_improve_title(filename, current_title):
            suggested = suggest_better_title(filename, content, current_title)
            suggestions.append({
                'file': filename,
                'current': current_title or '(none)',
                'suggested': suggested
            })
    
    # Write comprehensive mapping
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write("# Comprehensive Title Mapping for Theatre Files\n")
        out.write(f"# Generated: {len(suggestions)} titles need improvement\n")
        out.write("# Format: filename | suggested_title\n\n")
        
        for s in sorted(suggestions, key=lambda x: x['file']):
            out.write(f"{s['file']} | {s['suggested']}\n")
    
    print(f"Found {len(suggestions)} files with titles needing improvement")
    print(f"Mapping written to: {output_file}")
    print(f"\nSample suggestions:")
    for s in suggestions[:10]:
        print(f"  {s['file']}")
        print(f"    Current: {s['current']}")
        print(f"    Suggest: {s['suggested']}")

if __name__ == '__main__':
    main()
