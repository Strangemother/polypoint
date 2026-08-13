#!/usr/bin/env python3
"""Create the local site environment, install its requirements, and run Django."""

import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SITE = ROOT / "site"
BETA = SITE / "beta"
ENV = SITE / "env"
REQUIREMENTS = BETA / "requirements.txt"


def environment_python():
    executable = "python.exe" if os.name == "nt" else "python"
    return ENV / ("Scripts" if os.name == "nt" else "bin") / executable


def main():
    python = environment_python()

    if not python.exists():
        print(f"Creating virtual environment in {ENV}")
        subprocess.check_call([sys.executable, "-m", "venv", str(ENV)])

    subprocess.check_call([str(python), "-m", "pip", "install", "-r", str(REQUIREMENTS)])
    subprocess.check_call([str(python), "manage.py", "runserver", *sys.argv[1:]], cwd=BETA)


if __name__ == "__main__":
    main()