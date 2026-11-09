#!/usr/bin/env bash
# Server-side deploy: sync to origin/<branch>, rebuild, restart, verify; roll back on failure.
# Usage: deploy.sh [branch]. Note: edits to this script take effect from the *next* deploy.
set -euo pipefail
BRANCH="${1:-master}"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$HOME/seoul-tennis-logs"; mkdir -p "$LOG_DIR"   # outside the repo checkout
exec 9>/tmp/seoul-tennis-deploy.lock
flock -n 9 || { echo "another deploy is running"; exit 1; }

cd "$APP_DIR"
git fetch --quiet origin "$BRANCH"
git checkout --quiet -B "$BRANCH" "origin/$BRANCH"
SHA=$(git rev-parse --short HEAD)

cd deploy
DC=(docker compose --env-file ../.env.tunnel)
docker image inspect seoul-tennis:latest >/dev/null 2>&1 && docker tag seoul-tennis:latest seoul-tennis:prev

"${DC[@]}" build app > "$LOG_DIR/build-$SHA.log" 2>&1 || { echo "deploy FAILED: build error ($SHA); old container still serving. See $LOG_DIR/build-$SHA.log on the server"; exit 1; }
"${DC[@]}" up -d --remove-orphans

healthy() {
  for _ in $(seq 1 30); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/robots.txt || true)" = 200 ] && return 0
    sleep 2
  done
  return 1
}

if healthy; then
  echo "deploy OK ($SHA)"
  docker image prune -f >/dev/null
  docker builder prune -f --filter until=168h >/dev/null
  exit 0
fi

# Never print app logs here: GitHub Actions logs of this public repo are world-readable.
"${DC[@]}" logs --tail 200 app > "$LOG_DIR/failed-$SHA.log" 2>&1 || true
if docker image inspect seoul-tennis:prev >/dev/null 2>&1; then
  docker tag seoul-tennis:prev seoul-tennis:latest
  "${DC[@]}" up -d app
  healthy && echo "deploy FAILED ($SHA): rolled back to previous image. See $LOG_DIR/failed-$SHA.log on the server" \
          || echo "deploy FAILED ($SHA): rollback also unhealthy. See $LOG_DIR/failed-$SHA.log on the server"
else
  echo "deploy FAILED ($SHA): no previous image to roll back to. See $LOG_DIR/failed-$SHA.log on the server"
fi
exit 1
