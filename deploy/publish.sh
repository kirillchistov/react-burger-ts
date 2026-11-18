#!/usr/bin/env bash
# Сборка SPA с base=/ и выкладка в /var/www/react-burger на ВМ.
# Пример: ./deploy/publish.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_HOST="${DEPLOY_HOST:-growcery.ru}"
DEPLOY_SSH_HOST="${DEPLOY_SSH_HOST:-153.51.163.30}"
DEPLOY_USER="${DEPLOY_USER:-yc-user}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/react-burger}"
SSH_KEY="${SSH_KEY:-${HOME}/.ssh/id_ed25519}"
SSH=(ssh -i "${SSH_KEY}" -o BatchMode=yes)

if [[ -z "${DEPLOY_HOST}" || -z "${DEPLOY_SSH_HOST}" ]]; then
  echo "Задайте DEPLOY_HOST и DEPLOY_SSH_HOST." >&2
  exit 1
fi

cd "${ROOT}"
npx vite build --base /

"${SSH[@]}" "${DEPLOY_USER}@${DEPLOY_SSH_HOST}" \
  "sudo mkdir -p '${DEPLOY_PATH}' && sudo chown -R '${DEPLOY_USER}:${DEPLOY_USER}' '${DEPLOY_PATH}'"

rsync -avz --delete \
  -e "${SSH[*]}" \
  "${ROOT}/dist/" \
  "${DEPLOY_USER}@${DEPLOY_SSH_HOST}:${DEPLOY_PATH}/"

echo "Опубликовано: https://${DEPLOY_HOST}/"
