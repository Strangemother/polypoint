# Tree version 2, for cleaner parsing.
#
import os
# from tree2 import TreeReader
from pathlib import Path
import json
from datetime import datetime as dt


from collections import defaultdict



doc_path = Path("C:/Users/jay/Documents/projects/polypoint/docs/")


# tree_filepath = doc_path / "trees/ast-demo-js-tree.json"
# tree_filepath = doc_path / "trees/stage-js-tree.json"
tree_filepath = doc_path / "trees/point-js-tree.json"
# tree_filepath = doc_path / "trees/timeit-js-tree.json"
# tree_filepath = doc_path / "trees/easing-js-tree.json"
# filepath = doc_path / "trees/point-js-tree/cut-cache/data-cut/_info.json"
output_dir = doc_path / "trees/clean/"


def main(target=tree_filepath):
    t = PhaseTree(tree_filepath=target, output_dir=output_dir)
    t.run()



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

    def get_header_comment(self, pos:Position, block_comments=True, single_line=False):
        start_line = pos.loc['start']['line']
        on_line = ()
        for comment in reversed(self.comments):
            comment_end_line = comment['currentLoc']['line']
            is_above = comment_end_line < start_line
            is_block = comment['block'] and block_comments
            is_single = not comment['block'] and single_line
            distance = comment_end_line - start_line

            if distance == 0:
                # on the line
                on_line += (comment,)
                continue

            # if (comment_end_line - start_line) <= 1:
            #     import pdb; pdb.set_trace()  # breakpoint cc61d69e //

            if is_above and (is_block or is_single):
                if distance < -1:
                    return on_line
                return on_line + (comment, )

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
            item_defs += item_def.value if isinstance(item_def, Concat) else (item_def,)
            # item_defs += (item_def, )

        prog['defs'] = item_defs

        # Stash the titles of each type in an ordered list.
        prog['types'] = ordered_tops
        prog['info'] = content['info']

        op = self.stash_dir / 'program.json'
        if op.parent.exists() is False:
            os.makedirs(op.parent)
        dump_json(prog, op)

        return prog

    def node_ClassDeclaration(self, tree, content):
        """The response it sent to the prog output.
        """

        pos = tree['pos']
        # raw_comments = self.get_inside_comments(pos.start, pos.end)
        raw_comments = self.get_area_comments(pos)

        return {
            "kind": "class",
            "word": tree['id']['name'],
            "parentName": tree['superClass'].get('name', None) if tree['superClass'] else None,
            "type": tree['type'],
            # node_ClassBody
            "body": self.get_inner_method(tree['body'], content),
            "super_class": tree['superClass'],
            "raw_comments": raw_comments,
            "id": tree['id'],
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
        # raw_comments = self.get_inside_comments(pos.start, pos.end)
        raw_comments = self.get_area_comments(pos)

        return {
            "kind": tree['kind'],
            "word": tree.get('key', {}).get('name'),
            "static": tree['static'],
            "computed": tree['computed'],
            "value": self.get_inner_method(tree['value'], content),
            "type": tree['type'],
            "raw_comments": raw_comments,
            **self.make_key(tree, content),
            **self.make_position(tree),
            # , "id": tree['id']
        }

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
        return {
            "type": tree['type'],
            "id": self.get_inner_method(tree['id'], content) if tree['id'] else None,
            "generator": tree['generator'],
            "expression": tree['expression'],
            "async": tree['async'],
            "params": [y for x in params for y in x],
            **self.make_position(tree),
            # "params": self.get_inner_method_many(tree['params'], content),
        }

    def node_FunctionDeclaration(self, tree, content):
        """The response it sent to the prog output.

            function genericFunction() {
                /* Generic function with no arguments and a block comment */
                console.log('genericFunction')
            }
        """

        return {
            "kind": "function",
            "word": tree['id']['name'],
            "generator": tree['generator'],
            "expression": tree['expression'],
            "async": tree['async'],
            "params": self.get_inner_method_many(tree['params'], content),
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
            {
                "kind": "const",
                "type": "VariableDeclaration",
                "declarations": [
                    {
                        "word": "stackItem1",
                        "type": "VariableDeclarator",
                        "init": {
                            "kind": "literal",
                            "raw": "'foo'",
                            "value": "foo",
                            "pos": "98, 103, 5, 19, 5, 24"
                        },
                        "id": {
                            "type": "Identifier",
                            "word": "stackItem1",
                            "pos": "85, 95, 5, 6, 5, 16"
                        },
                        "pos": "85, 103, 5, 6, 5, 24"
                    },
                    ...
                ],
                "pos": "79, 205, 5, 0, 9, 29"
            }
        """
        orig = tree.copy()
        decs = orig.pop('declarations', ())
        items = ()


        for dec in decs:
            new_dec = orig.copy()
            pos = dec['pos']
            # raw_comments = self.get_inside_comments(pos.start, pos.end)
            raw_comments = self.get_area_comments(pos)
            d = {
                'word': dec['id']['name'],
                'sub_type': dec['type'],
                'init': self.get_inner_method(dec['init'], content),
                "raw_comments": raw_comments,
                'sub_id': dec['id'],
            }
            d.update(new_dec)
            # new_dec.update(d)
            items += (d,)
        # return items
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




if __name__ == '__main__':
    main()