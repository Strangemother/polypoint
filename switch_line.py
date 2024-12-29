"""Alter the "files" within a theatre, replacing long paths with short strings

"""
import requests
import json
from pathlib import Path
import argparse
import os

def main():
    parser = argparse.ArgumentParser()
    # parser.add_argument('target')
    parser.add_argument('-a', '--add', nargs="*")
    parser.add_argument('-r', '--remove', nargs="*")
    parser.add_argument('-rf', '--remove-from')
    parser.add_argument('-i', '--input-file', type=Path, default=Path('point_src/files.json'))
    parser.add_argument('-d', '--relative-dir', default='../point_src')
    # parser.add_argument('-d', '--dry', action='store_true', default=False)
    parser.add_argument('-s', '--switch-only', action='store_true', default=False)
    # parser.add_argument('-v', '--verbose', action='store_true')  # on/off flag
    # print(args.filename, args.count, args.verbose)
    args = parser.parse_args()

    run(args)

def run(namespace):
    """
    open all files
    read 'files' meta list
    perform add remove
    save file
    """
    parent_dir = Path(__file__).parent
    theatre_dir = parent_dir / './theatre'
    target = theatre_dir.resolve().absolute()
    print(target, target.exists())

    paths = ()
    for path in target.glob('*'):
        full_path = (target / path)
        rel_path = full_path.relative_to(parent_dir.absolute())
        # print(rel_path)
        ref = {
            'full_path':full_path,
            'rel_path':rel_path,
        }

        paths += (ref, )

    remove_items = namespace.remove or ()
    relative_dir = namespace.relative_dir
    if namespace.remove_from:
        # grab names from the json
        rm = namespace.remove_from
        in_file = namespace.input_file
        if not in_file.exists():
            print('--input-file does not exist:', in_file)
            return

        also_remove = json.loads(in_file.read_text())[rm]
        print('applying removals', rm, also_remove )
        pfiles = ()
        for filename in also_remove:
            pfiles += (f'{relative_dir}/{filename}', )
        remove_items += tuple(pfiles)

    add_items = namespace.add or ()
    switch_add = namespace.switch_only
    items = ()

    print('Reading', len(paths), 'paths')
    meta_less = 0

    for po in paths:
        # get meta files list.
        unit = get_metadata(po['full_path']) or {}
        # perform changes.
        if unit['meta'] is None:
            # print('No Meta for', po['rel_path'])
            meta_less += 1
            continue

        files = unit['meta'].get('files', ())
        drops = ()
        if len(files) > 0:
            # found a file with assets
            """
            The match should occur per line
            then we do replacements.
            """
            for fp in files:
                if fp in remove_items:

                    drops += (fp, )
        else:
            print('no "files" meta.')
        # Only perform adds if removes occured.
        lv = len(drops) if switch_add is True else len(add_items) + len(drops)
        # lv = len(add_items) + len(drops)
        if lv > 0:
            # print('Work on', lv, po['rel_path'])
            po['drops'] = drops
            po['add_items'] = add_items
            po['unit'] = unit

            items += (po, )

    l = len(items)
    print('Found', l, 'files.', meta_less, 'files without meta')
    for i, rel_o in enumerate(items):
        fp = rel_o['rel_path']
        # print(fp)
        area = unit['match'].span()
        print(f"#{i+1}/{l}", fp)
        for drop in rel_o['drops']:
            # regex replace with a blank.
            # keep the last slot path as we append in place.
            print('  R', drop)
        for add in rel_o['add_items']:
            # insert lines, starting at the last slot.
            print('  A', add)
    return paths

import re
import markdown
import textwrap

def get_metadata(tf):
    content = tf.read_text()
    text_data = ''
    match = re.search(r"/\*(.*?)\*/", content, re.DOTALL)
    if match:
        # match start: match.start()
        # match end (exclusive): match.end()
        start = match.start()
        first = start == 0 or len(content[0: start].strip()) == 0
        if first:
            text_data = match.group(1)

    md = ''
    html = ''
    meta = None

    if len(text_data) > 0:
        # print(text_data)
        text_data = textwrap.dedent(text_data).strip()
        extensions=[
            # MyExtClass(),
            # 'myext',
            # 'path.to.my.ext:MyExtClass'
            'meta'
            ]
        md = markdown.Markdown(extensions=extensions)
        html = md.convert(text_data)
        meta = md.Meta

    return {
        'filepath': tf,
        'markdown':  md,
        # 'html': html
        'meta': meta,
        'match':match
    }

if __name__ == '__main__':
    main()