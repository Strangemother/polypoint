import requests
from django.core.management.base import BaseCommand
from django.db.models import Q

from examples import models
from examples.llm_descriptions import (
    LMSTUDIO_ENDPOINT,
    extract_message,
    request_description_response,
)


class Command(BaseCommand):
    help = 'Fill missing TheatreFile descriptions using LM Studio.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--endpoint',
            default=LMSTUDIO_ENDPOINT,
            help='LM Studio /v1/chat/completions endpoint.',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=0,
            help='Optional limit of files to process.',
        )

    def handle(self, *args, **options):
        endpoint = options['endpoint']
        limit = options['limit']

        queryset = models.TheatreFile.objects.filter(
            Q(description__isnull=True) | Q(description='')
        ).order_by('id')

        if limit and limit > 0:
            queryset = queryset[:limit]

        total = queryset.count()
        if total == 0:
            self.stdout.write(self.style.SUCCESS('No missing descriptions.'))
            return

        self.stdout.write(
            f'Processing {total} file(s) with missing descriptions...'
        )
        self.stdout.write(f'Endpoint: {endpoint}')

        updated = 0
        errors = 0

        for index, tfm in enumerate(queryset, start=1):
            self.stdout.write(f'[{index}/{total}] {tfm.filepath}')
            try:
                data = request_description_response(
                    tfm.filepath,
                    endpoint=endpoint,
                )
                description = extract_message(data)
                if not description:
                    raise ValueError('No assistant message in response.')

                tfm.description = description
                tfm.save(update_fields=['description'])
                updated += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  OK ({len(description)} chars)'
                    )
                )
            except (
                FileNotFoundError,
                requests.RequestException,
                ValueError,
            ) as exc:
                errors += 1
                self.stderr.write(
                    self.style.ERROR(f'  ERROR: {exc}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Complete. Updated {updated}/{total}; errors={errors}.'
            )
        )
