import shutil
import subprocess
from pathlib import Path

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


def tree_shake(source):
    local_terser = Path(settings.SITE_DIR) / 'node_modules' / '.bin' / 'terser'
    terser = local_terser if local_terser.is_file() else shutil.which('terser')
    if terser is None:
        raise ImproperlyConfigured(
            'Tree-shaken exports require Node.js and Terser to be installed.'
        )

    result = subprocess.run(
        [
            str(terser),
            '--compress',
            'toplevel=true',
            '--keep-classnames',
            '--keep-fnames',
        ],
        input=source,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode:
        message = result.stderr.strip() or 'Terser failed without an error message.'
        raise RuntimeError(f'Unable to compile tree-shaken export: {message}')
    return result.stdout
