from pathlib import Path
from .theatre import get_theatre_list, get_theatre_filelist, get_metadata
from collections import defaultdict


class TheatreProcessor:

    def parse_theatre(self, target):
        """Parse all the files within the target directory - assuming a
        theatre directory.
        """
        target = Path(target)
        items = get_theatre_filelist()
        l = len(items)
        records = ()
        for i, entry in enumerate(items):
            data = get_metadata(target / entry)
            print(f"{i}/{l} - ", entry)
            records += (data,)

        # All files are cross-referenced.
        cross_result = self.cross_process(records)
        return cross_result

    def cross_process(self, records):
        print('cross_process')
        store = defaultdict(dict)
        for record in records:
            """A Record:

                {'clean_files': (),
                 'filepath': WindowsPath('a-late.js'),
                 'filepath_exists': True,
                 'markdown': {'content': 'z named newest file',
                              'html': '<p>z named newest file</p>'},
                 'path': WindowsPath('C:/Users/jay/Documents/projects/polypoint/theatre/a-late.js')}
            """
            if record['filepath_exists'] is False:
                print('ignore', record['filepath'])
                continue
            self.process_entry(record, store)
        store = dict(store)
        return store

    def process_entry(self, record, store):
        """Stash and store content about the record for cross referencing,
        such as categories and tags
        """
        key = str(record['filepath'])
        self.process_categories(record, store, key)
        self.process_tags(record, store, key)
        # cross reference imported files

    def process_categories(self, record, store, key):
        """Read a record for its "category" and it stack into the
        relative store of siblings.

        Synonymous to:

            store['categories'][record.category] += record

        If no category exists within the record, apply the record to the
        'no-category' set.

        Return Nothing, but the `store['categories']` may be updated with
        """
        # stash the key into its categories
        s_cats = store['categories']

        cats = ()
        keys = ('category', 'categories', )
        # expect string, but accept many.
        for k in keys:
            r_cat = record.get(k, ())
            if len(r_cat) > 0:
                cats += tuple(r_cat)

        for cat in set(cats):
            s_cats[cat] = s_cats.get(cat, ()) + (key, )

        if len(cats) == 0:
            s_cats['no-category'] = s_cats.get('no-category', ()) + (key,)


    def process_tags(self, record, store, key):
        # stash the key into its tags
        s_tags = store['tags']

        tags = ()

        # expect list
        r_tags = record.get('tags', ())
        if len(r_tags) > 0:
            tags += tuple(r_tags)

        for tag in set(tags):
            s_tags[tag] = s_tags.get(tag, ()) + (key, )

