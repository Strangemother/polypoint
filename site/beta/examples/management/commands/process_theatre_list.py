from django.core.management.base import BaseCommand, CommandError
from examples import theatre, theatre_process
import json
from pathlib import Path
from django.conf import settings
import json
from json import JSONEncoder

class CustomEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, Path):
            return str(o)
        else:
            return json.JSONEncoder.default(self, o)

class Command(BaseCommand):
    help = "Process the theatre files into a JSON file"

    def add_arguments(self, parser):
        parser.add_argument("dest_path", type=Path)

    def handle(self, *args, **options):
        tp = theatre_process.TheatreProcessor()
        res = tp.parse_theatre(settings.POLYPOINT_THEATRE_DIR)

        no_cats = res['categories']['no-category']
        if len(no_cats) > 0:
            print(f'\n == Note: {len(no_cats)} uncategorised files ==\n')

        s = json.dumps(res, indent=4, cls=CustomEncoder)
        dest_path = options['dest_path']
        Path(dest_path).write_text(s)
        self.stdout.write(self.style.SUCCESS('Successful'))