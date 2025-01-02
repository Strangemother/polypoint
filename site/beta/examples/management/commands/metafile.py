"""
Add/remove/replace file path in theatre files.

insert index PATH
    install at position
add PATH
    add a string

change r=../point_src/events.js r=../point_src/automouse.js a=mouse
"""
from django.core.management.base import BaseCommand, CommandError
from examples import theatre
import json
from pathlib import Path

class Command(BaseCommand):
    help = "Process the theatre files into a JSON info sheet."

    def add_arguments(self, parser):
        parser.add_argument("dest_path", type=Path)

    def handle(self, *args, **options):

        res = theatre.read_all()
        s = json.dumps(res, indent=4, cls=CustomEncoder)
        dest_path = options['dest_path']
        Path(dest_path).write_text(s)
        self.stdout.write(
                self.style.SUCCESS('Successful')
            )