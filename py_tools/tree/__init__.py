"""
Read the AST tree of the js files within the docs/trees.
"""
import os
import json
from pathlib import Path
from datetime import datetime as dt

from django.conf import settings
from collections import defaultdict

from .encoder import ComplexEncoder
from .reader import Reader
from .convert import Convert

def run_test(tree_filepath=None, **kw):
    """
    import tree
    tree.run_test(keep_coords=True)
    """
    root = Path('C:/Users/jay/Documents/projects/polypoint/')
    tree_filepath = kw.get('tree_filepath', f"{root}/docs/trees/point-js-tree.json")
    # tree_filepath = f"{root}/docs/trees/relative-xy-js-tree.json"
    src_dir = f"{root}/point_src/"
    filepath = f"{src_dir}/point.js"
    print('Reading tree file', tree_filepath)
    filepath = Path(filepath).relative_to(src_dir)
    # t.load_treefile()
    # t.load_file()
    # t.split_file()
    return generic_run(tree_filepath, src_dir, filepath, **kw)


def generic_run(tree_filepath, src_dir, filepath=None, **kw):
    """
        tree_filepath: the ast tree filepath
        src_dir: the polypoint src directory for reference.
        filepath: the input filepath used to generate the AST (optional)
    """
    rp = Path(tree_filepath).with_suffix('')
    out_dir = rp / 'cut-cache'
    if out_dir.exists() is False:
        os.makedirs(out_dir)

    t = Tree(tree_filepath, src_dir=src_dir, **kw)
    t.prepare()
    res = t.parse_all()
    out_p = out_dir / 'class-cut.json'
    print('Writing', out_p)
    t.write_result(out_p, res)

    reader = Reader(res, out_dir, filepath, comments=t.get_comments())
    cut_result = reader.make_docfiles()

    output_dir = kw.get('output_dir')

    Convert().flatten(cut_result['filepath'], output_dir)

    return t, reader


def reload_tool():
    """
    import tree
    tree.reload_tool().run_test(keep_coords=True)
    """
    import tree
    from importlib import reload
    reload(tree)
    return tree


class TreeGetter:
    def __init__(self, data):
        self._data = data

    def __getattr__(self, key):
        return self._data[key]



class MissingFile(Exception):
    pass

class TreeLoader:

    def __init__(self, tree_filepath=None, filepath=None, src_dir=None, **kw):
        self.tree_filepath = Path(tree_filepath) if tree_filepath else None
        # Loaded during the load_file
        self.src_filename = None
        # given at load time.
        self.filepath = filepath
        # The AST from the file.
        self.loaded_tree = None
        self.src_dir = src_dir or ''
        self.__dict__.update(kw)

    def prepare(self, tree_filepath=None):
        if tree_filepath is not None:
            self.tree_filepath = Path(tree_filepath)

        tp = self.tree_filepath
        self.load_treefile(tp)
        self.load_file() # using info content

    def load_treefile(self, tree_filepath=None):
        """Load an tree path file into this reader.
        """
        fp = self.tree_filepath
        if tree_filepath is not None:
            fp = Path(tree_filepath)

        if fp.exists() is False:
            print('Cannot load file', fp)
            # return False
            raise MissingFile(f"Cannot load file {fp}")

        self.loaded_tree = json.loads(fp.read_text())

    def get_tree(self):
        if self.loaded_tree is None:
           self.load_treefile()
        return self.loaded_tree

    def load_file(self, filepath=None):
        """Load file from a given filepath or the tree.
        """
        filepath = filepath or self.find_filepath()
        target  = Path(self.src_dir) / filepath

        if target.exists is False:
            print('No file', target)
            return

        src_code = target.read_text()
        print('Length', len(src_code))
        self.src_filepath = target
        self.src_code = src_code

    def write_result(self, out_name, data):
        """Expecting an filepath and a dictionary, convert the
        data to json and save.

            prog_classes = t.get_program_classes()
            t.write_result(out_dir/out_name, prog_classes)

        This is designed to read custom Tree object such as Coord
        """
        fp = Path(out_name)
        content = json.dumps(data, cls=ComplexEncoder, indent=4)
        return fp.write_text(content)

    def find_filepath(self):
        return self.get_tree()['info']['filename']

    def get_proxy(self):
        # A clever accessor
        return TreeGetter(self.get_tree())

    def split_file(self):
        """Useful for dev, split the file into its keys as the primary for
        each file.

            {
                content: {}
                info: {}
            }

        Each file is stored in the docs/trees/[name]/[key].json
        """
        tree = self.loaded_tree
        fp = self.tree_filepath
        # tree['info']['split_dt'] = str(dt.now())
        for key in tree:
            data = {
                "_key": key,
                'key_split_dt': str(dt.now()),
                key: tree[key],
            }

            sub_fp = (self.tree_filepath.parent / fp.stem / key).with_suffix('.json')
            if sub_fp.parent.exists() is False:
                os.makedirs(sub_fp.parent)
            sub_fp.write_text(json.dumps(data, indent=4))

    def get_comments(self):
        return self.get_tree()['comments']


class Tree(TreeLoader):

    keep_coords = True
    reports = defaultdict(int)

    def parse_all(self):
        """
        iterate and resolve all classes using the internal method resolvers.
        This is recursive.
        """
        tree = self.get_tree()
        # REturn all the classes of the program
        ast = tree['ast']
        body = ast['body']
        results = ()
        for index, node in enumerate(body):
            res = self.read_node(node, index, body, ast)
            results += (res, )
        print('ast')
        return results

    def twist_descend(self, keys, node, index, parent,ast):
        clean = self.twist_coords(node)
        return self.descend_keys(clean, keys, index, node, ast)

    def twist_descend_any(self, keys, node, index, parent, ast):
        clean = self.twist_coords(node)
        return self.descend_any(clean, keys, index, node, ast)

    def twist_coords(self, node):
        coord = Coord(node)
        # new dict without the coord keys
        node = coord.strip(node)
        # Store it down
        if self.keep_coords is True:
            node['coord'] = coord
        return node

    def del_keys(self, clean, keys):
        res = (
                ('_deleted', keys),
            )

        for key, value in clean.items():
            if key in keys:
                continue
            res += (
                    (key, value),
                )
        return dict(res)

    def descend_keys(self, clean, keys, index, node, ast):
        """
            keys = ('id', 'init',)
            clean = self.descend_keys(clean, keys, index, node, ast)

        """
        for key in keys:
            data = node[key]
            if data is None:
                # undefined value.
                clean[key] = None
                continue
            clean[key] = self.read_node(data, index, node, ast)
        return clean

    def copy_from_many(self, clean, keys, index, node, ast):
        if isinstance(keys, str):
            # woops
            keys = (keys, )
        for key in keys:
            clean[key] = self.read_node_many(clean[key], index, node, ast)
        return clean

    def descend_any(self, clean, keys, index, node, ast):
        """given keys for any sub type, check if the child is a
        dict or array, and pick the methods accordingly.
        """

        res = clean
        for key in keys:
            data = node[key]
            if isinstance(data, (list, tuple)):
                # itermany
                res = self.copy_from_many(clean, (key, ), index, node, ast)
                continue
            res = self.descend_keys(clean, (key,), index, node, ast)
        return res

    def read_node_many(self, nodes_list, index, parent, ast):
        res = ()
        # for body_node in clean_class_delaration['body']:
        for body_node in nodes_list:
            r = self.read_node(body_node, index, parent, ast)
            res += (r,)

        # clean['body'] = res
        return res

    def read_node(self, node, index, parent, ast):
        """
            node: The tree element of focus
            index: the enumerate index of this element in the parent
            parent: the node holding this node
            ast: the original tree
        """
        node_type = node['type']
        fname = f'read_node_{node_type}'
        args = (node, index, parent, ast)
        if hasattr(self, fname):
            # calls read_node_ClassDeclaration
            return getattr(self, fname)(*args)
        return self.read_node_unmapped(*args)

    # ------------------------------------------------------------

    def read_node_unmapped(self, node, index, parent, ast):
        """Called when a node.type is unknown.
        """
        _t = node['type']
        self.reports[_t] += 1
        v = self.reports[_t]
        if v <= 1:
            print('Ignoring unknown node', _t, tuple(node.keys()))
        return { 'action': 'skipped', 'type': _t}

    def read_node_ObjectExpression(self, node, index, parent, ast):
        # ('type', 'start', 'end', 'loc', 'properties')
        keys = ('properties',)
        clean = self.twist_descend_any(keys, node, index, parent, ast)
        return clean

        # clean = self.twist_coords(node)
        # clean = self.copy_from_many(clean, keys, index, node, ast)
        # clean.update(action='raw')
        # return clean

    def read_node_TemplateLiteral(self, node, index, parent, ast):
        # ('type', 'start', 'end', 'loc', 'expressions', 'quasis')
        keys = ('expressions', 'quasis')
        return self.twist_descend_any(keys, node, index, parent, ast)

        # clean = self.twist_coords(node)
        # clean = self.copy_from_many(clean, keys, index, node, ast)
        # clean.update(action='raw')
        # return clean

    def read_node_TemplateElement(self, node, index, parent, ast):
        clean = self.twist_coords(node)
        return clean

    def read_node_Property(self, node, index, parent, ast):
        # keys = ('method', 'shorthand', 'computed', 'key', 'value', 'kind')
        # clean = self.copy_from_many(clean, keys, index, node, ast)
        keys = ('key', 'value',)
        return self.twist_descend_any(keys, node, index, parent, ast)

        # clean = self.twist_coords(node)
        # clean = self.descend_keys(clean, keys, index, node, ast)
        # return clean

    def read_node_UnaryExpression(self, node, index, parent, ast):
        # ('type', 'start', 'end', 'loc', 'operator', 'prefix', 'argument')
        keys = ('argument',)
        clean = self.twist_coords(node)
        clean = self.descend_keys(clean, keys, index, node, ast)
        # clean = self.descend_keys(clean, keys, index, parent, ast)
        # clean = self.twist_descend_any(keys, node, index, parent, ast)
        # clean.update(action='raw')
        return clean

    def read_node_ArrowFunctionExpression(self, node, index, parent, ast):
        # (id', 'expression', 'generator', 'async', 'params', 'body')
        # clean = self.twist_coords(node)

        keys = ('body',)
        # clean = self.twist_descend(keys, node, index, parent, ast)
        keys_b = ('params',)
        # clean = self.copy_from_many(clean, keys_b, index, node, ast)

        clean = self.twist_descend_any(keys+keys_b, node, index, parent, ast)
        # clean.update(action='raw')
        return clean

    def read_node_PropertyDefinition(self, node, index, parent, ast):
        # ('type', 'start', 'end', 'loc', 'static', 'computed', 'key', 'value')
        keys = ('key', 'value')
        clean = self.twist_descend(keys, node, index, parent, ast)
        # clean = self.twist_coords(node)
        clean.update(action='raw')

        return clean

    def read_node_ChainExpression(self, node, index, parent, ast):
        # ('type', 'start', 'end', 'loc', 'expression')
        keys = ('expression', )
        # clean = self.twist_coords(node)
        clean = self.twist_descend(keys, node, index, parent, ast)
        # clean.update(action='raw')
        return clean

    def read_node_Super(self, node, index, parent, ast):
        # ('type', 'start', 'end', 'loc')
        keys = ()
        clean = self.twist_coords(node)
        clean.update(action='raw')
        return clean

    def read_node_ForInStatement(self, node, index, parent, ast):
        # ('type', 'start', 'end', 'loc', 'left', 'right', 'body')
        keys = ('left', 'right', 'body')

        return self.twist_descend_any(keys, node, index, parent, ast)
        # clean = self.twist_coords(node)
        # clean = self.descend_keys(clean, keys, index, node, ast)

        # clean.update(action='raw')
        return clean

    def read_node_SpreadElement(self, node, index, parent, ast):
        # ('type', 'start', 'end', 'loc', 'argument')
        keys = ('argument', )
        clean = self.twist_coords(node)
        clean.update(action='raw')
        return clean

    def read_node_ArrayExpression(self, node, index, parent, ast):
        # ('type', 'start', 'end', 'loc', 'elements')
        keys = ('elements', )
        # clean = self.twist_coords(node)
        # clean.update(action='raw')
        # return clean
        return self.twist_descend_any(keys, node, index, parent, ast)

    def read_node_ClassDeclaration(self, node, index, parent, ast):

        clean = self.twist_coords(node)
        clean.update(
            type=node['type'],
            superClass=self.clean_superClass(node),
            id=self.twist_coords(node["id"])
        )
        # if self.keep_coords:
        #     clean['coords']=Coord(node)


        # A class body has type, loc, body[]
        # class_delaration = node['body']
        # clean = self.twist_coords(class_delaration)

        # Iterate the list. Each unit is a node.
        # res = ()
        # for body_node in clean['body']:
        #     r = self.read_node(body_node, index, node, ast)
        #     res += (r,)

        # clean['body'] = res

        ## Read ClassBody (dict)
        clean['body'] = self.read_node(node['body'], index, node, ast)

        return clean

    def read_node_LogicalExpression(self, node, index, parent, ast):
        """
        keys:
            type: str
            left: dict
            operator: str
            right: dict
        """
        # keys = ()
        # clean = self.twist_descend(keys, node, index, parent, ast)
        # return clean

        keys = ('left', 'right',)
        return self.twist_descend(keys, node, index, parent, ast)

    def read_node_ConditionalExpression(self, node, index, parent, ast):
        keys = ('consequent', 'alternate', 'test')
        clean = self.twist_descend(keys, node, index, parent, ast)
        return clean

    def read_node_ExpressionStatement(self, node, index, parent, ast):
        # clean = self.twist_coords(node)
        keys = ('expression',)
        clean = self.twist_descend(keys, node, index, parent, ast)
        return clean

    def read_node_NewExpression(self, node, index, parent, ast):
        keys = ('callee',)
        clean = self.twist_descend(keys, node, index, parent, ast)
        # clean['arguments'] = self.read_node_many(clean['arguments'], index, node, ast)
        keys = ('arguments',)
        clean = self.copy_from_many(clean, keys, index, node, ast)
        # clean = self.twist_coords(node)
        return clean

    def read_node_AssignmentExpression(self, node, index, parent, ast):
        keys = ('left', 'right',)
        clean = self.twist_descend(keys, node, index, parent, ast)
        # clean = self.twist_coords(node)
        return clean

    def read_node_ClassBody(self, node, index, parent, ast):
        clean = self.twist_coords(node)
        # nodes_list = node['body']
        # clean['body'] = self.read_node_many(nodes_list, index, node, ast)
        keys = ('body', )
        clean = self.copy_from_many(clean, keys, index, node, ast)
        return clean

    def read_node_MethodDefinition(self, node, index, parent, ast):
        """

        method node:
            "type": str
            "static": bool
            "computed": bool
            "key": dict
            "kind": str
        """

        clean = self.twist_coords(node)
        clean['key'] = self.clean_method_key(node)
        clean['value'] = self.clean_method_value(node, index, parent, ast)
        # del clean['key']

        return clean

    def read_node_Identifier(self, node, index, parent, ast):
        """A Typical identifier node:

            {
                "type": "Identifier",
                "start": 8616,
                "end": 8626,
                "loc": {
                    "start": {
                        "line": 344,
                        "column": 11
                    },
                    "end": {
                        "line": 344,
                        "column": 21
                    }
                },
                "name": "otherPoint"
            },
        """
        return self.twist_coords(node)

    def read_node_AssignmentPattern(self, node, index, parent, ast):
        """
        {
            "type": "AssignmentPattern",
            coord
            "left": {
                "type": "Identifier",
                coord
                "name": "rotationMultiplier"
            },
            "right": {
                "type": "Literal",
                coord
                "value": 1,
                "raw": "1"
            }
        }
        """
        # clean = self.twist_coords(node)
        # clean['left'] = self.twist_coords(node['left'])
        # clean['right'] = self.read_node(node['right'], index, node, ast)
        # return clean
        keys = ('left', 'right',)
        # clean = self.twist_coords(node)
        # return self.descend_keys(clean, keys, index, node, ast)
        return self.twist_descend(keys, node, index, parent, ast)

    def read_node_CallExpression(self, node, index, parent, ast):
        """A more expansive expression:

            "right": {
                "type": "CallExpression",
                "callee": {
                    "type": "MemberExpression",
                    coord
                    "object": {
                        "type": "ThisExpression",
                        coord
                    },
                    "property": {
                        "type": "Identifier",
                        coord
                        "name": "magnitude"
                    },
                    "computed": false,
                    "optional": false
                },
                "arguments": [],
                "optional": false
            }
        """
        # clean = self.twist_coords(node)
        # clean['callee'] = self.read_node(node['callee'], index, node, ast)
        # return clean
        keys = ['callee']
        return self.twist_descend(keys, node, index, parent, ast)

    def read_node_MemberExpression(self, node, index,parent, ast):
        """
                "callee": {
                    "type": "MemberExpression",
                    coord
                    "object": {
                        "type": "ThisExpression",
                        coord
                    },
                    "property": {
                        "type": "Identifier",
                        coord
                        "name": "magnitude"
                    },
                    "computed": false,
                    "optional": false
                },
        """
        keys = ('object', 'property',)
        # clean['object'] = self.read_node(node['object'], index, node, ast)
        # clean['object'] = self.twist_coords(node['object'])
        # clean['property'] = self.read_node(node['property'], index, node, ast)
        # clean['property'] = self.twist_coords(node['property'])
        # return clean

        # clean = self.twist_coords(node)
        # return self.descend_keys(clean, keys, index, node, ast)
        return self.twist_descend(keys, node, index, parent, ast)

    def read_node_ThisExpression(self, node, index, parent, ast):
        clean = self.twist_coords(node)
        return clean

    def read_node_Literal(self, node, index, parent, ast):
        clean = self.twist_coords(node)
        return clean

    def read_node_CallExpression(self, node, index, parent, ast):
        clean = self.twist_coords(node)
        clean['callee'] = self.read_node(node['callee'], index, node, ast)
        res = ()
        for arg_node in clean['arguments']:
            r = self.read_node(arg_node, index, node, ast)
            res += (r,)
        clean['arguments'] = res
        return clean

    def read_node_ReturnStatement(self, node, index, parent, ast):
        # clean = self.twist_coords(node)
        # clean['argument'] = self.read_node(node['argument'], index, node, ast)
        # return clean
        keys  = ['argument']
        return self.twist_descend(keys, node, index, parent, ast)

    def read_node_BinaryExpression(self, node, index, parent, ast):
        # clean['argument'] = self.read_node(node['argument'], index, node, ast)
        # clean['left'] = self.read_node(node['left'], index, node, ast)
        # clean['right'] = self.read_node(node['right'], index, node, ast)
        # return clean
        keys = ('left', 'right',)
        # clean = self.twist_coords(node)
        # return self.descend_keys(clean, keys, index, node, ast)
        return self.twist_descend(keys, node, index, parent, ast)

    def read_node_FunctionExpression(self, node, index, parent, ast):
        # clean = self.twist_coords(node)
        # clean['body'] = self.read_node(node['body'], index, node, ast)
        keys = ['body']
        clean = self.twist_descend(keys, node, index, parent, ast)

        clean['params'] = self.clean_method_value_params(node, index, node, ast)
        # clean['argument'] = self.read_node(node['argument'], index, node, ast)
        return clean

    def read_node_VariableDeclarator(self, node, index, parent, ast):
        keys = ('id', 'init',)
        # keys = ('id',)
        clean = self.twist_coords(node)
        return self.descend_keys(clean, keys, index, node, ast)
        # return res

    def read_node_IfStatement(self, node, index, parent, ast):
        keys = ('test', 'consequent', 'alternate')
        return self.twist_descend(keys, node, index, parent, ast)
        # clean = self.twist_coords(node)
        # return self.descend_keys(clean, keys, index, node, ast)
        # return clean

    def read_node_VariableDeclaration(self, node, index, parent, ast):
        clean = self.twist_coords(node)
        res = ()
        # Iterate the list. Each unit is a node.
        # for declarations_node in node['declarations']:
        #     r = self.read_node(declarations_node, index, node, ast)
        #     res += (r,)

        # clean['declarations'] = res
        keys = ['declarations']
        self.copy_from_many(clean, keys, index, node, ast)
        return clean

    def read_node_FunctionDeclaration(self, node, index, parent, ast):
        clean = self.twist_coords(node)
        res = ()
        return clean

    def read_node_MemberExpression(self, node, index, parent, ast):
        clean = self.twist_coords(node)
        # clean['object'] = self.read_node(node['object'], index, node, ast)
        # clean['property'] = self.read_node(node['property'], index, node, ast)
        keys = ('object', 'property',)
        return self.descend_keys(clean, keys, index, node, ast)

        return clean

    def read_node_BlockStatement(self, node, index, parent, ast):
        clean = self.twist_coords(node)

        res = ()
        # Iterate the list. Each unit is a node.
        # for body_node in node['body']:
        #     r = self.read_node(body_node, index, node, ast)
        #     res += (r,)

        # clean['body'] = res

        # clean['body'] = self.read_node_many(clean['body'], index, node, ast)

        keys = ['body']
        clean = self.copy_from_many(clean, keys, index, node, ast)
        return clean

    def clean_method_value(self, node, index, parent, ast):
        """The _Value_ of a MethodDefinition such as:

            coords ...
            "id": null,
            "type": "FunctionExpression",
            "expression": false,
            "generator": false,
            "async": false,
            params: array
            body: dict
        """
        clean = self.twist_coords(node['value'])
        clean['body'] = self.read_node(clean['body'], index, node, ast)

        clean['params'] = self.clean_method_value_params(node['value'], index, node, ast)
        return clean
        # del clean['value']

    def clean_method_value_params(self, node, index, parent, ast):
        """Given a MethodDefinition node, return the params.
        """
        res = ()
        for param in node['params']:
            r = self.read_node(param, index, parent, ast)
            res += (r,)
        return res

    def clean_method_key(self, node):
        """
        the _key_ of the node:

            "key": {
                "type": "Identifier",
                "start": 655,
                "end": 656,
                "loc": {
                    "start": {
                        "line": 42,
                        "column": 8
                    },
                    "end": {
                        "line": 42,
                        "column": 9
                    }
                },
                "name": "x"
            },
        """
        return self.twist_coords(node['key'])

    def clean_superClass(self, node):
        """Given a node, read the superClass and return a clean superclass.

            'coords': <608,6663>,
            'superClass': {'end': 643,
                    'loc': {'end': {'column': 35, 'line': 40},
                            'start': {'column': 27, 'line': 40}},
                    'name': 'Relative',
                    'start': 635,
                    'type': 'Identifier'},
            'type': 'ClassDeclaration'

        return

            {'coord': <635,643>, 'name': 'Relative', 'type': 'Identifier'},

        """
        sc = node['superClass']
        if sc is None:
            # No superclass
            return None
        return self.twist_coords(sc)

        # Create the coordinates unit


class Coord:
    """Coordinates, packing the start, end, and _loc_ in a readable unit.
    """

    def __init__(self, node):
        """Immediately parse the data from the node.
        """
        self.keys = ['loc', 'start', 'end']
        if node is None:
            import pdb; pdb.set_trace()  # breakpoint 02dce2a6 //

        self.loc = node['loc']
        self.start = node['start']
        self.end = node['end']

    def as_json(self):
        #  return a thinner version of the coord
        return [self.start, self.end]
        # return vars(self)

    def as_str(self):
        loc = self.loc
        return ','.join(map(str,[self.start,
                self.end,
                loc['start']['line'],
                loc['start']['column'],
                loc['end']['line'],
                loc['end']['column'],
            ]))

    def strip(self, obj):
        res = {}
        keys = self.keys
        for key in obj:
            if key in keys:
                continue
            res[key] = obj[key]
        return res

    def __str__(self):
        return f"{self.start},{self.end}"

    def __repr__(self):
        return f"<{self.__str__()}>"

