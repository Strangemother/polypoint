# Convert a file to the imports

from pprint import pprint
from collections import defaultdict
from pathlib import Path
from html.parser import HTMLParser


class MyHTMLParser(HTMLParser):

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.open_tags = {}
        self.keep = defaultdict(tuple)

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.stash_open(tag, attrs)
        # print("Encountered a start tag:", tag)

    def stash_open(self, tag, attrs):
        self.open_tags[tag] = attrs

    def stash_close(self, tag):
        if tag in self.open_tags:
            t = self.open_tags[tag]
            # t['tag'] = tag
            self.keep[tag] += (t, )
            del self.open_tags[tag]

    def handle_endtag(self, tag):
        if tag == 'script':
            self.stash_close(tag)
        # print("Encountered an end tag :", tag)

    # def handle_data(self, data):
    #     print("Encountered some data  :", data)


def imports_list(filename, tag='script'):
    p = Path(filename)
    content = p.read_text()
    parser = MyHTMLParser()
    parser.feed(content)
    return tuple(dict(x) for x in parser.keep[tag])

