#!/usr/bin/env bash
# Server-side deploy: sync to origin/<branch>, rebuild, restart, verify. Usage: deploy.sh [branch]
set -euo pipefail
BRANCH="${1:-master}"; cd "$(dirname "$0")/.."
git fetch --quiet origin "$BRANCH"
git checkout --quiet -B "$BRANCH" "origin/$BRANCH"
cd deploy
docker compose --env-file ../.env.tunnel build app
docker compose --env-file ../.env.tunnel up -d --remove-orphans
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/robots.txt || true)
  [ "$code" = 200 ] && { echo "deploy OK ($(git rev-parse --short HEAD))"; docker image prune -f >/dev/null; exit 0; }
  sleep 2
done
echo "deploy FAILED: app not healthy"; docker compose logs --tail 80 app; exit 1
