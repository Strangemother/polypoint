import re
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from PIL import Image, ImageOps, UnidentifiedImageError

from examples import models


SIZE_SUFFIX_RE = re.compile(r'_(\d+)x(\d+)$')

try:
    LANCZOS = Image.Resampling.LANCZOS
except AttributeError:
    LANCZOS = Image.LANCZOS


def make_sized_filename(path, width, height):
    stem = SIZE_SUFFIX_RE.sub('', path.stem)
    return f'{stem}_{width}x{height}{path.suffix}'


def resize_to_fit(image, target_size):
    has_alpha = 'A' in image.getbands()
    mode = 'RGBA' if has_alpha else 'RGB'
    fill = (0, 0, 0, 0) if has_alpha else (34, 34, 34)
    source = image.convert(mode)
    return ImageOps.pad(
        source,
        target_size,
        method=LANCZOS,
        color=fill,
        centering=(0.5, 0.5),
    )


def save_resized_image(image, output_path):
    suffix = output_path.suffix.lower()
    save_kwargs = {}
    output = image

    if suffix in ('.jpg', '.jpeg'):
        if output.mode == 'RGBA':
            output = output.convert('RGB')
        save_kwargs = {'quality': 90, 'optimize': True}
    elif suffix == '.png':
        save_kwargs = {'optimize': True}

    output.save(output_path, **save_kwargs)


class Command(BaseCommand):
    help = (
        'Normalize TheatreFile thumbnails to a target size while preserving '
        'aspect ratio, writing a size-suffixed filename and updating '
        'still_image_path.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--width',
            type=int,
            default=400,
            help='Target thumbnail width. Default: 400',
        )
        parser.add_argument(
            '--height',
            type=int,
            default=300,
            help='Target thumbnail height. Default: 300',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Recreate thumbnails even if they already match target size.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Inspect and report changes without writing files or DB updates.',
        )

    def handle(self, *args, **options):
        width = options['width']
        height = options['height']
        force = options['force']
        dry_run = options['dry_run']

        if width < 1 or height < 1:
            raise CommandError('Width and height must be positive integers.')

        target_size = (width, height)
        queryset = models.TheatreFile.objects.order_by('id')

        stats = {
            'total': 0,
            'without_path': 0,
            'missing_file': 0,
            'already_ok': 0,
            'updated': 0,
            'would_update': 0,
            'errors': 0,
        }

        self.stdout.write(
            f'Inspecting TheatreFile thumbnails for target {width}x{height}...'
        )

        for tfm in queryset:
            stats['total'] += 1
            rel_path = (tfm.still_image_path or '').strip()
            if not rel_path:
                stats['without_path'] += 1
                continue

            source_path = Path(settings.MEDIA_ROOT) / rel_path
            if not source_path.exists():
                stats['missing_file'] += 1
                self.stderr.write(
                    self.style.WARNING(
                        f'Missing file for {tfm.filepath}: {source_path}'
                    )
                )
                continue

            try:
                with Image.open(source_path) as image:
                    current_size = image.size
                    needs_resize = force or current_size != target_size

                    if not needs_resize:
                        stats['already_ok'] += 1
                        continue

                    output_name = make_sized_filename(source_path, width, height)
                    output_path = source_path.with_name(output_name)
                    output_rel_path = Path(rel_path).with_name(output_name).as_posix()

                    if dry_run:
                        stats['would_update'] += 1
                        continue

                    resized = resize_to_fit(image, target_size)

                output_path.parent.mkdir(parents=True, exist_ok=True)
                save_resized_image(resized, output_path)

                tfm.still_image_path = output_rel_path
                tfm.save(update_fields=['still_image_path'])
                stats['updated'] += 1
            except (UnidentifiedImageError, OSError, ValueError) as exc:
                stats['errors'] += 1
                self.stderr.write(
                    self.style.ERROR(
                        f'Failed {tfm.filepath} ({source_path}): {exc}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                'Done. '
                f"total={stats['total']} "
                f"updated={stats['updated']} "
                f"already_ok={stats['already_ok']} "
                f"without_path={stats['without_path']} "
                f"missing_file={stats['missing_file']} "
                f"would_update={stats['would_update']} "
                f"errors={stats['errors']}"
            )
        )
