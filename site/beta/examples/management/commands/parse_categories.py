from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from examples.categories import UNCATEGORISED, parse_categories
from examples.models import TheatreFile, TheatreFileCategory, crc


class Command(BaseCommand):
    help = (
        'Import theatre categories and synchronise file memberships. '
        'With no files, process every theatre JavaScript file.'
    )

    def add_arguments(self, parser):
        parser.add_argument('files', nargs='*', help='Theatre filenames or paths.')

    def resolve_file(self, filename, root):
        path = Path(filename)
        if not path.suffix:
            path = path.with_suffix('.js')
        target = (root / path).resolve()
        if not target.exists() and path.exists():
            target = path.resolve()
        try:
            relative_path = target.relative_to(root)
        except ValueError as exc:
            raise CommandError(f'File is outside the theatre directory: {filename}') from exc
        if target.suffix != '.js' or not target.is_file():
            raise CommandError(f'Not a theatre JavaScript file: {filename}')
        return relative_path.as_posix(), target

    def handle(self, *args, **options):
        root = Path(settings.POLYPOINT_THEATRE_DIR).resolve()
        if not root.is_dir():
            raise CommandError(f'Theatre directory does not exist: {root}')
        filenames = options['files'] or sorted(root.glob('*.js'))
        records = {}
        for filename in filenames:
            filepath, path = self.resolve_file(filename, root)
            if filepath in records:
                continue
            try:
                names = parse_categories(path) or (UNCATEGORISED,)
                checksum = crc(path)
            except (OSError, UnicodeError) as exc:
                raise CommandError(f'Unable to read {filepath}: {exc}') from exc
            max_length = TheatreFileCategory._meta.get_field('name').max_length
            for name in names:
                if len(name) > max_length:
                    raise CommandError(f'Category name exceeds {max_length} characters in {filepath}: {name}')
            records[filepath] = (path, names, checksum)

        created_files = 0
        created_categories = 0
        with transaction.atomic():
            for filepath, (path, names, checksum) in records.items():
                theatre_file, created = TheatreFile.objects.get_or_create(
                    filepath=filepath,
                    defaults={'name': path.stem, 'crc': checksum},
                )
                created_files += int(created)
                categories = []
                for name in names:
                    category, created = TheatreFileCategory.objects.get_or_create(name=name)
                    created_categories += int(created)
                    categories.append(category)
                theatre_file.theatrefilecategory_set.set(categories)

        self.stdout.write(self.style.SUCCESS(
            f'Processed {len(records)} file(s); created {created_files} file(s) '
            f'and {created_categories} category/categories. Memberships synchronised.'
        ))
