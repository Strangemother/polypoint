# Python Virtual Environment Setup

This guide covers creating and managing Python virtual environments for the polypoint application.

## Why Use a Virtual Environment?

Virtual environments isolate Python dependencies for each project, preventing conflicts between different projects and system packages.

## Creating a Virtual Environment

### Basic Setup

```bash
# Navigate to your project directory
cd /home/site/apps/polypoint

# Create the virtual environment
python3 -m venv .venv
```

This creates a `.venv` directory containing:
- Python interpreter
- pip package manager
- Isolated package installation directory

## Activating the Virtual Environment

### On Linux/Mac

```bash
source .venv/bin/activate
```

When activated, your prompt will change to show `(.venv)` prefix:
```
(.venv) site@polypointjs:~/apps/polypoint$
```

### Verify Activation

```bash
which python
# Should output: /home/site/apps/polypoint/.venv/bin/python

which pip
# Should output: /home/site/apps/polypoint/.venv/bin/pip
```

## Deactivating the Virtual Environment

```bash
deactivate
```

## Installing Packages

Always activate the virtual environment before installing packages:

```bash
source .venv/bin/activate
pip install -r site/beta/requirements.txt
```

## Common Commands

```bash
# List installed packages
pip list

# Show package details
pip show django

# Upgrade pip itself
pip install --upgrade pip

# Freeze current packages to requirements file
pip freeze > requirements.txt
```

## Troubleshooting

### Virtual Environment Not Activating

If `source .venv/bin/activate` doesn't work:
```bash
# Check if venv was created successfully
ls -la .venv/bin/

# Try using full path
source /home/site/apps/polypoint/.venv/bin/activate
```

### Wrong Python Version

Specify Python version explicitly:
```bash
python3.11 -m venv .venv
# or
python3.10 -m venv .venv
```

### Recreating Virtual Environment

If the environment becomes corrupted:
```bash
# Remove old environment
rm -rf .venv

# Create new one
python3 -m venv .venv

# Activate and reinstall packages
source .venv/bin/activate
pip install -r site/beta/requirements.txt
```

## Best Practices

1. **Always activate** the virtual environment before working on the project
2. **Never commit** the `.venv` directory to git (it's in `.gitignore`)
3. **Keep requirements.txt updated** when you install new packages
4. **Use the same Python version** across development and production
5. **Test after recreating** the virtual environment to ensure all dependencies are captured

## For Production Deployment

The virtual environment is used by:
- Gunicorn (via the start script)
- Django management commands
- Any manual Python scripts

The systemd service automatically activates the environment via the start script.
