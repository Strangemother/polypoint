"""
Read the AST tree of the js files within the docs/trees.
"""
from datetime import datetime as dt
import os
from pathlib import Path
import json
import inspect

import markdown

from .encoder import ComplexEncoder

class Reader:

    def __init__(self, tree, output_dir, filepath=None, comments=None):
        self.tree = tree
        self.output_dir = output_dir
        self.comments = comments
        self.filepath = filepath
        self._md = None

    def make_functions_docfiles(self):
        results = self.tree#.parse_all()
        keeps = ()
        for block in results:
            if block['type'] == 'FunctionDeclaration':
                keeps += (block,)

        out_dir = self.output_dir
        # now a file per class block.
        cuts = ()
        for method_def in keeps:
            func_name = method_def['id']['name']
            filename = out_dir / f"function-cut-{func_name}.json"
            self.safe_save_json(method_def, filename)

            kind = method_def.get('kind', None)
            method_name = self.get_function_name(method_def)
            params = method_def['params']
            raw_comments = self.get_method_comments(method_def, block_comments=True, single_line=False)
            comments = self.convert_comments(raw_comments)

            method_def.update(
                kind='function',
                method_name=method_name,
                params=params,
                raw_comments=raw_comments,
                comments=comments,
            )
            filename = out_dir / "func-cut" / f"props/{method_name}.json"
            self.save_write_json(filename, method_def)

            _kind = 'function'
            info_file = out_dir / "data-cut"  / f"func/{method_name}-{_kind}.json"

            info_file_data = dict(
                method_name=method_name,
                # class_name=class_name,
                kind=kind,
                params=params,
                coord=method_def['coord'],
                ast_file="ignored", # filename,
                comments=comments,
                info_file=info_file,
                # info_file_data=info_file_data,
            )

            self.save_write_json(info_file, info_file_data)

    def make_classes_methods_docfiles(self):
        """Read the self.tree for all class definition.
        Split all methods into seperate files in 'class-cut',
        and create a 'data-cut' cheaper version for UI consuption.

            t = Tree(ast_filepath, src_dir=src_dir, **kw)
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
        cuts = ()
        for class_block in keeps:
            class_name = class_block['id']['name']
            filename = out_dir / f"class-cut-{class_name}.json"

            self.safe_save_json(class_block, filename)

            require_class_comment = True

            methods = ()
            class_body = class_block['body']
            for method_def in class_body['body']:
                mr = self.make_method_cutfiles(method_def, class_block)
                methods  += (mr, )
                # After the first method, we have a range to cut the class comment
                if require_class_comment is False:
                    continue

                raw_comments = self.get_class_comments(class_block, end=method_def['coord'].start,
                                block_comments=True, single_line=False)
                comments = self.convert_comments(raw_comments)
                class_block['comments'] = comments
                require_class_comment = False

            # Now buildout the information for the class.
            cuts += (self.make_class_cutfile(class_block, methods), )
        # Build a global cut file for all these assets.
        return self.make_file_cutfile(cuts)

    def safe_save_json(self, data, filename):
        ## Store it down
        content = json.dumps(data, cls=ComplexEncoder, indent=4)
        filename.write_text(content)

    def make_file_cutfile(self, cuts):
        """_cuts_ are the result from the class_cutfile iteration.
        Merge into one file for referencing. Later we'll cross reference all the data.
        """
        cut_results = ()

        out_dir = self.output_dir
        store_dir = out_dir / "data-cut"
        filename = store_dir / f"_info.json"

        for cut in cuts:
            r = cut.copy()
            r.pop('methods', None)
            r['info_path'] = r['filepath'].relative_to(store_dir)
            r.pop('filepath', None)
            cut_results += (r,)


        res = dict(
                src_file=self.filepath,
                filepath=filename, #.relative_to(store_dir),
                items=cut_results,
            )
        ## Store it down
        content = json.dumps(res, cls=ComplexEncoder, indent=4)
        filename.write_text(content)
        return res

    def make_class_cutfile(self, class_block, methods):
        """Create a file representing the given class (one of many within one
        file) and the recently created method cutfiles. Store this with the
        class-cut data.
        """
        out_dir = self.output_dir
        class_name = class_block['id']['name']

        store_dir = out_dir / "data-cut" / class_name
        filename = store_dir / f"_info.json"

        super_class = None
        sc_block = class_block['superClass']
        if sc_block is not None:
            super_class = sc_block['name']

        method_infos = ()
        # method => method file list
        for method in methods:
            info_file = method['info_file'].relative_to(store_dir)
            inf = dict(
                    method_name=method['method_name'],
                    filepath=info_file,
                )

            method_infos += (inf, )

        comments = class_block['comments']

        # inheritence association of a class.
        info = dict(
                inherits=super_class,
                class_name=class_name,
                src_file=self.filepath,
                filepath=filename,
                comments=comments,
                methods=method_infos,

            )
        ## Store it down
        content = json.dumps(info, cls=ComplexEncoder, indent=4)
        filename.write_text(content)
        return info

    def convert_comments(self, raw_comments):
        """Given a list of raw comments, return a list of _formatted_ comments
        """
        for comment in raw_comments:
            md = self.get_markdown_object()
            # remove indenting.
            clean_text = inspect.cleandoc(comment['text'])
            comment['html'] = md.convert(clean_text)

        return raw_comments

    def get_markdown_object(self):
        if self._md is None:
            self._md = markdown.Markdown(extensions=['meta', 'extra'])
        return self._md

    def make_docfiles(self):
        cut_result = self.make_classes_methods_docfiles()
        cut_result2 = self.make_functions_docfiles()
        return cut_result

    def make_method_cutfiles(self, method_def, class_block):
        """Build the method asset for the single MethodDefinition

        this is stored within 'class-cut' and 'data-cut'for each file.
        """
        out_dir = self.output_dir

        kind = method_def.get('kind', None)
        method_name = self.get_method_name(method_def)
        params = self.get_method_params(method_def)
        raw_comments = self.get_method_comments(method_def, block_comments=True, single_line=False)
        comments = self.convert_comments(raw_comments)

        class_name = class_block['id']['name']
        filename = out_dir / "class-cut" / class_name / f"props/{method_name}.json"
        print('Reading method: ', kind, ' - ', method_name)
        # JSON file created for this method definition
        _kind = '' if kind is None else f'-{kind}'
        info_file = out_dir / "data-cut" / class_name / f"props/{method_name}{_kind}.json"

        info_file_data = dict(
                method_name=method_name,
                class_name=class_name,
                kind=kind,
                params=params,
                coord=method_def['coord'],
                ast_file="ignored", # filename,
                comments=comments,
                info_file=info_file,
                # info_file_data=info_file_data,
            )

        self.save_write_json(info_file, info_file_data)
        self.save_write_json(filename, method_def)
        return info_file_data

    def get_class_comments(self, class_block, end=None, block_comments=True, single_line=True):
        res = ()

        coord = class_block['coord']
        # print('Coord', coord)
        start = coord.start

        class_end = coord.end # encompasses all src in the class.
        end = class_end if end is None else end

        for comment in self.comments:
            #Ensure the given comment is within the working range
            openStack = comment['start'] >= start and comment['end'] <= end
            # Is a block, and blocks are requested
            match_block = comment['block'] == True and block_comments == True
            # is a single line, and single line is request
            match_single_line = comment['block'] == False and single_line == True
            if match_block or match_single_line:
                if openStack:
                    res += (comment, )
            # Past the end of the applicable range.
            if comment['end'] >= end:
                break
        return res

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
            pp(method_def['value'])
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

        value = method_def.get('value', None) or None
        _type = (value or {}).get('type', None)
        name = f"get_method_params_{_type}"
        # print('discovering', name, )
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
        # kind = method_def['key'].get('kind', '')
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


    def get_function_name(self, function_def):
        _type = function_def['id']['type']
        name = f"function_definition_key_{_type}"
        if hasattr(self, name):
            return getattr(self, name)(function_def)

        return self.method_definition_key_unknown(function_def)

    def method_definition_key_unknown(self, method_def):
        print('Not found')
        import pdb; pdb.set_trace()  # breakpoint d8418351 //

    # def method_definition_key_MethodDefinition(self, method_def):
    def function_definition_key_Identifier(self, function_def):
        return function_def['id']['name']

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


