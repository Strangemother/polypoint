# Deployment

This directory contains deployment scripts and configuration for the production host.

## Layout

- `app/`: deployment automation scripts.
- `deploy/`: deployment assets (nginx, gunicorn configs, etc).
- `docs/`: deployment notes and background docs.
- `patches.yaml`: collision-resolution policy used during `git pull` conflict handling.

## Entrypoints

- Primary local launcher: `deploy.py` (repo root).
- Primary remote update script: `/home/site/apps/polypoint/deployment/polypoint-deploy/update-app.sh`.
- Site-user update worker: `deployment/polypoint-deploy/app/update-site-app.sh`.
- Pull-collision resolver: `deployment/polypoint-deploy/app/resolve_git_pull_collisions.py`.

## Standard Usage

Basic deploy:

```bash
python deploy.py --identity-file ./id_r
```

Dry run (no remote execution):

```bash
python deploy.py --dry-run --identity-file ./id_r
```

Show full SSH payload in output:

```bash
python deploy.py --identity-file ./id_r --show-remote-command
```

## CLI Options (`deploy.py`)

- `--host`: SSH host. Default `polypointjs.com`.
- `--port`: SSH port. Default `32432`.
- `--user`: SSH user. Default `root`.
- `--script`: remote script path to execute.
- `--app-root`: remote repo root. Default `/home/site/apps/polypoint`.
- `--identity-file`: optional SSH private key file.
- `--dry-run`: print command and exit without executing.
- `--show-remote-command`: print full remote payload (default view is compact).
- `--no-bootstrap`: do not bootstrap deployment scripts from `origin/main` before execution.
- `--no-patch`: disable pull-collision policy handling and use legacy pull behavior.
- `--hard-refresh`: perform remote repo hard reset/clean and remove stale bootstrap temp dirs before pull.

## Execution Modes

### 1) Default (bootstrap + patch handling)

`deploy.py` composes one SSH command that:

1. Fetches `origin/main`.
2. Creates a temporary bootstrap directory under `/tmp/polypoint-deploy.*`.
3. Loads deployment scripts and `patches.yaml` from `origin/main` into that temp directory using `git show`.
4. Executes the temp `update-app.sh` with override env vars so the temp script set is used.

This avoids mutating deployment scripts in the remote working tree before `git pull`.

### 2) No bootstrap (`--no-bootstrap`)

Runs the configured remote script directly:

```bash
python deploy.py --identity-file ./id_r --no-bootstrap
```

Use only when remote deploy scripts are already known-good.

### 3) No patch handling (`--no-patch`)

Disables collision policy resolution and uses plain pull:

```bash
python deploy.py --identity-file ./id_r --no-patch
```

In this mode, pull collisions are not auto-resolved.

### 4) Hard refresh (`--hard-refresh`)

Pre-pull recovery mode:

```bash
python deploy.py --identity-file ./id_r --hard-refresh
```

Remote actions before pull:

1. Remove stale `/tmp/polypoint-deploy.*` dirs.
2. `git reset --hard HEAD`
3. `git clean -fd`

Use this when deployment is blocked by persistent repo state.

## Pull Collision Handling

When patch handling is enabled, `update-site-app.sh` attempts pull up to 5 times.

Per attempt:

1. Run `git pull --ff-only origin main`.
2. If collision message is detected (`would be overwritten by merge|checkout`), parse file paths from output.
3. Resolve each collision file using rules in `patches.yaml`.
4. Retry pull.

If all retries fail, deployment exits with error.

## `patches.yaml` Format

Top-level sections define rules. `default` is fallback.

Example:

```yaml
default:
    pattern: "*"
    action: stop

site/beta/db.sqlite3:
    action: replace

deployment/*:
    action: replace
```

Rule behavior:

- Section key is used as `pattern` when explicit `pattern` is omitted.
- Wildcards are supported in section keys and patterns (fnmatch semantics).
- First matching non-default rule is applied, else `default` is applied.

## Supported Actions

- `replace`: auto-resolve by discarding local changes for that path.
    - tracked files: clears staged and unstaged changes (`git reset -- <path>` + `git checkout HEAD -- <path>`)
    - untracked files: removes path via `git clean -fd -- <path>`
- `stop`: abort collision handling immediately.
- `ignore`: parsed but not implemented for auto-continue (treated as error).
- `commit`: parsed but not implemented for auto-continue (treated as error).

## Output Behavior

`deploy.py` uses compact command display by default:

- shows SSH endpoint and options
- hides long remote payload

Use `--show-remote-command` to print the full remote command payload.

## Notes

- `--id` can work as an argparse prefix for `--identity-file`, but `--identity-file` is the explicit stable option.
- Nginx sync/reload remains part of remote `update-app.sh` after app update completes.

---

References:

- https://www.deanthomson.com/blog/deploying-django-applications-with-nginx-gunicorn/
- https://realpython.com/django-nginx-gunicorn/#replacing-wsgiserver-with-gunicorn
- https://gist.github.com/Suhas-G/16f91a6be5df6c8e05412b6776611eb9
- https://levelup.gitconnected.com/securely-deploy-a-django-app-with-gunicorn-nginx-https-33359261644e
- https://dev.to/chrisgen19/step-by-step-guide-assigning-a-namecheap-domain-to-digitalocean-hosting-with-nginx-39mk
- https://freedium.cfd/https://levelup.gitconnected.com/securely-deploy-a-django-app-with-gunicorn-nginx-https-33359261644e
- https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu#step-7-creating-systemd-socket-and-service-files-for-gunicorn

DigitalOcean links:

- DNS records: https://docs.digitalocean.com/products/networking/dns/how-to/manage-records/
- NS setup: https://docs.digitalocean.com/products/networking/dns/getting-started/dns-registrars/
- IPv6 setup: https://docs.digitalocean.com/products/networking/ipv6/how-to/enable/#on-existing-droplets

