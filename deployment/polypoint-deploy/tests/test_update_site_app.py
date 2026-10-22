"""Exercise deployment ordering/failure handling without touching a real server."""

import os
from pathlib import Path
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "app" / "update-site-app.sh"


class UpdateSiteAppTests(unittest.TestCase):
    def run_update(self, failure=""):
        with tempfile.TemporaryDirectory() as temporary:
            app = Path(temporary)
            binaries = app / ".venv" / "bin"
            binaries.mkdir(parents=True)
            (app / "site" / "beta").mkdir(parents=True)
            (binaries / "activate").write_text(f'export PATH="{binaries}:$PATH"\n')
            trace = app / "trace"
            for command in ("git", "python"):
                executable = binaries / command
                executable.write_text(
                    '#!/bin/bash\n'
                    'echo "$(basename "$0") $*" >> "$DEPLOY_TEST_TRACE"\n'
                    'if [[ -n "$DEPLOY_TEST_FAILURE" && "$*" == *"$DEPLOY_TEST_FAILURE"* ]]; then exit 17; fi\n'
                )
                executable.chmod(0o755)
            result = subprocess.run(
                ["bash", str(SCRIPT), str(app)], capture_output=True, text=True,
                env={**os.environ, "PATH": str(binaries) + os.pathsep + os.environ["PATH"],
                     "NO_PATCH": "1", "HARD_REFRESH": "0", "DEPLOY_TEST_TRACE": str(trace),
                     "DEPLOY_TEST_FAILURE": failure},
            )
            return result, trace.read_text().splitlines()

    def test_dependencies_then_migrations_then_static(self):
        result, trace = self.run_update()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(trace, [
            "git pull --ff-only origin main",
            "python -m pip install --disable-pip-version-check -r requirements.txt",
            "python manage.py migrate --noinput",
            "python manage.py collectstatic --noinput",
        ])

    def test_install_failure_stops_before_any_django_command(self):
        result, trace = self.run_update("-m pip")
        self.assertEqual(result.returncode, 17)
        self.assertFalse(any("manage.py" in line for line in trace))
        self.assertNotIn("Application updated successfully", result.stdout)

    def test_migration_failure_stops_before_collectstatic(self):
        result, trace = self.run_update("manage.py migrate")
        self.assertEqual(result.returncode, 17)
        self.assertFalse(any("collectstatic" in line for line in trace))
        self.assertNotIn("Application updated successfully", result.stdout)


if __name__ == "__main__":
    unittest.main()
