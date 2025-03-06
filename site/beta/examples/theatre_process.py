from pathlib import Path
from .theatre import get_theatre_list, get_theatre_filelist, get_metadata


class TheatreProcessor:

    def parse_theatre(self, target):
        target = Path(target)
        items = get_theatre_filelist()
        l = len(items)
        records = ()
        for i, entry in enumerate(items):
            data = get_metadata(target / entry)
            print(f"{i}/{l} - ", entry)
            records += (data,)
        self.cross_process(records)

    def cross_process(self, records):
        print('cross_process')
        store = {}
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

    def process_entry(self, record, store):
        import pdb; pdb.set_trace()  # breakpoint a8fba470 //
