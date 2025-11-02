"""
Batch process multiple JavaScript AST trees into documentation format.

Usage:
    python batch-tree2.py
    python batch-tree2.py --input ../docs/trees/ --output ../docs/trees/clean/
"""
import sys
from pathlib import Path
from run_tree2 import PhaseTree

def process_directory(input_dir, output_dir):
    """Process all *-tree.json files in the input directory"""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    # Find all tree JSON files
    tree_files = list(input_path.glob('*-tree.json'))
    
    if not tree_files:
        print(f"No *-tree.json files found in {input_dir}")
        return
    
    print(f"Found {len(tree_files)} tree file(s) to process")
    print()
    
    results = []
    
    for tree_file in tree_files:
        print(f"Processing: {tree_file.name}")
        try:
            t = PhaseTree(tree_filepath=tree_file, output_dir=output_path)
            result = t.run()
            results.append({
                'file': tree_file.name,
                'status': 'success',
                'output': t.stash_dir
            })
            print(f"  ✓ Success")
        except Exception as e:
            print(f"  ✗ Error: {e}")
            results.append({
                'file': tree_file.name,
                'status': 'error',
                'error': str(e)
            })
        print()
    
    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    success_count = sum(1 for r in results if r['status'] == 'success')
    error_count = len(results) - success_count
    
    print(f"Total files: {len(results)}")
    print(f"Successful: {success_count}")
    print(f"Errors: {error_count}")
    
    if error_count > 0:
        print("\nFailed files:")
        for r in results:
            if r['status'] == 'error':
                print(f"  - {r['file']}: {r['error']}")
    
    return results


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Batch process JavaScript AST trees for documentation'
    )
    parser.add_argument(
        '--input', '-i',
        default='../docs/trees/',
        help='Input directory containing *-tree.json files (default: ../docs/trees/)'
    )
    parser.add_argument(
        '--output', '-o',
        default='../docs/trees/clean/',
        help='Output directory for processed files (default: ../docs/trees/clean/)'
    )
    
    args = parser.parse_args()
    
    print("Tree Parser V2 - Batch Processor")
    print("=" * 60)
    print(f"Input:  {args.input}")
    print(f"Output: {args.output}")
    print("=" * 60)
    print()
    
    process_directory(args.input, args.output)


if __name__ == '__main__':
    main()
