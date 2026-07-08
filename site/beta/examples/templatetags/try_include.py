from pathlib import Path

from django import template
from django.template.defaultfilters import stringfilter
from django.conf import settings

from .. import theatre

register = template.Library()

# @register.simple_tag
@register.filter
@stringfilter
def template_exists(template_name):
    try:
        template.loader.get_template(template_name)
        return True
    except (template.TemplateDoesNotExist, PermissionError):
        return False


@register.inclusion_tag("examples/doc-piece-list.html")
def iter_doc_pieces(rel_regex_path, **kw):
    docs = settings.POLYPOINT_DOCS_DIR

    filepaths = tuple(docs.glob(rel_regex_path))
    if kw.get('ignore_readme', False) is True:
        filepaths = tuple(filter(lambda x: x.stem != 'readme', filepaths))

    return {
        "filepaths": filepaths,
        "kwargs": kw,
    }


@register.inclusion_tag("examples/doc-piece.html")
def get_doc_piece(rel_path, title=None):
    """Return a rendered markdown _doc piece_ from the docs.

        get_doc_piece('stage/0.md')
        <p>...</p>
    """
    rel_path = Path(rel_path)
    docs = settings.POLYPOINT_DOCS_DIR
    fp = docs / rel_path

    meta_keys = (
            ('type', 'returns'), #single key props
            (),
        )
    res = theatre.render_markdown(rel_path, docs, clean_meta=True, meta_keys=meta_keys)
    # if fp.does_not_exist()
    stem = rel_path.stem
    if title is None:
        title = stem
    res.update({
            "exists": fp.exists(),
            "filepath": rel_path,
            "parent": rel_path.parent,
            "alt_title": title,
            "prop_key": stem
        })

    # print(res.keys())
    return res