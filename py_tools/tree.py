"""
Read the AST tree of the js files within the docs/trees.
"""
from datetime import datetime as dt
import os
from pathlib import Path
import json

from django.conf import settings

from collections import defaultdict

def run_test(**kw):
    """
    import tree
    tree.run_test(keep_coords=True)
    """
    root = Path('C:/Users/jay/Documents/projects/polypoint/')
    # tree_filepath = f"{root}/docs/trees/point-js-tree.json"
    tree_filepath = f"{root}/docs/trees/relative-xy-js-tree.json"
    src_dir = f"{root}/point_src/"
    print('Reading tree file', tree_filepath)
    # t.load_treefile()
    # t.load_file()
    # t.split_file()
    return generic_run(tree_filepath, src_dir, **kw)


def generic_run(tree_filepath, src_dir, **kw):

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

    reader = Reader(res, out_dir, comments=t.get_comments())
    reader.make_classes_methods_docfiles()
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


class Reader:

    def __init__(self, tree, output_dir, comments=None):
        self.tree = tree
        self.output_dir = output_dir
        self.comments = comments

    def make_classes_methods_docfiles(self):
        """Read the self.tree for all class definition.
        Split all methods into seperate files in 'class-cut',
        and create a 'data-cut' cheaper version for UI consuption.

            t = Tree(p, src_dir=src_dir, **kw)
            t.prepare()
            res = t.parse_all()
            t.write_result(out_p, res)
            reader = Reader(res, out_dir, comments=t.get_comments())
            reader.make_classes_methods_docfiles()

        write:
            + A dir for each class
            + a file for each method
        """
        results = self.tree#.parse_all()
        keeps = ()
        for block in results:
            if block['type'] == 'ClassDeclaration':
                keeps += (block,)

        out_dir = self.output_dir
        # now a file per class block.
        for class_block in keeps:
            class_name = class_block['id']['name']
            filename = out_dir / f"class-cut-{class_name}.json"

            content = json.dumps(class_block, cls=ComplexEncoder, indent=4)
            filename.write_text(content)

            class_body = class_block['body']
            for method_def in class_body['body']:
                self.make_method_cutfiles(method_def, class_block)

    def make_method_cutfiles(self, method_def, class_block):
        """Build the method asset for the single MethodDefinition

        this is stored within 'class-cut' and 'data-cut'for each file.
        """
        out_dir = self.output_dir

        method_name = self.get_method_name(method_def)
        params = self.get_method_params(method_def)
        comments = self.get_method_comments(method_def, block_comments=True, single_line=False)
        class_name = class_block['id']['name']
        filename = out_dir / "class-cut" / class_name / f"{method_name}.json"

        # JSON file created for this method definition
        info_file_data = dict(
                method_name=method_name,
                class_name=class_name,
                params=params,
                coord=method_def['coord'],
                ast_file="ignored", # filename,
                comments=comments,
            )

        info_file = out_dir / "data-cut" / class_name / f"{method_name}.json"

        self.save_write_json(info_file, info_file_data)
        self.save_write_json(filename, method_def)

    def get_method_comments(self, method_def, block_comments=True, single_line=True):
        """Given a method with coords, return a list of 0 to many comments
        for this method definition.

        This requires the original tree `comments`
        """
        # Splice in where
        res = ()

        coord = method_def['coord']
        # print('Coord', coord)
        start = coord.start
        end = coord.end

        for comment in self.comments:
            #Ensure the given comment is within the working range
            openStack = comment['start'] >= start and comment['end'] <= end
            if openStack:
                # Is a block, and blocks are requested
                match_block = comment['block'] == True and block_comments == True
                # is a single line, and single line is request
                match_single_line = comment['block'] == False and single_line == True
                if match_block or match_single_line:
                    # Clean up the comment to match
                    # the existing pattern.
                    _comment = comment.copy()
                    _comment['coord'] = [
                                _comment['start'],
                                _comment['end'],
                            ]

                    _comment.pop('start', None)
                    _comment.pop('end', None)

                    res += (_comment, )

            # Past the end of the applicable range.
            if comment['end'] >= end:
                break

        return res


    def get_method_params(self, method_def):
        """

        (Pdb) pp(method_def['value'])
            {'async': False,
             'body': {'body': ({'argument': {'arguments': ({'raw': "'x'",
                                                            'type': 'Literal',
                                                            'value': 'x'},
                                                           {'name': 'v',
                                                            'type': 'Identifier'}),
                                             'callee': {'computed': False,
                                                        'object': {'type': 'ThisExpression'},
                                                        'optional': False,
                                                        'property': {'name': 'setSpecial',
                                                                     'type': 'Identifier'},
                                                        'type': 'MemberExpression'},
                                             'optional': False,
                                             'type': 'CallExpression'},
                                'type': 'ReturnStatement'},),
                      'type': 'BlockStatement'},
             'expression': False,
             'generator': False,
             'id': None,
             'params': ({'name': 'v', 'type': 'Identifier'},),
             'type': 'FunctionExpression'}

        ---

            {'action': 'raw',
             'computed': False,
             'key': {'name': 'lerp', 'type': 'Identifier'},
             'static': False,
             'type': 'PropertyDefinition',
             'value': {'computed': False,
                       'object': {'type': 'ThisExpression'},
                       'optional': False,
                       'property': {'name': 'midpoint', 'type': 'Identifier'},
                       'type': 'MemberExpression'}}
        """

        value = method_def['value']
        _type = value['type']
        name = f"get_method_params_{_type}"
        print('discovering', name, )
        if hasattr(self, name):
            return getattr(self, name)(method_def)
        return self.get_method_params_unknown(method_def)

    def get_method_params_FunctionExpression(self, method_def):
        """
        value=
            {'async': False,
             'body': {'body': ({'argument': {'arguments': ({'raw': "'x'",
                                                            'type': 'Literal',
                                                            'value': 'x'},
                                                           {'name': 'v',
                                                            'type': 'Identifier'}),
                                             'callee': {'computed': False,
                                                        'object': {'type': 'ThisExpression'},
                                                        'optional': False,
                                                        'property': {'name': 'setSpecial',
                                                                     'type': 'Identifier'},
                                                        'type': 'MemberExpression'},
                                             'optional': False,
                                             'type': 'CallExpression'},
                                'type': 'ReturnStatement'},),
                      'type': 'BlockStatement'},
             'expression': False,
             'generator': False,
             'id': None,
             'params': ({'name': 'v', 'type': 'Identifier'},),
             'type': 'FunctionExpression'}

        ---

            (Pdb) pp(node)
            {'computed': False,
             'key': {'name': 'x', 'type': 'Identifier'},
             'kind': 'set',
             'static': False,
             'type': 'MethodDefinition',
             'value': {'async': False,
                       'body': {'body': ({'argument': {'arguments': ({'raw': "'x'",
                                                                      'type': 'Literal',
                                                                      'value': 'x'},
                                                                     {'name': 'v',
                                                                      'type': 'Identifier'}),
                                                       'callee': {'computed': False,
                                                                  'object': {'type': 'ThisExpression'},
                                                                  'optional': False,
                                                                  'property': {'name': 'setSpecial',
                                                                               'type': 'Identifier'},
                                                                  'type': 'MemberExpression'},
                                                       'optional': False,
                                                       'type': 'CallExpression'},
                                          'type': 'ReturnStatement'},),
                                'type': 'BlockStatement'},
                       'expression': False,
                       'generator': False,
                       'id': None,
                       'params': ({'name': 'v', 'type': 'Identifier'},),
                       'type': 'FunctionExpression'}}
        """
        value = method_def['value']
        params = value['params']
        return params

    def get_method_params_MemberExpression(self, node):
        """
            {'action': 'raw',
             'computed': False,
             'key': {'name': 'lerp', 'type': 'Identifier'},
             'static': False,
             'type': 'PropertyDefinition',
             'value': {'computed': False,
                       'object': {'type': 'ThisExpression'},
                       'optional': False,
                       'property': {'name': 'midpoint', 'type': 'Identifier'},
                       'type': 'MemberExpression'}}
        """
        return node['key']['name']

    def get_method_params_PropertyDefinition(self, node):
        """
        (Pdb) pp(node)
        {'action': 'raw',
         'computed': False,
         'key': {'name': 'UP', 'type': 'Identifier'},
         'static': False,
         'type': 'PropertyDefinition',
         'value': {'name': 'UP_DEG', 'type': 'Identifier'}}
        """
        return node['key']['name']

    def get_method_params_Identifier(self, method_def):
        return method_def['key']['name']

    def get_method_params_unknown(self, method_def):
        print('unknown value def for params...', method_def['type'])
        import pdb; pdb.set_trace()  # breakpoint 46e927f8 //

    def save_write_json(self, filename, content):
        if filename.parent.exists() is False:
            os.makedirs(filename.parent)

        t_content = json.dumps(content, cls=ComplexEncoder, indent=4)
        filename.write_text(t_content)

    def get_method_name(self, method_def):
        _type = method_def['key']['type']
        name = f"method_definition_key_{_type}"
        if hasattr(self, name):
            return getattr(self, name)(method_def)

        return self.method_definition_key_unknown(method_def)

    def method_definition_key_unknown(self, method_def):
        print('Not found', name)
        import pdb; pdb.set_trace()  # breakpoint d8418351 //

    # def method_definition_key_MethodDefinition(self, method_def):
    def method_definition_key_Identifier(self, method_def):
        """
        (Pdb) pp(method_def)
        {'computed': False,
         'key': {'name': 'x', 'type': 'Identifier'},
         'kind': 'set',
         'static': False,
         'type': 'MethodDefinition',
         'value': {'async': False,
                   'body': {'body': ({'argument': {'arguments': ({'raw': "'x'",
                                                                  'type': 'Literal',
                                                                  'value': 'x'},
                                                                 {'name': 'v',
                                                                  'type': 'Identifier'}),
                                                   'callee': {'computed': False,
                                                              'object': {'type': 'ThisExpression'},
                                                              'optional': False,
                                                              'property': {'name': 'setSpecial',
                                                                           'type': 'Identifier'},
                                                              'type': 'MemberExpression'},
                                                   'optional': False,
                                                   'type': 'CallExpression'},
                                      'type': 'ReturnStatement'},),
                            'type': 'BlockStatement'},
                   'expression': False,
                   'generator': False,
                   'id': None,
                   'params': ({'name': 'v', 'type': 'Identifier'},),
                   'type': 'FunctionExpression'}}
        """
        return method_def['key']['name']

    def method_definition_key_Literal(self, method_def):
        #  {'type': 'Literal', 'value': 0, 'raw': '0'}
        return method_def['key']['raw']

    def method_definition_key_MemberExpression(self, method_def):

        """
            {'computed': False,
             'object': {'name': 'Symbol',
                        'type': 'Identifier'},
             'optional': False,
             'property': {'name': 'toStringTag',
                          'type': 'Identifier'},
             'type': 'MemberExpression'}

        for JS:

            get [Symbol.toStringTag]() {
                return this.toString()
            }
        """

        kd = method_def['key']
        return f"{kd['object']['name']}.{kd['property']['name']}"


class TreeGetter:
    def __init__(self, data):
        self._data = data

    def __getattr__(self, key):
        return self._data[key]


import json
class ComplexEncoder(json.JSONEncoder):
    # json.dumps(cls=ComplexEncoder)
    def default(self, obj):
        if hasattr(obj, 'as_json'):
            return obj.as_json()

        if isinstance(obj, Path):
            return str(obj.as_posix())

        if isinstance(obj, Coord):
            return vars(obj)
        # Let the base class default method raise the TypeError
        return super().default(obj)


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
            return False

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