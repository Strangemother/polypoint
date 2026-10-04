import json
from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.core.management import call_command
from django.core.management.base import CommandError
from django.db import IntegrityError, transaction
from django.test import TestCase, override_settings
from django.urls import reverse

from .categories import UNCATEGORISED, parse_categories
from .models import TheatreFile, TheatreFileCategory
from . import theatre as theatre_module


class TheatreCategoryTests(TestCase):
    def setUp(self):
        self.directory = TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        override = self.settings(
            POLYPOINT_THEATRE_DIR=self.root,
            STORAGES={
                'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
                'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'},
            },
        )
        override.enable()
        self.addCleanup(override.disable)
        (self.root / 'readme.md').write_text('Test theatre', encoding='utf-8')

    def write_file(self, name, header=None):
        path = self.root / name
        content = 'const example = true;'
        if header is not None:
            content = f'/*\n---\n{header}\n*/\n{content}'
        path.write_text(content, encoding='utf-8')
        return path

    def run_import(self, *files):
        output = StringIO()
        call_command('parse_categories', *files, stdout=output)
        return output.getvalue()

    def groups_for(self, filename):
        theatre_file = TheatreFile.objects.get(filepath=filename)
        return set(theatre_file.theatrefilecategory_set.values_list('name', flat=True))

    def test_parser_combines_keys_and_deduplicates_names(self):
        path = self.write_file(
            'combined.js',
            'category: angles\ncategories:\n    arc\n    angles\n    two words\nfiles:\n    stage',
        )
        self.assertEqual(parse_categories(path), ('angles', 'arc', 'two words'))

    def test_parser_supports_two_space_continuations(self):
        path = self.write_file('two-space.js', 'categories: raw\n  broken\n  gpt')
        self.assertEqual(parse_categories(path), ('raw', 'broken', 'gpt'))

    def test_parser_discards_empty_values_and_trims_names(self):
        path = self.write_file('trim.js', 'category: \ncategories:   angles   ')
        self.assertEqual(parse_categories(path), ('angles',))

    def test_parser_ignores_nonleading_comments_and_code(self):
        path = self.write_file('code.js')
        path.write_text('const example = true;\n/* category: wrong */', encoding='utf-8')
        self.assertEqual(parse_categories(path), ())

    def test_parser_ignores_categories_in_documentation_body(self):
        path = self.write_file('body.js', 'title: Example\n\ncategory: not-metadata')
        self.assertEqual(parse_categories(path), ())

    def test_import_all_only_processes_javascript_files(self):
        self.write_file('first.js', 'category: angles')
        self.write_file('second.js', 'categories: angles\n    arc')
        self.write_file('uncategorised.js')
        output = self.run_import()
        self.assertIn('Processed 3 file(s)', output)
        self.assertEqual(TheatreFile.objects.count(), 3)
        self.assertEqual(TheatreFileCategory.objects.count(), 3)
        self.assertEqual(self.groups_for('first.js'), {'angles'})
        self.assertEqual(self.groups_for('second.js'), {'angles', 'arc'})
        self.assertEqual(self.groups_for('uncategorised.js'), {UNCATEGORISED})
        self.assertEqual(TheatreFileCategory.objects.get(name='angles').files.count(), 2)

    def test_repeated_import_does_not_duplicate_records_or_memberships(self):
        self.write_file('first.js', 'category: angles')
        self.run_import()
        self.run_import()
        self.assertEqual(TheatreFile.objects.count(), 1)
        self.assertEqual(TheatreFileCategory.objects.count(), 1)
        self.assertEqual(TheatreFileCategory.objects.get().files.count(), 1)

    def test_updates_replace_memberships_and_preserve_existing_file_data(self):
        self.write_file('first.js', 'category: old')
        self.write_file('second.js', 'category: old')
        self.run_import()
        theatre_file = TheatreFile.objects.get(filepath='first.js')
        theatre_file.description = 'Keep this description'
        theatre_file.still_image_path = 'images/first.png'
        theatre_file.save()
        old_crc = theatre_file.crc
        self.write_file('first.js', 'category: new')
        self.run_import('first.js')
        self.assertEqual(self.groups_for('first.js'), {'new'})
        self.assertEqual(self.groups_for('second.js'), {'old'})
        theatre_file.refresh_from_db()
        self.assertEqual(theatre_file.description, 'Keep this description')
        self.assertEqual(theatre_file.still_image_path, 'images/first.png')
        self.assertEqual(theatre_file.crc, old_crc)

    def test_files_move_into_and_out_of_uncategorised(self):
        self.write_file('first.js')
        self.run_import()
        self.assertEqual(self.groups_for('first.js'), {UNCATEGORISED})
        self.write_file('first.js', 'category: angles')
        self.run_import()
        self.assertEqual(self.groups_for('first.js'), {'angles'})
        self.write_file('first.js', 'categories:')
        self.run_import()
        self.assertEqual(self.groups_for('first.js'), {UNCATEGORISED})
        self.assertTrue(TheatreFileCategory.objects.filter(name='angles').exists())

    def test_selected_stems_absolute_paths_and_duplicates(self):
        path = self.write_file('first.js', 'category: angles')
        self.write_file('second.js', 'category: arc')
        output = self.run_import('first', str(path), 'first.js')
        self.assertIn('Processed 1 file(s)', output)
        self.assertEqual(TheatreFile.objects.count(), 1)
        self.assertEqual(self.groups_for('first.js'), {'angles'})

    def test_invalid_file_aborts_before_database_changes(self):
        self.write_file('first.js', 'category: angles')
        with self.assertRaisesMessage(CommandError, 'Not a theatre JavaScript file'):
            self.run_import('first.js', 'missing.js')
        self.assertFalse(TheatreFile.objects.exists())
        self.assertFalse(TheatreFileCategory.objects.exists())

    def test_paths_outside_theatre_are_rejected(self):
        with self.assertRaisesMessage(CommandError, 'outside the theatre directory'):
            self.run_import('../outside.js')

    def test_non_javascript_files_are_rejected(self):
        with self.assertRaisesMessage(CommandError, 'Not a theatre JavaScript file'):
            self.run_import('readme.md')

    def test_unreadable_encoding_aborts_before_database_changes(self):
        self.write_file('first.js', 'category: angles')
        (self.root / 'bad.js').write_bytes(b'\xff')
        with self.assertRaisesMessage(CommandError, 'Unable to read bad.js'):
            self.run_import('first.js', 'bad.js')
        self.assertFalse(TheatreFile.objects.exists())

    def test_category_name_length_is_validated(self):
        self.write_file('long.js', 'category: ' + 'x' * 256)
        with self.assertRaisesMessage(CommandError, 'exceeds 255 characters'):
            self.run_import()
        self.assertFalse(TheatreFileCategory.objects.exists())

    def test_category_names_have_database_uniqueness(self):
        TheatreFileCategory.objects.create(name='angles')
        with self.assertRaises(IntegrityError), transaction.atomic():
            TheatreFileCategory.objects.create(name='angles')

    def test_category_list_shows_counts_and_links(self):
        self.write_file('first.js', 'category: angles')
        self.write_file('second.js')
        self.run_import()
        response = self.client.get(reverse('examples:categories'))
        category = TheatreFileCategory.objects.get(name='angles')
        self.assertContains(response, 'angles')
        self.assertContains(response, UNCATEGORISED)
        self.assertContains(response, reverse('examples:category_files', args=[category.pk]))
        self.assertEqual(list(response.context['object_list'].values_list('file_count', flat=True)), [1, 1])

    def test_category_files_view_only_shows_members(self):
        self.write_file('first.js', 'category: angles')
        self.write_file('second.js', 'category: arc')
        self.run_import()
        category = TheatreFileCategory.objects.get(name='angles')
        response = self.client.get(reverse('examples:category_files', args=[category.pk]))
        self.assertContains(response, 'angles: 1 Examples')
        self.assertContains(response, 'first')
        self.assertNotContains(response, 'data-file="second"')
        self.assertEqual(list(response.context['object_list'].values_list('filepath', flat=True)), ['first.js'])

    def test_unknown_category_returns_404(self):
        response = self.client.get(reverse('examples:category_files', args=[999]))
        self.assertEqual(response.status_code, 404)

    def test_category_file_links_preserve_subdirectory(self):
        (self.root / 'nested').mkdir()
        self.write_file('nested/first.js', 'category: angles')
        self.run_import('nested/first.js')
        theatre_file = TheatreFile.objects.get(filepath='nested/first.js')
        self.assertEqual(theatre_file.example_path, 'nested/first')
        category = TheatreFileCategory.objects.get(name='angles')
        response = self.client.get(reverse('examples:category_files', args=[category.pk]))
        self.assertContains(
            response,
            reverse('examples:file_example', kwargs={'path': 'nested/first'}),
            count=2,
        )

    def test_database_list_links_to_categories(self):
        response = self.client.get(reverse('examples:example_db'))
        self.assertContains(response, reverse('examples:categories'))


class ExampleFileShakenExportTests(TestCase):
    def setUp(self):
        self.directory = TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.theatre_root = self.root / 'theatre'
        self.source_root = self.root / 'point_src'
        self.theatre_root.mkdir()
        self.source_root.mkdir()
        (self.source_root / 'files.json').write_text(
            json.dumps({'stage': '../point_src/stage.js'}),
            encoding='utf-8',
        )
        (self.source_root / 'stage.js').write_text(
            'class Stage { constructor() { console.log("stage initialized"); } }\n'
            'function unusedDependencyFunction() { return 1; }\n'
            'window.stageLibraryInitialized = true;\n',
            encoding='utf-8',
        )
        (self.theatre_root / 'sample.js').write_text(
            '/*\nfiles:\n    stage\n*/\n'
            'const stage = new Stage();\n'
            'function keepStage() { return stage; }\n'
            'window.stage = stage;\n'
            'window.keepStage = keepStage;\n'
            'function unusedTheatreFunction() { return 2; }\n'
            'console.log("theatre initialized");\n',
            encoding='utf-8',
        )
        override = override_settings(
            POLYPOINT_THEATRE_DIR=self.theatre_root,
            POLYPOINT_SRC_DIR=self.source_root,
            POLYPOINT_THEATRE_SRC_RELATIVE_PATH='../point_src/',
        )
        override.enable()
        self.addCleanup(override.disable)
        for name, value in (
            ('POLYPOINT_THEATRE_DIR', self.theatre_root),
            ('POLYPOINT_SRC_DIR', self.source_root),
            ('POLYPOINT_THEATRE_SRC_RELATIVE_PATH', '../point_src/'),
        ):
            setting = patch.object(theatre_module.settings, name, value)
            setting.start()
            self.addCleanup(setting.stop)

    def test_shaken_export_keeps_stage_roots_and_side_effects(self):
        self.assertEqual(
            theatre_module.settings.POLYPOINT_THEATRE_DIR,
            self.theatre_root,
        )
        response = self.client.get(
            reverse('examples:file_example_shaken', kwargs={'path': 'sample'})
        )

        self.assertEqual(response.status_code, 200)
        output = response.context['concat_content']
        self.assertIn('class Stage', output)
        self.assertIn('new class Stage', output)
        self.assertIn('keepStage', output)
        self.assertIn('stage initialized', output)
        self.assertIn('stageLibraryInitialized', output)
        self.assertIn('theatre initialized', output)
        self.assertNotIn('unusedDependencyFunction', output)
        self.assertNotIn('unusedTheatreFunction', output)

    def test_existing_script_and_theatre_export_is_not_shaken(self):
        response = self.client.get(
            reverse('examples:file_example_all', kwargs={'path': 'sample'})
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn(
            'unusedDependencyFunction',
            response.context['concat_content'],
        )
        self.assertIn(
            'unusedTheatreFunction',
            response.context['concat_content'],
        )
