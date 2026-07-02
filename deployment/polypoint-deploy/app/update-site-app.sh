#!/bin/bash
set -euo pipefail

APP_ROOT="${1:-/home/site/apps/polypoint}"
DEPLOY_ROOT="$APP_ROOT/deployment/polypoint-deploy"
PATCH_FILE="$DEPLOY_ROOT/patches.yaml"
COLLISION_TOOL="$DEPLOY_ROOT/app/resolve_git_pull_collisions.py"
MAX_PULL_ATTEMPTS=5

extract_collision_files() {
    awk '
        /would be overwritten by (merge|checkout):/ {capture=1; next}
        /Please commit your changes or stash them before you merge\./ {capture=0}
        /Please move or remove them before you merge\./ {capture=0}
        capture {
            gsub(/^[[:space:]]+/, "", $0)
            if (length($0) > 0) print $0
        }
    '
}

pull_with_collision_resolution() {
    local attempt=1
    local pull_output=""
    local pull_status=0

    if [ ! -f "$COLLISION_TOOL" ]; then
        echo "✗ Collision resolver script missing: $COLLISION_TOOL"
        return 1
    fi

    while [ "$attempt" -le "$MAX_PULL_ATTEMPTS" ]; do
        echo "→ Pull attempt $attempt/$MAX_PULL_ATTEMPTS..."

        set +e
        pull_output="$(git pull --no-ff origin main 2>&1)"
        pull_status=$?
        set -e

        printf '%s\n' "$pull_output"

        if [ "$pull_status" -eq 0 ]; then
            return 0
        fi

        if ! printf '%s\n' "$pull_output" | grep -Eq 'would be overwritten by (merge|checkout)'; then
            echo "✗ git pull failed and no auto-resolvable collision was detected."
            return "$pull_status"
        fi

        mapfile -t collision_files < <(printf '%s\n' "$pull_output" | extract_collision_files)
        if [ "${#collision_files[@]}" -eq 0 ]; then
            echo "✗ Unable to parse collision file list from git output."
            return "$pull_status"
        fi

        echo "→ Applying collision rules from $PATCH_FILE"
        python3 "$COLLISION_TOOL" \
            --repo-root "$APP_ROOT" \
            --patch-file "$PATCH_FILE" \
            "${collision_files[@]}"

        attempt=$((attempt + 1))
    done

    echo "✗ Exceeded maximum pull attempts while resolving collisions."
    return 1
}

cd "$APP_ROOT"
pull_with_collision_resolution

# Activate virtual environment.
source "$APP_ROOT/.venv/bin/activate"

# Collect static files.
cd "$APP_ROOT/site/beta"
python3 manage.py collectstatic --noinput

echo "✓ Application updated successfully"
