"""Convert a range of files into UI presentable units.

In V1 this crushes the "data-cuts" method files for a unit into a single import.
The UI will read the one file to gain all knowledge about a file.
"""

import os
import shutil
import json
from pathlib import Path

def load_json(path):
    input_file = Path(path)
    return json.loads(input_file.read_text())

from .encoder import ComplexEncoder


def save_json(path, data):
    output_file = Path(path)
    return output_file.write_text(json.dumps(data, indent=4, cls=ComplexEncoder))


from collections import defaultdict

class Convert:
    global_method_index = 0
    name_key = 'class_name'

    def flatten(self, data_cut_filepath, output_dir):
        """Convert data cuts into a single clean file
        returns a dict to be converted to JSON.
        """
        # Make a entry per item.
        # duplicate methods through inherited.
        # split in each file as _inherited_.
        """

            name: A
            inherits: B C D
            methods: A + [B C D]
              method:
                name, kind, comments, params, docs
        """

        print('Copy stack to', output_dir)

        # open cut file
        # find primary,
        # concat files until no inherits.
        data = load_json(data_cut_filepath)
        """It's tempting to dict key by the class name, however class names _can_
        be called the same, so do iteration instead.
        """
        info_path_parent = Path(data_cut_filepath).parent
        refs, cross_refs = self.flatten_items(data['items'], info_path_parent)
        return cross_refs

    def flatten_items(self, items, info_path_parent):
        # Capture the references for the file.
        refs = {}
        name_key = self.name_key
        # A dictionary to store cross reference information
        cross_refs = defaultdict(dict)
        # each 'item' is a reference to the file containing class data-cuts
        for i, item in enumerate(items):
            name = item[name_key]
            print(name, 'extends', item['inherits'])
            k = f"{i}-{name}"

            # looks like: "info_path": "Positionable/_info.json"
            rel_path = item['info_path']

            if 'local_references' not in cross_refs[name]:
                cross_refs[name]['local_references'] = ()

            cross_refs[name]['local_references'] += (k,)

            cross_refs[k][name_key] = name

            # Load the sub file of the class.
            class_cut_path = info_path_parent / rel_path
            class_reference = load_json(class_cut_path)

            for method_item in class_reference['methods']:
                # Load the sub file of the class.

                # looks like: data-cut/Tooling/_info.json
                method_info_path = method_item['filepath']
                method_filepath = class_cut_path.parent / method_info_path
                method_item_data = load_json(method_filepath)
                method_item.update(self.clean_method(method_item_data))

                # Cleanup parent of the method reference objects
                method_item.pop('filepath', None)

            #cleanup the class.
            class_reference.pop('src_file', None)
            class_reference.pop('filepath', None)

            refs[k] = class_reference

        cross_refs = dict(cross_refs)
        return refs, cross_refs

        def push_chain_methods(info, current_key, all_refs):
            """Starting from a reference, loop _forward_, pushing the
            _next_ method stack into the original stack.
            For example 'Position' inherits from 'Relative', therefore
            methods from 'Relative' are applied to Position[methods]
            """
            parent_class = info['inherits']
            name = info['class_name']
            if parent_class in cross_refs:
                # Mutate parent association.
                print(f'  "{name}" Has local')
                cross_ref = cross_refs[parent_class]
                cross_keys = cross_ref['local_references']
                for cross_key in cross_keys:
                    # add methods from this, and the inheritance chain.
                    info['methods'] += all_refs[cross_key]['methods']
            else:
                print('  x Parent not found:', parent_class)

        # perform mutative cross references.
        for k, info in refs.items():
            print('\nreferences', k, )
            push_chain_methods(info, k, refs)

        # now splice the data into separate classes
        # (this is done after cross referencing)
        for key, item in refs.items():
            convert_obj = dict(
                src_file=data['src_file'],
                **item
            )
            out_path = info_path_parent / f'{key}-info.json'
            save_json(out_path, convert_obj)
            # The filepath applied is relative to the location of the store directory.
            cross_refs[key]['info_file'] = out_path.relative_to(info_path_parent)

        stash = ()
        # Ensure the _class name_ reference within
        # is the final key name.
        # Here we're assume no classes are named the same - will change later.
        for key, content in cross_refs.items():
            if 'local_references' not in content:
                continue

            # define this as a primary reference; a Class to import
            # (not a dup-safe reference)
            content['is_primary'] = True
            stash += (key,)
            #push the local refs into the parent object. Such that class
            #names own the reference key locally.
            for ref_key in content['local_references']:
                ref_content = cross_refs[ref_key]
                # Copy the _reference_ (0-foobar, 1-foobar), into its parent
                # foobar
                content[ref_key] = ref_content
                ref_content['is_primary'] = False

        res = {
            'defined': stash,
            'src_file': data['src_file'], # relative to src
            'items': cross_refs, # relative to _this file_
        }

        # write a reference file.
        reference_filepath = info_path_parent / 'references.json'
        save_json(reference_filepath, res)

        print('Copy stack to', output_dir)

        # Finally, move this reference and its associates to a new location.
        self.copy_file_stack(reference_filepath, res, output_dir)

    def copy_file_stack(self, reference_filepath, res, output_dir):

        src_name = res['src_file'].replace('.','-')
        name = reference_filepath.name

        print('Copy stack to', output_dir)

        ref_parent = reference_filepath.parent

        alt_stem_ref_path = reference_filepath
        copy_files = set()

        cross_refs = res['items']
        # for key, reference in cross_refs.items():
        for key in res['defined']:
            class_ref = cross_refs[key] # e.g. "Point"
            # Iterate through keys within the class ref
            for local_ref_key in class_ref['local_references']:
                # e.g. "3-Point"
                reference = cross_refs[local_ref_key]
                # grab for copy
                copy_files.add(ref_parent / reference['info_file'])

        # move all files as a copy.
        #
        # If the dir exists, the copy() method will copy files.
        # If the DIR does not exist, it'll write to a file

        new_ref_filepath = reference_filepath.with_name(f'{src_name}-{name}')

        try:
            new_ref_output_filepath = output_dir / new_ref_filepath.name
        except Exception as exc:
            import pdb; pdb.set_trace()  # breakpoint 88557657x //
        print('\ncopy', reference_filepath, '\nto', new_ref_output_filepath, '\n')

        print('Out parent:', new_ref_output_filepath.parent)
        if new_ref_output_filepath.parent.exists() is False:
            os.makedirs(new_ref_output_filepath.parent)

        shutil.copyfile(reference_filepath, new_ref_output_filepath)

        dst_dir = output_dir
        if dst_dir.exists() is False:
            os.makedirs(dst_dir)


        if dst_dir.is_dir() is False:
            print('output dir required for save')
            return

        for src_file in copy_files:
            print('  Copy', src_file.absolute().as_posix())
            shutil.copy(src_file, dst_dir)

    def clean_method(self, method_item_data):
        """Given the content from a method data-cut,
        return a clean file without extra keys.

        looks like: data-cut/Tooling/_info.json
        """
        d = method_item_data
        d.pop('ast_file', None)
        d.pop('info_file', None)
        # d.pop('coord', None)
        d.pop('filepath', None)
        d['params'] = self.clean_params(d)

        self.global_method_index += 1
        d['method_index'] = self.global_method_index
        for param in (d['params'] or ()):
            # Remove the position values
            if 'coord' in param:
                param.pop('coord', None)
            # If assingmentpattern: alter.
            _type = param.get('type', 'unknown')
            if _type == 'AssignmentPattern':
                param['name'] = param['left']['name']
                right = param['right']
                if right['type'] == 'Literal':
                    param['default_value'] = right['value']
                else:
                    _name = right.get('name')
                    if _name:
                        param['default_value'] = _name

        return d

    def clean_params(self, d):
        res = ()
        params = d['params']

        if params is None:
            return None

        if isinstance(params, str):
            return [{ "name": params}]

        for param in params:
            param.pop('coord', None)
            res += (param,)
        return res


class FuncConvert(Convert):
    name_key = 'method_name'
