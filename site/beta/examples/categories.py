import re

import markdown

from .theatre import extract_theatre_header, normalize_markdown_text


UNCATEGORISED = 'uncategorised'


def category_names(metadata):
    """Combine both category keys, discarding empty and repeated names."""
    names = []
    for key in ('category', 'categories'):
        values = metadata.get(key, ())
        if isinstance(values, str):
            values = (values,)
        for value in values:
            name = value.strip()
            if name and name not in names:
                names.append(name)
    return tuple(names)


def parse_categories(path):
    """Read categories from a theatre file's leading metadata comment."""
    header = extract_theatre_header(path.read_text(encoding='utf-8'))
    header = normalize_markdown_text(header)
    # Theatre headers also use two-space continuations; Markdown requires four.
    header = re.sub(r'^[ \t]+(?=\S)', '    ', header, flags=re.MULTILINE)
    parser = markdown.Markdown(extensions=['meta'])
    parser.convert(header)
    return category_names(parser.Meta)
