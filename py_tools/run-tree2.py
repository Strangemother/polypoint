# Tree version 2, for cleaner parsing.
#
import os
import sys
import argparse
from pathlib import Path
import json
from datetime import datetime as dt
from collections import defaultdict


# Default paths
doc_path = Path("../docs/")
trees_dir = doc_path / "trees"
output_dir = doc_path / "trees/clean/"

# Default tree file
default_tree = "point-js-tree.json"


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description='Parse JavaScript AST tree files into documentation format',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s point-js-tree.json
  %(prog)s zoom-js-tree.json
  %(prog)s stage-js-tree.json
  %(prog)s --list
  %(prog)s --parse-missed
        """
    )
    
    parser.add_argument(
        'tree_file',
        nargs='?',
        default=default_tree,
        help=f'Name of the tree JSON file (default: {default_tree})'
    )
    
    parser.add_argument(
        '--trees-dir',
        default=trees_dir,
        type=Path,
        help=f'Directory containing tree files (default: {trees_dir})'
    )
    
    parser.add_argument(
        '--output-dir',
        default=output_dir,
        type=Path,
        help=f'Output directory for processed files (default: {output_dir})'
    )
    
    parser.add_argument(
        '--list', '-l',
        action='store_true',
        help='List available tree files and exit'
    )
    
    parser.add_argument(
        '--parse-missed', '-m',
        action='store_true',
        help='Parse all tree files that have not been processed yet'
    )
    
    return parser.parse_args()


def list_tree_files(trees_dir):
    """List all available tree JSON files"""
    trees_path = Path(trees_dir)
    if not trees_path.exists():
        print(f"Error: Trees directory not found: {trees_dir}")
        return []
    
    tree_files = sorted(trees_path.glob('*-tree.json'))
    
    if not tree_files:
        print(f"No tree files found in {trees_dir}")
        return []
    
    print(f"\nAvailable tree files in {trees_dir}:")
    print("=" * 60)
    for tree_file in tree_files:
        size = tree_file.stat().st_size / 1024  # KB
        print(f"  {tree_file.name:<30} ({size:>8.1f} KB)")
    print()
    
    return tree_files


def find_unprocessed_files(trees_dir, output_dir):
    """Find tree files that haven't been processed yet"""
    trees_path = Path(trees_dir)
    output_path = Path(output_dir)
    
    if not trees_path.exists():
        print(f"Error: Trees directory not found: {trees_dir}")
        return []
    
    tree_files = sorted(trees_path.glob('*-tree.json'))
    unprocessed = []
    
    for tree_file in tree_files:
        # Derive the expected output path
        # e.g., zoom-js-tree.json -> clean/stash/zoom-js/references.json
        base_name = tree_file.stem.replace('-tree', '')  # zoom-js-tree -> zoom-js
        expected_output = output_path / 'stash' / base_name / 'references.json'
        
        if not expected_output.exists():
            unprocessed.append(tree_file)
    
    return unprocessed


def main():
    """Main entry point with argument parsing"""
    args = parse_args()
    
    # Handle --list option
    if args.list:
        list_tree_files(args.trees_dir)
        return 0
    
    # Handle --parse-missed option
    if args.parse_missed:
        unprocessed = find_unprocessed_files(args.trees_dir, args.output_dir)
        
        if not unprocessed:
            print("✓ All tree files have been processed!")
            return 0
        
        print(f"\nFound {len(unprocessed)} unprocessed file(s):")
        print("=" * 60)
        for tree_file in unprocessed:
            size = tree_file.stat().st_size / 1024  # KB
            print(f"  {tree_file.name:<30} ({size:>8.1f} KB)")
        print()
        
        # Process each unprocessed file
        success_count = 0
        fail_count = 0
        
        for tree_file in unprocessed:
            print(f"\nProcessing: {tree_file.name}")
            print(f"Input:  {tree_file}")
            print(f"Output: {args.output_dir}")
            
            try:
                t = PhaseTree(tree_filepath=tree_file, output_dir=args.output_dir)
                t.run()
                print(f"✓ Successfully processed {tree_file.name}")
                success_count += 1
            except Exception as e:
                print(f"✗ Error processing {tree_file.name}: {e}")
                import traceback
                traceback.print_exc()
                fail_count += 1
        
        print("\n" + "=" * 60)
        print(f"Summary: {success_count} succeeded, {fail_count} failed")
        return 0 if fail_count == 0 else 1
    
    # Construct full path to tree file
    tree_filepath = args.trees_dir / args.tree_file
    
    # Check if file exists
    if not tree_filepath.exists():
        print(f"Error: Tree file not found: {tree_filepath}")
        print(f"\nUse --list to see available files")
        return 1
    
    # Run the parser
    print(f"Processing: {args.tree_file}")
    print(f"Input:  {tree_filepath}")
    print(f"Output: {args.output_dir}")
    print()
    
    try:
        t = PhaseTree(tree_filepath=tree_filepath, output_dir=args.output_dir)
        t.run()
        print(f"\n✓ Successfully processed {args.tree_file}")
        return 0
    except Exception as e:
        print(f"\n✗ Error processing {args.tree_file}: {e}")
        import traceback
        traceback.print_exc()
        return 1



class ComplexEncoder(json.JSONEncoder):
    """
        from .encoder import ComplexEncoder
        json.dumps({}, cls=ComplexEncoder)
    """
    def default(self, obj):
        if hasattr(obj, 'as_json'):
            return obj.as_json()

        if isinstance(obj, Path):
            return str(obj.as_posix())

        if isinstance(obj, Position):
            return vars(obj)

        if isinstance(obj, Concat):
            return obj.value

        # Let the base class default method raise the TypeError
        return super().default(obj)


def load_json(path):
    input_file = Path(path)
    return json.loads(input_file.read_text())


def dump_json(data, path):
    input_file = Path(path)
    return input_file.write_text(json.dumps(data, indent=4, cls=ComplexEncoder))


class Position:
    """
        "id": {
            "type": "Identifier",
            "start": 85,
            "end": 96,
            "loc": {
                "start": {
                    "line": 5,
                    "column": 6
                },
                "end": {
                    "line": 5,
                    "column": 17
                }
            },
            "name": "ParentClass"
        },

         "id": {
            "type": "Identifier",
            "pos": [85, 96, 5, 6, 5, 27]
            "name": "ParentClass"
        },
    """

    def __init__(self, start, end, loc):
        self.start = start
        self.end = end
        self.loc = loc

    def __str__(self):
        s = self.loc['start']
        e = self.loc['end']
        return f"{self.start}, {self.end}, {s['line']}, {s['column']}, {e['line']}, {e['column']}"

    def as_json(self):
        # return self.as_tuple()
        return vars(self)

    def as_tuple(self):
        s = self.loc['start']
        e = self.loc['end']
        return (self.start, self.end, s['line'], s['column'], e['line'], e['column'])


class Concat:
    value = None

    def __init__(self, v):
        self.value = v


class TreeReader:

    def __init__(self, tree_filepath, output_dir):
        self.tree_filepath = tree_filepath
        self.output_dir = output_dir
        self.stash_dir = output_dir / 'stash'

    def run(self):
        print('run', self.tree_filepath)
        content = load_json(self.tree_filepath)
        ast_tree = content['ast']
        self.comments = content['comments']
        filename = content['info']['filename']
        self.stash_dir /= Path(filename.replace('.', '-'))

        self.definitions = {
            "program": defaultdict(dict)
        }

        # save a raw tree without positions (delete this.)
        # self.delete_locs_example(ast_tree)
        self.descend_locs(ast_tree, destroy=False)

        self.work_tree(content)

    def work_tree(self, content):
        # Top level Program.
        ast_tree = content['ast']
        return self.get_inner_method(ast_tree, content)

    def get_inner_method(self, ast_tree, content):
        """Given a tree or partial tree, and the `content`,
        discover and call the correct method for the object.

        Return the parse result of content.
        """
        if ast_tree is None:
            print('blank tree')
            return
        _type = ast_tree.get("type", None)
        method_name = f'node_{_type}'

        if hasattr(self, method_name):
            return getattr(self, method_name)(ast_tree, content)
        else:
            print('Issue: Unknown node', _type)

    def get_inner_method_many(self, tree_params, content):
        """Given the _params_ object from a function expression,
        return something cleaner; a list of flatted info
        """
        # Call to AssignmentPattern or Identifier
        res = ()
        for item in tree_params:
            item = self.get_inner_method(item, content),
            res += item.value if isinstance(item, Concat) else (item,)
        return res

    def delete_locs_example(self, ast_tree):
        self.descend_locs(ast_tree, destroy=True)
        tree_filepath = doc_path / "trees/ast-demo-js-tree-deleted-locs.json"
        dump_json(ast_tree, tree_filepath)


    def descend_locs(self, d, destroy=False):
        """Descend the tree and visit every node,
        replace _LOC_ with _pos_ (for readability only.)
        """
        if isinstance(d, list):
            for item in d:
                self.descend_locs(item, destroy)
            return d

        if isinstance(d, dict):
            if 'loc' in d:
                self.reprocess_locs(d, destroy=destroy)

            for k, v in d.items():
                if isinstance(v, list):
                    for item in v:
                        self.descend_locs(item, destroy)

                if isinstance(v, dict):
                    if 'loc' in v:
                        self.reprocess_locs(v, destroy=destroy)
                    self.descend_locs(v, destroy)

        return d


    def reprocess_locs(self, obj, destroy=False):

        loc = obj['loc']
        start = obj['start']
        end = obj['end']
        if destroy is False:
            obj['pos'] = Position(start,end, loc)
        # del obj['loc']
        # del obj['start']
        # del obj['end']
        return obj


class CommentsMixin:

    def get_header_comment(self, obj_start, block_comments=True, single_line=True):
        """
        Finds the comment immediately preceding a class or function definition.
        Scans *backward* from obj_start, stopping at the first non-adjacent comment.
        """
        preceding_comments = []

        for comment in reversed(self.comments):
            if comment['end'] <= obj_start:
                match_block = comment['block'] and block_comments
                match_single = not comment['block'] and single_line
                if match_block or match_single:
                    # Only allow immediately preceding comments (gap ≤ 1 line)
                    if preceding_comments:
                        last = preceding_comments[-1]
                        if last['currentLoc']['line'] + 1 < comment['startLoc']['line']:
                            break  # too much vertical space; it's not a header
                    return comment
                    preceding_comments.append(comment)
                else:
                    break
            elif comment['start'] > obj_start:
                continue  # skip comments inside the body
            else:
                break  # comment overlaps object; skip

        # Return comments in original order
        return list(reversed(preceding_comments))

    def get_header_comment(self, obj_start_line, block_comments=True, single_line=False):
        """
        Returns the *single* closest comment block immediately preceding the given line.
        Rejects comments with vertical gaps.
        Assumes comment entries have 'end_line' and 'start_line'.
        """

        for comment in reversed(self.comments):
            is_above = comment['currentLoc']['line'] < obj_start_line
            is_block = comment['block'] and block_comments
            is_single = not comment['block'] and single_line

            if is_above and (is_block or is_single):
                # Check for adjacency (no more than 1 blank line between comment and object)
                if obj_start_line - comment['currentLoc']['line'] <= 1:
                    return comment  # ✅ Found the one
                else:
                    return None  # ❌ Too far away

        return None  # ❌ No matching comment found

    def get_header_comment(self, pos:Position, block_comments=True, single_line=True):
        """
        Get header comments for a method/class definition.
        Captures comments immediately preceding the definition (within 1 line).
        
        Returns tuple of comments in order (furthest to closest).
        """
        start_line = pos.loc['start']['line']
        header_comments = []
        
        for comment in reversed(self.comments):
            comment_end_line = comment['currentLoc']['line']
            is_block = comment['block'] and block_comments
            is_single = not comment['block'] and single_line
            
            # Skip if not a type we're looking for
            if not (is_block or is_single):
                continue
            
            # Calculate distance (negative means comment is above)
            distance = start_line - comment_end_line
            
            if distance == 0:
                # Comment on same line as definition (rare but possible)
                header_comments.append(comment)
            elif distance == 1:
                # Comment immediately above (1 line gap)
                header_comments.append(comment)
            elif distance > 1:
                # Too far away, stop looking
                break
            # distance < 0 means comment is below, skip it
        
        # Return in original order (top to bottom)
        return tuple(reversed(header_comments))

    def get_area_comments(self, pos):
        return {
            'header': self.get_header_comment(pos),
            'inner': self.get_inside_comments(pos),
        }

    def get_inside_comments(self, start, end=None, block_comments=True, single_line=True):
        """
            for method_def in class_body['body']:
                raw_comments = self.get_inside_comments(
                            start=class_block['coord'].start,
                            end=method_def['coord'].start,
                            block_comments=True,
                            single_line=False
                        )
        """
        res = ()
        if end is None and isinstance(start, Position):
            end = start.end
            start = start.start

        for comment in self.comments:
            #Ensure the given comment is within the working range
            openStack = comment['start'] >= start and comment['end'] <= end
            # Is a block, and blocks are requested
            match_block = comment['block'] == True and block_comments == True
            # is a single line, and single line is requested
            match_single_line = comment['block'] == False and single_line == True
            if match_block or match_single_line:
                if openStack:
                    res += (comment, )
                    # break at the first comment discovery. To save the spillover
                    # for the _next_ method header comment
                    break
            # Past the end of the applicable range.
            if comment['end'] >= end:
                break
        return res


class PhaseTree(TreeReader, CommentsMixin):
    """This phase of tree rendering converts the tree into a leaner
    version - cleaning up items we don't need
    """

    apply_position = True
    apply_key = False
    denest_vars = True
    simplify_params = True  # Clean up params to minimal format
    convert_comments_to_html = False  # Set True to convert markdown to HTML

    def node_Program(self, tree, content):
        """This is the top level.
        iter the body.

        This should create a _definition_. complete with details.

        class:
            name
            super class
            props
            methods
        """

        ## The result product stored as json.
        prog = defaultdict(dict)

        filename = content['info']['filename']
        # Store this output dict into the result - _program_ defs
        self.definitions['program'][filename] = prog

        ordered_tops = ()
        item_defs = ()

        for item in tree['body']:
            ordered_tops += (item['type'], )
            # Read the type, get the node, stash the node.
            item_def = self.get_inner_method(item, content)
            # Handle Concat, None, or regular items
            if isinstance(item_def, Concat):
                item_defs += item_def.value
            elif item_def is not None:
                item_defs += (item_def,)

        prog['defs'] = item_defs
        prog['types'] = ordered_tops
        prog['info'] = content['info']

        # Save the detailed program structure
        op = self.stash_dir / 'program.json'
        if op.parent.exists() is False:
            os.makedirs(op.parent)
        dump_json(prog, op)

        # Create a UI-friendly reference file
        self.create_reference_file(prog, filename)

        return prog
    
    def create_reference_file(self, prog, filename):
        """
        Create a simplified reference file optimized for UI consumption.
        This matches the format expected by the Django template.
        
        Captures:
        - Classes with methods
        - Top-level functions
        - Top-level constants/variables
        """
        references = {
            'classes': {},
            'functions': [],
            'constants': []
        }
        
        for item_def in prog['defs']:
            # Skip None values (from empty statements or unhandled nodes)
            if item_def is None or not isinstance(item_def, dict):
                continue
                
            if item_def.get('kind') == 'class':
                # Handle class declarations
                class_name = item_def['word']
                
                # Extract methods from the class body
                methods = []
                for body_item in item_def.get('body', []):
                    if body_item.get('kind') in ['constructor', 'method', 'get', 'set']:
                        pos = body_item.get('pos')
                        line_no = self._extract_line_number(pos)
                        
                        method_info = {
                            'method_name': body_item.get('word'),
                            'class_name': class_name,
                            'kind': body_item['kind'],
                            'params': body_item.get('value', {}).get('params', []),
                            'comments': body_item.get('comments', {'header': [], 'inner': []}),
                            'static': body_item.get('static', False),
                            'is_symbol': body_item.get('is_symbol', False),
                            'computed': body_item.get('computed', False),
                            'line': line_no
                        }
                        methods.append(method_info)
                
                class_pos = item_def.get('pos')
                class_line = self._extract_line_number(class_pos)
                
                references['classes'][class_name] = {
                    'class_name': class_name,
                    'inherits': item_def.get('parentName'),
                    'methods': methods,
                    'comments': item_def.get('comments', {'header': [], 'inner': []}),
                    'line': class_line
                }
                
            elif item_def.get('kind') == 'function':
                # Handle top-level function declarations (function foo() {})
                func_name = item_def.get('word', '')
                pos = item_def.get('pos')
                line_no = self._extract_line_number(pos)
                
                func_info = {
                    'name': func_name,
                    'kind': 'function',
                    'type': 'function',
                    'line': line_no,
                    'params': item_def.get('params', []),
                    'async': item_def.get('async', False),
                    'generator': item_def.get('generator', False),
                    'comments': item_def.get('comments', {'header': [], 'inner': []})
                }
                references['functions'].append(func_info)
                
            elif item_def.get('kind') == 'const' or item_def.get('kind') == 'let' or item_def.get('kind') == 'var':
                # Handle top-level variable declarations (functions, constants, objects)
                var_name = item_def.get('word', '')
                init = item_def.get('init', {})
                init_type = init.get('type', '') if isinstance(init, dict) else ''
                pos = item_def.get('pos')
                line_no = self._extract_line_number(pos)
                
                var_info = {
                    'name': var_name,
                    'kind': item_def.get('kind'),
                    'line': line_no,
                    'comments': item_def.get('comments', {'header': [], 'inner': []})
                }
                
                if init_type == 'FunctionExpression':
                    # It's a function
                    var_info['type'] = 'function'
                    var_info['params'] = init.get('params', [])
                    var_info['async'] = init.get('async', False)
                    references['functions'].append(var_info)
                    
                elif init_type == 'ArrowFunctionExpression':
                    # Arrow function
                    var_info['type'] = 'arrow_function'
                    var_info['params'] = init.get('params', [])
                    var_info['async'] = init.get('async', False)
                    references['functions'].append(var_info)
                    
                elif init_type == 'ObjectExpression':
                    # Object/config
                    var_info['type'] = 'object'
                    var_info['properties'] = self._extract_object_properties(init)
                    references['constants'].append(var_info)
                    
                else:
                    # Other constants (literals, etc)
                    var_info['type'] = 'constant'
                    if init_type == 'Literal':
                        var_info['value'] = init.get('value')
                    references['constants'].append(var_info)
        
        # Save the reference file
        ref_path = self.stash_dir / 'references.json'
        ref_data = {
            'src_file': filename,
            'references': references,
            'info': prog['info']
        }
        dump_json(ref_data, ref_path)
        
        print(f'Created reference file: {ref_path}')
        return ref_data
    
    def _extract_object_properties(self, obj_expr):
        """Extract property names from an ObjectExpression"""
        if not isinstance(obj_expr, dict):
            return []
        
        properties = obj_expr.get('properties', [])
        if not properties:
            return []
        
        prop_list = []
        for prop in properties[:10]:  # Limit to first 10 properties
            if isinstance(prop, dict):
                prop_info = {
                    'name': prop.get('word', prop.get('key', {}).get('name', ''))
                }
                # Check if property is a method
                if prop.get('method') or prop.get('value', {}).get('type') == 'FunctionExpression':
                    prop_info['is_method'] = True
                prop_list.append(prop_info)
        
        return prop_list
    
    def _extract_line_number(self, pos):
        """Extract line number from position object or dict"""
        if isinstance(pos, Position):
            return pos.loc.get('start', {}).get('line', 0)
        elif isinstance(pos, dict):
            return pos.get('loc', {}).get('start', {}).get('line', 0)
        return 0

    def node_ClassDeclaration(self, tree, content):
        """The response it sent to the prog output.
        """

        pos = tree['pos']
        raw_comments = self.get_area_comments(pos)
        comments = self.format_comments_for_output(raw_comments)

        return {
            "kind": "class",
            "word": tree['id']['name'],
            "parentName": tree['superClass'].get('name', None) if tree['superClass'] else None,
            "type": tree['type'],
            "body": self.get_inner_method(tree['body'], content),
            "comments": comments,
            **self.make_position(tree),
        }

    def node_ClassBody(self, tree, content):
        """The body of the class.
        """
        item_defs = ()
        # return item_defs

        for item in tree['body']:
            # Read the type, get the node, stash the node.
            item_def = self.get_inner_method(item, content)
            item_defs += item_def.value if isinstance(item_def, Concat) else (item_def, )

        return item_defs

    def node_MethodDefinition(self, tree, content):
        """The response it sent to the prog output.
        """

        pos = tree['pos']
        raw_comments = self.get_area_comments(pos)
        comments = self.format_comments_for_output(raw_comments)
        
        # Extract method name, handling computed properties like [Symbol.toPrimitive]
        method_name, is_computed, is_symbol = self._extract_method_name(tree)

        return {
            "kind": tree['kind'],
            "word": method_name,
            "static": tree['static'],
            "computed": tree['computed'],
            "is_symbol": is_symbol,
            "value": self.get_inner_method(tree['value'], content),
            "type": tree['type'],
            "comments": comments,
            **self.make_key(tree, content),
            **self.make_position(tree),
        }

    def _extract_method_name(self, tree):
        """
        Extract method name from a MethodDefinition, handling computed properties.
        
        Returns: (method_name, is_computed, is_symbol)
        
        Examples:
            alphaMethod() -> ("alphaMethod", False, False)
            [Symbol.toPrimitive]() -> ("Symbol.toPrimitive", True, True)
            [key]() -> ("[key]", True, False)
        """
        key = tree.get('key', {})
        is_computed = tree.get('computed', False)
        is_symbol = False
        method_name = None
        
        if not is_computed:
            # Simple method name: alphaMethod()
            method_name = key.get('name')
        else:
            # Computed property: [Symbol.toPrimitive], [key], etc.
            if key.get('type') == 'MemberExpression':
                # [Symbol.toPrimitive] or [Object.keys], etc.
                obj = key.get('object', {})
                prop = key.get('property', {})
                
                obj_name = obj.get('name', '')
                prop_name = prop.get('name', '')
                
                if obj_name and prop_name:
                    method_name = f"{obj_name}.{prop_name}"
                    is_symbol = (obj_name == 'Symbol')
                else:
                    # Fallback to bracketed representation
                    method_name = f"[{obj_name}.{prop_name}]"
            elif key.get('type') == 'Identifier':
                # [key] where key is a variable
                method_name = f"[{key.get('name', 'computed')}]"
            else:
                # Other computed expressions
                method_name = f"[computed_{key.get('type', 'method')}]"
        
        return method_name, is_computed, is_symbol

    def make_key(self, tree, content):
        if self.apply_key is False:
            return {}
        return {"key": self.get_inner_method(tree['key'], content),}

    def make_position(self, tree):
        if self.apply_position is False:
            return {}
        return {'pos': tree['pos']}

    def node_PropertyDefinition(self, tree, content):

        tree["kind"] = 'property'
        tree["word"] = tree['key']['name']
        return {
            "kind": tree['kind'],
            "word": tree['key']['name'],
            "computed": tree['computed'],
            "static": tree['static'],
            "value": self.get_inner_method(tree.get('value'), content),
            # "value": tree['value'],
            **self.make_key(tree, content),
            "type": tree['type'],
            **self.make_position(tree),
        }

    def node_Literal(self, tree, content):
        """
            "value": {
                "type": "Literal",
                "value": "window",
                "raw": "'window'",
                "pos": "161, 169, 8, 16, 8, 24"
            },

        """
        return {
            'kind': 'literal',
            'raw': tree['raw'],
            'value': tree['value'],
            **self.make_position(tree),
        }

    def node_FunctionExpression(self, tree, content):
        """The response it sent to the prog output.
        """
        params = self.get_inner_method_many(tree['params'], content)
        # Flatten params - they're already tuples from get_inner_method_many
        flat_params = [y for x in params for y in x] if params else []
        
        if self.simplify_params:
            flat_params = self.simplify_parameters(flat_params)
        
        return {
            "type": tree['type'],
            "id": self.get_inner_method(tree['id'], content) if tree['id'] else None,
            "generator": tree['generator'],
            "expression": tree['expression'],
            "async": tree['async'],
            "params": flat_params,
            **self.make_position(tree),
        }

    def node_ArrowFunctionExpression(self, tree, content):
        """
        Handle arrow functions: (x) => x * 2, () => { return 5; }
        """
        params = self.get_inner_method_many(tree['params'], content)
        flat_params = [y for x in params for y in x] if params else []
        
        if self.simplify_params:
            flat_params = self.simplify_parameters(flat_params)
        
        return {
            "type": tree['type'],
            "expression": tree.get('expression', False),
            "async": tree.get('async', False),
            "params": flat_params,
            **self.make_position(tree),
        }

    def node_FunctionDeclaration(self, tree, content):
        """The response it sent to the prog output.

            function genericFunction() {
                /* Generic function with no arguments and a block comment */
                console.log('genericFunction')
            }
        """
        params = self.get_inner_method_many(tree['params'], content)
        # Flatten params - they're already tuples from get_inner_method_many
        flat_params = [y for x in params for y in x] if params else []
        
        if self.simplify_params:
            flat_params = self.simplify_parameters(flat_params)

        return {
            "kind": "function",
            "word": tree['id']['name'],
            "generator": tree['generator'],
            "expression": tree['expression'],
            "async": tree['async'],
            "params": flat_params,
            "id": tree['id'],
            **self.make_position(tree),
            "type": tree['type'],
        }

    def node_Identifier(self, tree, content):
        return {
            "type": tree['type'],
            "word": tree['name'],
            # "name": tree['name'],
            **self.make_position(tree),
        }

    def node_AssignmentPattern(self, tree, content):
        # return tree
        return {
            "type": tree['type'],
            # "name": tree['left']['name'],
            **self.make_position(tree),
            "left": tree['left'],
            "right": tree['right'],
        }
        # return {
        #     "type": tree['type'],
        #     "type": tree['type'],
        # }

    def node_RestElement(self, tree, content):
        """Handle rest parameters like ...points in function arguments"""
        return {
            "type": tree['type'],
            "word": tree['argument']['name'],
            "argument": self.get_inner_method(tree['argument'], content),
            **self.make_position(tree),
        }

    def node_AssignmentExpression(self, tree, content):
        """
        Handle assignment expressions: x = 5, this.value = foo, etc.
        
        Example: this.stage = stage
        """
        return {
            "type": tree['type'],
            "operator": tree['operator'],
            "left": self.get_inner_method(tree.get('left'), content),
            "right": self.get_inner_method(tree.get('right'), content),
            **self.make_position(tree),
        }

    def node_MemberExpression(self, tree, content):
        """
        Handle member expressions: this.property, object.method, array[index]
        
        Examples:
            - this.stage
            - Point.prototype
            - obj['key']
        """
        return {
            "type": tree['type'],
            "object": self.get_inner_method(tree.get('object'), content),
            "property": self.get_inner_method(tree.get('property'), content),
            "computed": tree.get('computed', False),
            "optional": tree.get('optional', False),
            **self.make_position(tree),
        }

    def node_ThisExpression(self, tree, content):
        """
        Handle 'this' keyword
        """
        return {
            "type": tree['type'],
            "word": "this",
            **self.make_position(tree),
        }

    def node_ArrayExpression(self, tree, content):
        """
        Handle array literals: [1, 2, 3], []
        """
        elements = tree.get('elements', [])
        return {
            "type": tree['type'],
            "elements": [self.get_inner_method(el, content) for el in elements if el],
            "length": len(elements),
            **self.make_position(tree),
        }

    def node_NewExpression(self, tree, content):
        """
        Handle new expressions: new PointList(), new Point(x, y)
        """
        return {
            "type": tree['type'],
            "callee": self.get_inner_method(tree.get('callee'), content),
            "arguments": [self.get_inner_method(arg, content) for arg in tree.get('arguments', [])],
            **self.make_position(tree),
        }

    def node_ReturnStatement(self, tree, content):
        """
        Handle return statements
        """
        return {
            "type": tree['type'],
            "argument": self.get_inner_method(tree.get('argument'), content) if tree.get('argument') else None,
            **self.make_position(tree),
        }

    def node_BlockStatement(self, tree, content):
        """
        Handle block statements (function bodies, if blocks, etc.)
        Usually we don't need to descend into these for documentation
        """
        return {
            "type": tree['type'],
            "body_length": len(tree.get('body', [])),
            **self.make_position(tree),
        }

    def node_EmptyStatement(self, tree, content):
        """
        Handle empty statements (standalone semicolons)
        These are common in JavaScript and usually can be ignored for documentation
        """
        return {
            "type": tree['type'],
            "kind": "empty",
            **self.make_position(tree),
        }

    def node_VariableDeclaration(self, tree, content):
        # return tree
        r = {
            "kind": tree['kind'],
            "type": tree['type'],
            # "id": tree['id'],
            "declarations": self.get_inner_method_many(tree['declarations'], content),
            # "declarations": tree['declarations'],
            **self.make_position(tree),
        }

        if self.denest_vars:
            return self.perform_vars_denest(r, tree, content)

        return r

    def perform_vars_denest(self, res, tree, content):
        """
        Denest variable declarations so each variable gets its own entry.
        This makes const/let/var with multiple declarations easier to consume.
        """
        orig = tree.copy()
        decs = orig.pop('declarations', ())
        items = ()

        for dec in decs:
            new_dec = orig.copy()
            pos = dec['pos']
            raw_comments = self.get_area_comments(pos)
            comments = self.format_comments_for_output(raw_comments)
            
            d = {
                'word': dec['id']['name'],
                'sub_type': dec['type'],
                'init': self.get_inner_method(dec['init'], content),
                "comments": comments,
                **self.make_position(dec),
            }
            d.update(new_dec)
            items += (d,)
        
        return Concat(items)

    def node_VariableDeclarator(self, tree, content):
        pos = tree['pos']
        raw_comments = self.get_inside_comments(pos.start, pos.end)

        return {
            "word": tree["id"]["name"],
            "type": tree["type"],
            "init": self.get_inner_method(tree["init"], content),
            "id": self.get_inner_method(tree["id"], content),
            "raw_comments": raw_comments,
            # "id": tree["id"],
            **self.make_position(tree),
            # "pos": tree["pos"],
        }

    def node_ExpressionStatement(self, tree, content):
        return {
            "type": tree['type'],
            "expression":self.get_inner_method(tree['expression'], content),
            # "pos": tree['pos'],
            **self.make_position(tree),
        }
        # return tree

    def node_CallExpression(self, tree, content):
        # return {
        #     "type": tree['type'],
        #     "expression":self.get_inner_method(tree['expression'], content),
        #     # "pos": tree['pos'],
        #     **self.make_position(tree),
        # }
        return tree

    def node_BinaryExpression(self, tree, content):
        """
        Handle binary expressions: a + b, x / y, etc.
        Returns a simplified string representation for display.
        """
        left = self.get_inner_method(tree['left'], content)
        right = self.get_inner_method(tree['right'], content)
        operator = tree['operator']
        
        # Helper to extract string from expression
        def get_expr_string(expr):
            if not expr:
                return None
            if isinstance(expr, dict):
                # Try raw first
                if expr.get('raw'):
                    return expr['raw']
                # For MemberExpression, construct it
                if expr.get('type') == 'MemberExpression':
                    obj = expr.get('object', {})
                    prop = expr.get('property', {})
                    obj_name = obj.get('word') or obj.get('name') or str(obj.get('value', ''))
                    prop_name = prop.get('word') or prop.get('name') or str(prop.get('value', ''))
                    return f"{obj_name}.{prop_name}"
                # Try word or name
                if expr.get('word'):
                    return expr['word']
                if expr.get('name'):
                    return expr['name']
                # Try value
                if 'value' in expr:
                    return str(expr['value'])
            return str(expr)
        
        left_str = get_expr_string(left)
        right_str = get_expr_string(right)
        
        # Build the expression string
        expr_parts = []
        if left_str:
            expr_parts.append(left_str)
        expr_parts.append(operator)
        if right_str:
            expr_parts.append(right_str)
        
        return {
            "type": tree['type'],
            "operator": operator,
            "left": left,
            "right": right,
            "raw": f"({' '.join(expr_parts)})",
            **self.make_position(tree),
        }

    def node_ObjectExpression(self, tree, content):
       return {
            # "word": tree["id"]["name"],
            "type": tree["type"],
            "properties": self.get_inner_method_many(tree["properties"], content),
            # "id": tree["id"],
            **self.make_position(tree),
            # "pos": tree["pos"],
        }

    def node_Property(self, tree, content):
        return{
            "kind": tree["kind"],
            "word": tree["key"]["name"],
            "type": tree["type"],
            "method": tree["method"],
            "shorthand": tree["shorthand"],
            "computed": tree["computed"],
            "value": self.get_inner_method(tree["value"], content),
            # "key": tree["key"],
            **self.make_key(tree, content),
            **self.make_position(tree),
            # "pos": tree["pos"]
        }
        # return tuple(tree.keys())

    def simplify_parameters(self, params):
        """
        Convert complex parameter objects into simplified format for UI consumption.
        
        Input examples:
            - {"type": "Identifier", "word": "stage", ...}
            - {"type": "AssignmentPattern", "left": {...}, "right": {...}, ...}
            - {"type": "RestElement", "word": "points", ...}
        
        Output format:
            {"name": "stage"}
            {"name": "points", "default_value": "[]"}
            {"name": "points", "is_rest": true}
        """
        simplified = []
        
        for param in params:
            if not isinstance(param, dict):
                continue
                
            param_type = param.get('type', '')
            result = {}
            
            if param_type == 'Identifier':
                # Simple parameter: (stage)
                result = {
                    "name": param.get('word') or param.get('name', '')
                }
                
            elif param_type == 'AssignmentPattern':
                # Parameter with default: (points=[], factor=1)
                left = param.get('left', {})
                right = param.get('right', {})
                
                result = {
                    "name": left.get('name', '')
                }
                
                # Extract default value
                if right.get('type') == 'Literal':
                    result['default_value'] = right.get('value')
                elif right.get('type') == 'Identifier':
                    result['default_value'] = right.get('name')
                elif right.get('type') == 'ArrayExpression':
                    result['default_value'] = '[]'
                elif right.get('type') == 'ObjectExpression':
                    # Try to represent object defaults simply
                    props = right.get('properties', [])
                    if props:
                        obj_str = self._format_object_default(props)
                        result['default_value'] = obj_str
                    else:
                        result['default_value'] = '{}'
                        
            elif param_type == 'RestElement':
                # Rest parameter: (...points)
                result = {
                    "name": param.get('word', ''),
                    "is_rest": True
                }
            
            if result.get('name'):
                simplified.append(result)
        
        return simplified
    
    def _format_object_default(self, properties):
        """Format object expression properties into a simple string"""
        try:
            parts = []
            for prop in properties[:3]:  # Limit to first 3 properties
                key = prop.get('key', {}).get('name', '')
                value_node = prop.get('value', {})
                if value_node.get('type') == 'Literal':
                    val = value_node.get('value', '')
                    parts.append(f"{key}: {val}")
            
            result = "{" + ", ".join(parts) + "}"
            if len(properties) > 3:
                result = result[:-1] + ", ...}"
            return result
        except:
            return '{}'
    
    def format_comments_for_output(self, raw_comments):
        """
        Format comments for output, optionally converting to HTML.
        
        raw_comments = {
            'header': [...],
            'inner': [...]
        }
        """
        if not raw_comments:
            return {'header': [], 'inner': []}
            
        result = {
            'header': self._process_comment_list(raw_comments.get('header', [])),
            'inner': self._process_comment_list(raw_comments.get('inner', []))
        }
        
        return result
    
    def _process_comment_list(self, comments):
        """Process a list of comment objects"""
        if not comments:
            return []
            
        processed = []
        for comment in comments:
            if isinstance(comment, dict):
                clean = {
                    'text': comment.get('text', ''),
                    'block': comment.get('block', False),
                    'line': comment.get('currentLoc', {}).get('line', 0)
                }
                
                if self.convert_comments_to_html:
                    import markdown
                    import inspect
                    md = markdown.Markdown(extensions=['meta', 'extra'])
                    clean_text = inspect.cleandoc(comment.get('text', ''))
                    clean['html'] = md.convert(clean_text)
                
                processed.append(clean)
        
        return processed




if __name__ == '__main__':
    sys.exit(main())