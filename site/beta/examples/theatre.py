"""Functions to read theatre files.
"""
from pprint import pprint as pp
from operator import itemgetter
from pathlib import Path
import markdown
import textwrap
import re
import os
import json


import settings

# Import from special py_tools space (will change later)
# from tree import generic_run

from datetime import datetime

def store_tree(filename, tree_data):
    """ Called by the editor.TreeStorePostView to record a JSON POST
    of the AST.

        tree_result = theatre.store_tree(filename, json_content)

    The `tree_data` is `dict` converted from JSON and os stored into the
    docs/trees/ directory.
    """
    root_path = settings.POLYPOINT_DOCS_DIR / "trees"
    f = Path(filename)
    csuf = f.suffix[1:]
    save_path = root_path / f.parent / f'{f.stem}-{csuf}-tree.json'
    tree_data['info'] = {
        'filename': filename,
        'store_dt': str(datetime.now()),
    }

    s = json.dumps(tree_data, indent=4)

    if save_path.parent.exists() is False:
        os.makedirs(save_path.parent)
    save_path.write_text(s)

    # generic_run(save_path,
    #         filepath=filename,
    #         src_dir=Path(settings.POLYPOINT_SRC_DIR),
    #         output_dir=Path(settings.POLYPOINT_DOCS_DIR) / 'trees/clean/')

    # Then lets use a tree.
    # tree = Tree(save_path, src_dir=Path(settings.POLYPOINT_SRC_DIR))

    # tree.prepare()
    # res = tree.parse_all()
    # reader = Reader(res, out_dir, comments=tree.get_comments())
    return {
        'save_path': save_path,
        'exists': save_path.exists(),
    }


def get_theatre_filelist(relative=True):
    """Return filepaths, rather than a list of assets.
    """
    parent = settings.POLYPOINT_THEATRE_DIR
    tpath = Path(parent)
    res = ()
    for asset in tpath.iterdir():
        if asset.is_file():
            nn = asset
            if relative:
                nn = asset.relative_to(tpath)
            res += ( str(nn), )

    return tuple(res)


def get_theatre_list(**kw):
    # get all files in the theatre dir
    # parent = settings.POLYPOINT_THEATRE_DIR
    # parent = settings.POLYPOINT_EXAMPLES_DIR
    parent = settings.POLYPOINT_THEATRE_DIR

    reverse = kw.get('reverse', True)
    order_by = kw.get('orderby', None)
    default_order_index = 1
    order_named = {
        'name': 0,
        'modified': 1,
        'created': 2,
    }

    order_index = order_named.get(order_by, default_order_index)
    print('Ordering', order_index, order_by)
    tpath = Path(parent)
    res = ()
    for asset in tpath.iterdir():
        if asset.is_file():
            modified = asset.stat().st_mtime
            created = asset.stat().st_ctime
            # get date
            nn = asset.relative_to(tpath).with_suffix('')

            res += (
                    (str(nn), modified, created,),
                )

    res = sorted(res, key=itemgetter(order_index))
    if reverse:
        res = reversed(res)
    return tuple(res)


def render_markdown(path, parent, clean_meta=False, meta_keys=None):
    theatre_file = (parent / path)
    text_data = theatre_file.read_text()

    md = ''
    html = ''
    meta = None

    if len(text_data) > 0:
        # print(text_data)
        # text_data = textwrap.dedent(text_data).strip()
        extensions=[
            # MyExtClass(),
            # 'myext',
            # 'path.to.my.ext:MyExtClass'
            'meta',
            'extra',
            ]
        md = markdown.Markdown(extensions=extensions)
        html = md.convert(text_data)
        meta = md.Meta
        if clean_meta:
            meta = clean_file_meta(meta, meta_keys=meta_keys)


    res = file_default_meta(path, meta)
    res['filepath_exists'] = True
    res['path'] = path
    res['filepath'] = theatre_file.relative_to(parent)

    res['markdown'] = {
        "html": html,
        "content": text_data,
    }

    return res


def get_metadata(path, parent=None, meta_keys=None, ensure_suffix='.js', rel_prefix=None):
    """Attempt to parse the theatre file and other config locations
    to apply _metadata_ about the theatre file to the context.

    This information is the extended data for a theatre file, such as
    a description, tags, and optionally, imports.

    This is parsed from the head of the target file (js comment),
    converted through markdown.
    """
    parent = parent or settings.POLYPOINT_THEATRE_DIR
    theatre_file = (parent / path)

    if ensure_suffix:
        theatre_file = theatre_file.with_suffix(ensure_suffix)

    if not theatre_file.exists():
        print('File does not exist:', theatre_file)
        print('Given path:', path)
        res = file_default_meta(path, meta_keys=meta_keys)
        res['path'] = path
        res['filepath'] = theatre_file.relative_to(parent)
        res['filepath_exists'] = False
        return res

    tf = theatre_file
    # extract the first comment and convert to markdown.
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
            'meta',
            # 'examples.meta2:MetaExtension'
            ]
        md = markdown.Markdown(extensions=extensions)
        html = md.convert(text_data)
        meta = md.Meta

    res = file_default_meta(path, meta, meta_keys=meta_keys)
    res['filepath_exists'] = True
    res['path'] = path
    res['filepath'] = theatre_file.relative_to(parent)
    # res['clean_files'] = destack_file_dependencies(clean_files_list(res))
    res['clean_files'] = clean_files_list(res)
    res['markdown'] = {
        "html": html,
        "content": text_data,
    }

    return res


def destack_file_dependencies(filepaths):
    for filepath in filepaths:
        # check file,
        # if has header install header
        #   # if the dependency has an dependency, stack above.
        pass
    return clean_file_meta


def clean_files_list(metadata=None, deep_include=True, files=None, rel_prefix=None):
    """Generate a clean file list given the meta data of the target.

        with deep_include=true (default), each file is tested for its own
        imports, and slots them into the result:

            metadata= { "files", ('point.js', )}
            clean_files_list(metadata)

        return:

            ../point_src/relative-xy.js
            ../point_src/pointcast.js
            ../point_src/point.js

        Without deep, the imports are not included:

            clean_files_list(metadata, deep=False)

            ../point_src/point.js

        ---

        Imports are special names from the `files.json`:

            res = clean_files_list(context['metadata'], files=('point',))

            pointpen.js      |
            point-content.js |-- 'point' reference from json
            pointdraw.js     |

            relative-xy.js   |__ From point.js headers
            pointcast.js     |

            point.js         |-- target import

        ---

            res = file_default_meta(path, meta, meta_keys=meta_keys)
            res['clean_files'] = clean_files_list(res)

        --

            res = theatre.clean_files_list(context['metadata'], files=('point',))

            ../point_src/pointpen.js
            ../point_src/point-content.js
            ../point_src/pointdraw.js
            ../point_src/relative-xy.js
            ../point_src/pointcast.js
            ../point_src/point.js

        ---

        Alter the relative prefix of each file:

            res = theatre.clean_files_list(context['metadata'],
                                        files=names, rel_prefix='')

            pointpen.js
            point-content.js
            pointdraw.js
            relative-xy.js
            pointcast.js
            point.js

        This can be applied to a static link. E.g a Trim link:

            {% load link %}

            {% link.url 'examples:point_src' item '_' %}
            /examples/point_src/point.js

    """
    src_dir = settings.POLYPOINT_SRC_DIR
    files_path = src_dir / 'files.json'
    file_ref = json.loads(files_path.read_text())
    if files is None:
        files = metadata.get('files', ())
    # print('clean_files_list', files)

    rel_src_dir = rel_prefix
    if rel_prefix is None:
        rel_src_dir = metadata.get('rel_src_dir', None)
    if rel_src_dir is not None:
        if isinstance(rel_src_dir, (tuple, list)):
            rel_src_dir = rel_src_dir[0]

    if rel_src_dir is None:
        # the src dir is a relative path
        # to the server call.
        rel_src_dir = settings.POLYPOINT_THEATRE_SRC_RELATIVE_PATH

    # replace specials from the files packs.
    # ensure set()
    res = ()
    for leaf in files:
        item_list = file_ref.get(leaf)
        if item_list is None:
            # A string or relative filepath (non-object reference)
            # foo: undefined
            lsw = leaf.startswith
            if (lsw('/*') or lsw('#') or lsw('// ') ):
                # skip commented.
                continue
            res += (leaf, )
            continue
        if isinstance(item_list, str):
            # discovered item is a string
            # foo: "bar.js"
            res += (item_list, )
            continue
        # An object to iterate.
        # foo: [bar, baz]
        res += flatten_leaf(leaf, file_ref, rel_src_dir)
        # Merge the sub list
        # for item in item_list:

    # finally, clean dup file imports.
    res = tuple({x:0 for x in res}.keys())

    if deep_include is False:
        return res

    # print('deep include on res', files, res)
    # unpack each file head and slice in imports.
    parent_src_dir = settings.POLYPOINT_SRC_DIR
    relative_src_dir = rel_src_dir
    if rel_src_dir is None:
        relative_src_dir = settings.POLYPOINT_THEATRE_SRC_RELATIVE_PATH
    restacked = ()
    for path in res:
        if len(path) == 0:
            # Guard against blank paths, sometimes
            # give from dirty list entries in markdown (YAML) headers
            continue
        fp = parent_src_dir / path
        if fp.exists() is False:
            print('x Ignore sub file', path)
            restacked += (path,)
            continue

        # Can be checked.
        ## print('- Reading', path)
        mets = get_metadata(path, parent=parent_src_dir, rel_prefix=rel_prefix)#, meta_keys=None, ensure_suffix='.js')
        files = mets['clean_files']

        if len(files) == 0:
            ## print('  No Inner files; Ignoring')
            restacked += (path,)
            continue


        ## print('  Found', files)

        # Re-relative the inner path, to
        # a path matching the relative
        rel_paths = ()
        for subfile in files:
            p = f"{relative_src_dir}{subfile}"
            rel_paths += (p,)
        # parent_src_dir / foo.js
        restacked += rel_paths + (path,)

    restacked = tuple({x:0 for x in restacked}.keys())
    return restacked


def flatten_leaf(leaf, file_ref, src_dir=None):
    """Given a leaf and reference dictionary, return a list of
    files for the leaf entry. This Any name leaf within the reference is
    applied to the list.


        file_ref = {
            leaf: [
                filepath.js
                other
            ]
            other: [
                a.js
                b.js
            ]
        }

        file_ref[leaf] == [
            filepath.js
            a.js
            b.js
        ]
    """
    res = ()
    items = file_ref[leaf]
    src_dir = src_dir or ''
    if isinstance(items, str):
        return (f"{src_dir}{items}",)
    for item in items:
        if item in file_ref:
            res += flatten_leaf(item, file_ref, src_dir)
            continue
        res += (f"{src_dir}{item}",)

    # set() is disordered. This is an ordered set.
    return tuple({x:0 for x in res}.keys())


def file_default_meta(path, raw_meta=None, meta_keys=None):
    """Return the meta object, The given meta object is cleaned when applied.
    """
    meta = {}
    if raw_meta:
        meta = clean_file_meta(raw_meta, meta_keys=meta_keys)
    return meta


def clean_file_meta(raw_meta, meta_keys=None):
    # proprties of which expect one entity; others are discarded.

    one_props, multi_props = None, None

    if meta_keys is not None:
        one_props, multi_props = meta_keys

    one_string_props = one_props or (
            'title',
            #'layout',
            #'bunny',
        )

    # Propeties expecting a list
    many_string_props = multi_props or (
            # 'tags',
            #'related',
            'imports',
            'files',
        )

    def one(name):
        return (raw_meta.get(name, [None]) or [None])[0]

    def many(name):
        items = raw_meta.get(name, [])
        return tuple(filter(None, items))

    res = {}
    missed = ()

    for name in one_string_props:
        value = one(name)
        if value is not None:
            res[name] = value
            continue
        missed += (name, )

    for name in many_string_props:
        value = many(name)
        if value is not None:
            res[name] = value
            continue
        missed += (name, )

    meta_keys = set(raw_meta.keys())
    res_keys = set(res.keys())
    # detect unused
    # unused = res_keys - meta_keys
    # detect unknown - should include pubslished
    unknown = meta_keys - res_keys
    res['unused_keys'] = missed
    res['unknown_keys'] = tuple(filter(None, unknown))

    for key in unknown:
        res[key] = raw_meta[key]

    return res


def read_all():
    """Read all the _example_ (theatre) files
    """
    # parent = settings.POLYPOINT_THEATRE_DIR
    # parent = settings.POLYPOINT_EXAMPLES_DIR
    parent = settings.POLYPOINT_SRC_DIR
    # parent = settings.POLYPOINT_THEATRE_DIR
    tpath = Path(parent)
    res = ()
    for asset in tpath.iterdir():
        if asset.is_file():
            # modified = asset.stat().st_mtime
            nn = asset.relative_to(tpath)
            item = read_resolve(nn, parent)
            item['markdown'] = None
            res += (item,)

    print('Read', len(res), 'items')
    return res


def read_resolve(rel_path, parent_path):
    """Expecting a formatted file, read the meta data and return an object.
    """
    fmeta = get_metadata(rel_path, parent=parent_path, meta_keys=None, ensure_suffix=None)
    return fmeta
