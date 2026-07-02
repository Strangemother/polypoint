from django.core.management.base import BaseCommand

from examples import models


class Command(BaseCommand):
    help = 'Clear still_image_path for TheatreFile rows so screenshots can be regenerated.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Report how many rows would be updated without writing changes.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        queryset = models.TheatreFile.objects.exclude(still_image_path__isnull=True).exclude(
            still_image_path=''
        )
        to_clear = queryset.count()
        total = models.TheatreFile.objects.count()

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'DRY RUN: would clear still_image_path on {to_clear} of {total} TheatreFile rows.'
                )
            )
            return

        cleared = queryset.update(still_image_path=None)
        self.stdout.write(
            self.style.SUCCESS(
                f'Cleared still_image_path on {cleared} of {total} TheatreFile rows.'
            )
        )