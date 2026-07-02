import contextlib
import importlib.util
import io
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


REPO_ROOT = Path(__file__).resolve().parents[3]
RESOLVER_PATH = (
    REPO_ROOT
    / 'deployment'
    / 'polypoint-deploy'
    / 'app'
    / 'resolve_git_pull_collisions.py'
)


def load_module(module_name: str, file_path: Path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f'Unable to load module from {file_path}')
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


resolver = load_module('resolver_module_for_tests', RESOLVER_PATH)


def run_git(repo_root: Path, *args: str) -> None:
    subprocess.run(
        ['git', '-C', str(repo_root), *args],
        check=True,
        text=True,
        capture_output=True,
    )


def init_repo(repo_root: Path) -> None:
    run_git(repo_root, 'init')
    run_git(repo_root, 'config', 'user.email', 'tests@example.com')
    run_git(repo_root, 'config', 'user.name', 'Deploy Tests')


class CollisionRuleTests(unittest.TestCase):
    def test_parse_and_build_rules(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            patch_file = Path(temp_dir) / 'patches.yaml'
            patch_file.write_text(
                '\n'.join(
                    [
                        'default:',
                        '  pattern: "*"',
                        '  action: stop',
                        '',
                        'site/beta/db.sqlite3:',
                        '  action: replace',
                    ]
                ),
                encoding='utf-8',
            )

            sections = resolver.parse_patches_yaml(patch_file)
            rules, default_rule = resolver.build_rules(sections)

        self.assertEqual(default_rule.action, 'stop')
        self.assertEqual(default_rule.pattern, '*')
        self.assertEqual(len(rules), 1)
        self.assertEqual(rules[0].name, 'site/beta/db.sqlite3')
        self.assertEqual(rules[0].pattern, 'site/beta/db.sqlite3')
        self.assertEqual(rules[0].action, 'replace')

    def test_normalize_repo_relative_rejects_escape_path(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            with self.assertRaises(resolver.CollisionResolutionError):
                resolver.normalize_repo_relative(repo_root, '../outside.txt')

    def test_resolve_rule_matches_specific_then_default(self):
        rules = [
            resolver.PatchRule(
                name='db',
                pattern='db.sqlite3',
                action='replace',
            )
        ]
        default_rule = resolver.PatchRule(name='default', pattern='*', action='stop')

        db_rule = resolver.resolve_rule(
            Path('site/beta/db.sqlite3'),
            rules,
            default_rule,
        )
        other_rule = resolver.resolve_rule(Path('foo/bar.txt'), rules, default_rule)

        self.assertEqual(db_rule.action, 'replace')
        self.assertEqual(other_rule.action, 'stop')

    def test_apply_action_stop_raises(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            init_repo(repo_root)
            stop_rule = resolver.PatchRule(name='default', pattern='*', action='stop')

            with self.assertRaises(resolver.CollisionResolutionError):
                resolver.apply_action(repo_root, Path('site/beta/db.sqlite3'), stop_rule, False)


class CollisionGitIntegrationTests(unittest.TestCase):
    def test_apply_replace_reverts_tracked_file(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            init_repo(repo_root)

            target = repo_root / 'site' / 'beta' / 'db.sqlite3'
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text('original', encoding='utf-8')

            run_git(repo_root, 'add', 'site/beta/db.sqlite3')
            run_git(repo_root, 'commit', '-m', 'Add db file')

            target.write_text('changed', encoding='utf-8')
            resolver.apply_replace(repo_root, Path('site/beta/db.sqlite3'), dry_run=False)

            self.assertEqual(target.read_text(encoding='utf-8'), 'original')

    def test_apply_replace_removes_untracked_file(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            init_repo(repo_root)

            readme = repo_root / 'README.md'
            readme.write_text('base', encoding='utf-8')
            run_git(repo_root, 'add', 'README.md')
            run_git(repo_root, 'commit', '-m', 'Initial commit')

            target = repo_root / 'site' / 'beta' / 'db.sqlite3'
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text('untracked', encoding='utf-8')
            self.assertTrue(target.exists())

            resolver.apply_replace(repo_root, Path('site/beta/db.sqlite3'), dry_run=False)
            self.assertFalse(target.exists())


class CollisionMainFlowTests(unittest.TestCase):
    def test_main_dry_run_replace_rule(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir) / 'repo'
            repo_root.mkdir(parents=True, exist_ok=True)

            patch_file = Path(temp_dir) / 'patches.yaml'
            patch_file.write_text(
                '\n'.join(
                    [
                        'default:',
                        '  pattern: "*"',
                        '  action: stop',
                        '',
                        'site/beta/db.sqlite3:',
                        '  action: replace',
                    ]
                ),
                encoding='utf-8',
            )

            argv = [
                'resolve_git_pull_collisions.py',
                '--repo-root',
                str(repo_root),
                '--patch-file',
                str(patch_file),
                '--dry-run',
                'site/beta/db.sqlite3',
            ]

            stdout = io.StringIO()
            stderr = io.StringIO()
            with mock.patch.object(sys, 'argv', argv):
                with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                    exit_code = resolver.main()

        self.assertEqual(exit_code, 0)
        self.assertIn('[dry-run] replace site/beta/db.sqlite3', stdout.getvalue())
        self.assertEqual('', stderr.getvalue())

    def test_main_dry_run_space_delimited_single_argument(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir) / 'repo'
            repo_root.mkdir(parents=True, exist_ok=True)

            patch_file = Path(temp_dir) / 'patches.yaml'
            patch_file.write_text(
                '\n'.join(
                    [
                        'default:',
                        '  pattern: "*"',
                        '  action: stop',
                        '',
                        'site/beta/db.sqlite3:',
                        '  action: replace',
                        '',
                        'deployment/polypoint-deploy/update-app.sh:',
                        '  action: replace',
                    ]
                ),
                encoding='utf-8',
            )

            combined = (
                'deployment/polypoint-deploy/update-app.sh '
                'site/beta/db.sqlite3'
            )
            argv = [
                'resolve_git_pull_collisions.py',
                '--repo-root',
                str(repo_root),
                '--patch-file',
                str(patch_file),
                '--dry-run',
                combined,
            ]

            stdout = io.StringIO()
            stderr = io.StringIO()
            with mock.patch.object(sys, 'argv', argv):
                with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                    exit_code = resolver.main()

        output = stdout.getvalue()
        self.assertEqual(exit_code, 0)
        self.assertIn('[dry-run] replace deployment/polypoint-deploy/update-app.sh', output)
        self.assertIn('[dry-run] replace site/beta/db.sqlite3', output)
        self.assertEqual('', stderr.getvalue())


if __name__ == '__main__':
    unittest.main()
