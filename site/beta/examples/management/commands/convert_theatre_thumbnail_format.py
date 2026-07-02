from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from PIL import Image, UnidentifiedImageError

from examples import models


def normalize_extension(value):
    cleaned = str(value or '').strip().lower()
    if not cleaned:
        return ''
    if not cleaned.startswith('.'):
        cleaned = f'.{cleaned}'
    return cleaned


def convert_for_target(image, target_ext):
    if target_ext in ('.jpg', '.jpeg'):
        return image.convert('RGB')
    if target_ext == '.png':
        mode = 'RGBA' if 'A' in image.getbands() else 'RGB'
        return image.convert(mode)
    if target_ext == '.webp':
        mode = 'RGBA' if 'A' in image.getbands() else 'RGB'
        return image.convert(mode)
    return image.copy()


def build_save_kwargs(target_ext, quality, method):
    if target_ext == '.webp':
        return {
            'format': 'WEBP',
            'quality': quality,
            'method': method,
        }
    if target_ext in ('.jpg', '.jpeg'):
        return {
            'format': 'JPEG',
            'quality': quality,
            'optimize': True,
        }
    if target_ext == '.png':
        return {
            'format': 'PNG',
            'optimize': True,
        }
    return {'format': target_ext.lstrip('.').upper()}


class Command(BaseCommand):
    help = (
        'Convert TheatreFile still images from one format to another and '
        'update still_image_path (default: png -> webp).'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--from-format',
            default='png',
            help='Source extension (default: png).',
        )
        parser.add_argument(
            '--to-format',
            default='webp',
            help='Target extension (default: webp).',
        )
        parser.add_argument(
            '--quality',
            '--qual',
            type=int,
            default=82,
            help='Quality for lossy outputs such as WebP/JPEG (default: 82).',
        )
        parser.add_argument(
            '--method',
            type=int,
            default=6,
            help='WebP encoding method (0-6, default: 6).',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Recreate target file even when it already exists.',
        )
        parser.add_argument(
            '--delete-source',
            action='store_true',
            help='Delete source file after successful conversion.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Inspect and report without writing files or DB updates.',
        )
        parser.add_argument(
            '--progress-every',
            type=int,
            default=25,
            help='Print progress every N records (default: 25). Use 0 to disable.',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Print one line for each conversion/update action.',
        )

    def handle(self, *args, **options):
        source_ext = normalize_extension(options['from_format'])
        target_ext = normalize_extension(options['to_format'])
        quality = options['quality']
        method = options['method']
        force = options['force']
        delete_source = options['delete_source']
        dry_run = options['dry_run']
        progress_every = options['progress_every']
        verbose = options['verbose']

        if not source_ext or not target_ext:
            raise CommandError('Both --from-format and --to-format are required.')
        if source_ext == target_ext:
            raise CommandError('Source and target format must differ.')
        if quality < 1 or quality > 100:
            raise CommandError('--quality must be between 1 and 100.')
        if method < 0 or method > 6:
            raise CommandError('--method must be between 0 and 6.')
        if progress_every < 0:
            raise CommandError('--progress-every must be >= 0.')

        queryset = models.TheatreFile.objects.order_by('id')
        total_items = queryset.count()

        stats = {
            'total': 0,
            'without_path': 0,
            'missing_file': 0,
            'skipped_ext': 0,
            'already_target': 0,
            'updated_existing_target': 0,
            'converted': 0,
            'would_convert': 0,
            'would_update': 0,
            'deleted_source': 0,
            'errors': 0,
        }

        self.stdout.write(
            'Converting TheatreFile still images '
            f'{source_ext} -> {target_ext} '
            f'(rows={total_items}, progress_every={progress_every})...'
        )

        for tfm in queryset:
            stats['total'] += 1
            current_index = stats['total']

            if progress_every and (
                current_index == 1
                or current_index == total_items
                or current_index % progress_every == 0
            ):
                self.stdout.write(
                    f'Progress {current_index}/{total_items} '
                    f'converted={stats["converted"]} '
                    f'errors={stats["errors"]} '
                    f'missing={stats["missing_file"]}'
                )

            rel_path = (tfm.still_image_path or '').strip()
            if not rel_path:
                stats['without_path'] += 1
                continue

            source_rel_path = Path(rel_path).as_posix()
            source_path = Path(settings.MEDIA_ROOT) / source_rel_path
            if not source_path.exists():
                stats['missing_file'] += 1
                self.stderr.write(
                    self.style.WARNING(
                        f'Missing file for {tfm.filepath}: {source_path}'
                    )
                )
                continue

            if source_path.suffix.lower() != source_ext:
                stats['skipped_ext'] += 1
                continue

            target_rel_path = Path(source_rel_path).with_suffix(target_ext).as_posix()
            target_path = Path(settings.MEDIA_ROOT) / target_rel_path

            if target_path.exists() and not force:
                if source_rel_path == target_rel_path:
                    stats['already_target'] += 1
                    continue

                if dry_run:
                    stats['would_update'] += 1
                    if verbose:
                        self.stdout.write(
                            f'[dry-run] update path {source_rel_path} -> '
                            f'{target_rel_path}'
                        )
                    continue

                tfm.still_image_path = target_rel_path
                tfm.save(update_fields=['still_image_path'])
                stats['updated_existing_target'] += 1
                if verbose:
                    self.stdout.write(
                        f'Updated path to existing target: '
                        f'{source_rel_path} -> {target_rel_path}'
                    )
                continue

            try:
                with Image.open(source_path) as source_image:
                    converted = convert_for_target(source_image, target_ext)
                    save_kwargs = build_save_kwargs(target_ext, quality, method)

                if dry_run:
                    stats['would_convert'] += 1
                    if verbose:
                        self.stdout.write(
                            f'[dry-run] convert {source_rel_path} -> '
                            f'{target_rel_path}'
                        )
                    continue

                target_path.parent.mkdir(parents=True, exist_ok=True)
                converted.save(target_path, **save_kwargs)

                tfm.still_image_path = target_rel_path
                tfm.save(update_fields=['still_image_path'])
                stats['converted'] += 1
                if verbose:
                    self.stdout.write(
                        f'Converted {source_rel_path} -> {target_rel_path}'
                    )

                if delete_source and source_path != target_path and source_path.exists():
                    source_path.unlink()
                    stats['deleted_source'] += 1
                    if verbose:
                        self.stdout.write(f'Deleted source {source_rel_path}')
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
                f"converted={stats['converted']} "
                f"updated_existing_target={stats['updated_existing_target']} "
                f"already_target={stats['already_target']} "
                f"skipped_ext={stats['skipped_ext']} "
                f"without_path={stats['without_path']} "
                f"missing_file={stats['missing_file']} "
                f"would_convert={stats['would_convert']} "
                f"would_update={stats['would_update']} "
                f"deleted_source={stats['deleted_source']} "
                f"errors={stats['errors']}"
            )
        )
