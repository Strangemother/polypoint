import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
DEPLOY_SCRIPT_PATH = REPO_ROOT / 'deploy.py'


def load_module(module_name: str, file_path: Path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f'Unable to load module from {file_path}')
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


deploy = load_module('deploy_module_for_tests', DEPLOY_SCRIPT_PATH)


class DeployCommandTests(unittest.TestCase):
    def test_build_remote_command_without_bootstrap(self):
        command = deploy.build_remote_command(
            remote_script='/home/site/apps/polypoint/deployment/polypoint-deploy/update-app.sh',
            app_root='/home/site/apps/polypoint',
            bootstrap_deploy_scripts=False,
        )

        self.assertEqual(
            command,
            'set -e; bash /home/site/apps/polypoint/deployment/polypoint-deploy/update-app.sh',
        )

    def test_build_remote_command_with_bootstrap(self):
        command = deploy.build_remote_command(
            remote_script='/home/site/apps/polypoint/deployment/polypoint-deploy/update-app.sh',
            app_root='/home/site/apps/polypoint',
            bootstrap_deploy_scripts=True,
        )

        self.assertIn('set -e; cd /home/site/apps/polypoint;', command)
        self.assertIn('git fetch origin main;', command)
        self.assertIn('BOOTSTRAP_DIR="$(mktemp -d /tmp/polypoint-deploy.XXXXXX)"', command)
        self.assertIn(
            'git show origin/main:deployment/polypoint-deploy/update-app.sh '
            '> "$BOOTSTRAP_DIR"/deployment/polypoint-deploy/update-app.sh',
            command,
        )
        self.assertIn(
            'deployment/polypoint-deploy/app/resolve_git_pull_collisions.py',
            command,
        )
        self.assertIn(
            'SITE_UPDATE_SCRIPT_OVERRIDE="$BOOTSTRAP_DIR"/deployment/polypoint-deploy/app/update-site-app.sh',
            command,
        )
        self.assertIn(
            'PATCH_FILE_OVERRIDE="$BOOTSTRAP_DIR"/deployment/polypoint-deploy/patches.yaml',
            command,
        )
        self.assertTrue(
            command.endswith(
                'bash "$BOOTSTRAP_DIR"/deployment/polypoint-deploy/update-app.sh'
            )
        )

    def test_build_remote_command_adds_custom_script_to_bootstrap_bundle(self):
        command = deploy.build_remote_command(
            remote_script='/home/site/apps/polypoint/custom/deploy.sh',
            app_root='/home/site/apps/polypoint',
            bootstrap_deploy_scripts=True,
        )

        self.assertIn('git show origin/main:custom/deploy.sh > "$BOOTSTRAP_DIR"/custom/deploy.sh', command)
        self.assertTrue(command.endswith('bash "$BOOTSTRAP_DIR"/custom/deploy.sh'))

    def test_build_remote_command_bootstrap_falls_back_when_script_outside_app_root(self):
        command = deploy.build_remote_command(
            remote_script='/opt/custom/deploy.sh',
            app_root='/home/site/apps/polypoint',
            bootstrap_deploy_scripts=True,
        )

        self.assertEqual(
            command,
            'set -e; cd /home/site/apps/polypoint; git fetch origin main; bash /opt/custom/deploy.sh',
        )

    def test_build_ssh_command_with_identity_file(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            identity_file = Path(temp_dir) / 'id_rsa'
            identity_file.write_text('placeholder', encoding='utf-8')

            command = deploy.build_ssh_command(
                host='example.com',
                port=2222,
                user='root',
                remote_script='/home/site/apps/polypoint/deployment/polypoint-deploy/update-app.sh',
                identity_file=identity_file,
                app_root='/home/site/apps/polypoint',
                bootstrap_deploy_scripts=False,
            )

        self.assertEqual(command[0], 'ssh')
        self.assertEqual(command[1], '-i')
        self.assertEqual(command[2], str(identity_file.resolve()))
        self.assertEqual(command[3], '-p')
        self.assertEqual(command[4], '2222')
        self.assertEqual(command[5], 'root@example.com')
        self.assertIn('set -e; bash ', command[6])


if __name__ == '__main__':
    unittest.main()
