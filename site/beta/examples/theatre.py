"""Functions to read theatre files.
"""
from pprint import pprint as pp
from operator import itemgetter
from pathlib import Path
import markdown
import textwrap
import re

from django.conf import settings


def get_theatre_list(**kw):
    # get all files in the theatre dir
    # parent = settings.POLYPOINT_THEATRE_DIR
    # parent = settings.POLYPOINT_EXAMPLES_DIR
    parent = settings.POLYPOINT_THEATRE_DIR

    tpath = Path(parent)
    res = ()
    for asset in tpath.iterdir():
        if asset.is_file():
            modified = asset.stat().st_mtime
            # get date
            nn = asset.relative_to(tpath).with_suffix('')

            res += (
                    (str(nn), modified,),
                )

    res = reversed(sorted(res, key=itemgetter(1)))
    return tuple(res)


def get_metadata(path, parent=None):
    """Attempt to parse the theatre file and other config locations
    to apply _metadata_ about the theatre file to the context.

    This information is the extended data for a theatre file, such as
    a description, tags, and optionally, imports.

    This is parsed from the head of the target file (js comment),
    converted through markdown.
    """
    parent = parent or settings.POLYPOINT_THEATRE_DIR
    theatre_file = (parent / path).with_suffix('.js')

    if not theatre_file.exists():
        print('File does not exist:', theatre_file)
        print('Given path:', path)
        res = file_default_meta(path)
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
            'meta'
            ]
        md = markdown.Markdown(extensions=extensions)
        html = md.convert(text_data)
        meta = md.Meta

    res = file_default_meta(path, meta)
    res['filepath_exists'] = True
    res['path'] = path
    res['filepath'] = theatre_file.relative_to(parent)

    res['markdown'] = {
        "html": html,
        "content": text_data,
    }

    return res


def file_default_meta(path, raw_meta=None):
    """Return the meta object, The given meta object is cleaned when applied.
    """
    meta = {}
    if raw_meta:
        meta = clean_file_meta(raw_meta)
    return meta


def clean_file_meta(raw_meta):
    # proprties of which expect one entity; others are discarded.
    one_string_props = (
            'title',
            #'layout',
            #'bunny',
        )

    # Propeties expecting a list
    many_string_props = (
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


