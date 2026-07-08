from django.core.management.base import BaseCommand, CommandError
import json
from pathlib import Path
from django.conf import settings
import json
from json import JSONEncoder

## Is applied in the settings.py:
# import sys
# # add the custom tool reference (will change later.)
# sys.path.append(str(POLYPOINT_TOOLS))
import theatre, theatre_process

from examples import models


class CustomEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, Path):
            return str(o)
        else:
            return json.JSONEncoder.default(self, o)


class Command(BaseCommand):
    help = "Process the theatre files into the database"

    def add_arguments(self, parser):
        parser.add_argument("dest_path", nargs='?', type=Path)

    def handle(self, *args, **options):
        process_tags = False

        items = theatre.get_theatre_list(suffix=True)
        # for each path we create a model.
        for file_item in items:
            models.TheatreFile.ensure(file_item[0], settings.POLYPOINT_THEATRE_DIR)

        if process_tags:
            tp = theatre_process.TheatreProcessor()
            res = tp.parse_theatre(settings.POLYPOINT_THEATRE_DIR)
            no_cats = res['categories']['no-category']
            if len(no_cats) > 0:
                print(f'\n == Note: {len(no_cats)} uncategorised files ==\n')


            dest_path = options['dest_path']
            if dest_path:
                s = json.dumps(res, indent=4, cls=CustomEncoder)
                Path(dest_path).write_text(s)

        self.stdout.write(self.style.SUCCESS('Done'))