#!/usr/bin/env python3
"""
Extract diffs of all unstaged files into a single readable file.
"""
import subprocess
import sys

def get_changed_files():
    """Get list of modified files that are unstaged."""
    result = subprocess.run(
        ['git', 'diff', '--name-only'],
        capture_output=True,
        text=True,
        check=True
    )
    return [f.strip() for f in result.stdout.strip().split('\n') if f.strip()]

def get_file_diff(filepath):
    """Get the diff for a specific file with minimal context, ignoring whitespace."""
    result = subprocess.run(
        ['git', 'diff', '-w', '--unified=0', filepath],
        capture_output=True,
        text=True,
        check=True
    )
    return result.stdout

def main():
    output_file = 'all_diffs.txt'
    
    print("Extracting diffs of unstaged files...")
    
    changed_files = get_changed_files()
    
    if not changed_files:
        print("No unstaged changes found.")
        return
    
    print(f"Found {len(changed_files)} changed files")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"DIFF REVIEW - {len(changed_files)} files changed\n")
        f.write("=" * 80 + "\n\n")
        
        for i, filepath in enumerate(changed_files, 1):
            print(f"Processing {i}/{len(changed_files)}: {filepath}")
            
            diff = get_file_diff(filepath)
            
            # Skip the git diff header lines, keep only the actual changes
            lines = diff.split('\n')
            relevant_lines = []
            for line in lines:
                if line.startswith('@@') or line.startswith('-title:') or line.startswith('+title:'):
                    relevant_lines.append(line)
            
            if relevant_lines:
                f.write(f"FILE {i}/{len(changed_files)}: {filepath}\n")
                f.write('\n'.join(relevant_lines))
                f.write("\n\n")
    
    print(f"\n✓ All diffs written to: {output_file}")
    print(f"  Total files: {len(changed_files)}")

if __name__ == '__main__':
    main()
