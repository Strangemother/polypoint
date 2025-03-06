# Meta Data Extension for Python-Markdown
# =======================================

# This extension adds Meta Data handling to markdown.

# See https://Python-Markdown.github.io/extensions/meta_data
# for documentation.

# Original code Copyright 2007-2008 [Waylan Limberg](http://achinghead.com).

# All changes Copyright 2008-2014 The Python Markdown Project

# License: [BSD](https://opensource.org/licenses/bsd-license.php)

"""
This extension adds Meta Data handling to markdown.

See the [documentation](https://Python-Markdown.github.io/extensions/meta_data)
for details.
"""

from __future__ import annotations

from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor
import re
import logging
from typing import Any

log = logging.getLogger('MARKDOWN')

# Global Vars
META_RE = re.compile(r'^[ ]{0,3}(?P<key>[A-Za-z0-9_-]+):\s*(?P<value>.*)')
META_MORE_RE = re.compile(r'^[ ]{4,}(?P<value>.*)')
BEGIN_RE = re.compile(r'^-{3}(\s.*)?')
END_RE = re.compile(r'^(-{3}|\.{3})(\s.*)?')


class MetaExtension(Extension):
    """ Meta-Data extension for Python-Markdown. """

    def extendMarkdown(self, md):
        """ Add `MetaPreprocessor` to Markdown instance. """
        md.registerExtension(self)
        self.md = md
        md.preprocessors.register(MetaPreprocessor(md), 'meta', 27)

    def reset(self) -> None:
        self.md.Meta = {}


class Value(str):
    spans = None

    def __init__(self, value):
        # self.spans = spans
        self.value = value

    def __str__(self):
        return self.value

    def __repr__(self):
        return f'<span str {self.spans} "{self.__str__()}"'


class MetaPreprocessor(Preprocessor):
    """ Get Meta-Data. """

    def run(self, lines: list[str]) -> list[str]:
        """ Parse Meta-Data and store in Markdown.Meta. """
        meta: dict[str, Any] = {}
        key = None
        total = 0
        print('... Processing MetaPreprocessor.run')
        if lines and BEGIN_RE.match(lines[0]):
            v = lines.pop(0)

            total += len(v) + 1
        while lines:
            line = lines.pop(0)
            m1 = META_RE.match(line)
            if line.strip() == '' or END_RE.match(line):
                break  # blank line or end of YAML header - done
            if m1:
                key = m1.group('key').lower().strip()
                value = m1.group('value').strip()

                k = Value(key)
                k.spans = {
                    # 'all':m1.span(0),
                    'value': m1.span(1),
                    'start': total + m1.start(),
                    'end': total + m1.end(),
                }

                v = Value(value)
                v.spans = {
                    'all': m1.span(0),
                    'value':  m1.span(2),
                    'start': total + m1.start(),
                    'end': total + m1.end(),
                }

                try:
                    meta[k].append(v)
                except KeyError:
                    meta[k] = [v]
            else:
                m2 = META_MORE_RE.match(line)
                if m2 and key:
                    spans = {
                        ## Not required. This is the _line_.
                        # 'all':m2.span(0),

                        ## The discovery span, (line chars)
                        'value': m2.span(1),
                        # file chars, text_data[start:end]  == line
                        'start': total + m2.start(),
                        'end': total + m2.end(),
                    }
                    # Add another line to existing key
                    value = m2.group('value').strip()
                    v = Value(value)
                    v.spans = spans
                    meta[key].append(v)
                else:
                    lines.insert(0, line)
                    break  # no meta data - done
            total += len(line) + 1

        self.md.Meta = meta
        return lines


def makeExtension(**kwargs):  # pragma: no cover
    return MetaExtension(**kwargs)
