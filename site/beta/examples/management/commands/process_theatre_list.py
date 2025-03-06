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
    help = "Process the theatre files into a JSON info sheet."

    # def add_arguments(self, parser):
    #     parser.add_argument("dest_path", type=Path)

    def handle(self, *args, **options):
        tp = theatre_process.TheatreProcessor()
        tp.parse_theatre(settings.POLYPOINT_THEATRE_DIR)