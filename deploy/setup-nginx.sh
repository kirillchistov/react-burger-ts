#!/usr/bin/env bash
# Установка Nginx, файрвола и (опционально) сертификата Let's Encrypt
# на Ubuntu. Запускать на ВМ: sudo DOMAIN=example.ru EMAIL=you@mail ./deploy/setup-nginx.sh
set -euo pipefail

SITE_NAME="${SITE_NAME:-react-burger}"
WEB_ROOT="${WEB_ROOT:-/var/www/${SITE_NAME}}"
DOMAIN="${DOMAIN:-}"
EMAIL="${EMAIL:-}"
AVAILABLE="/etc/nginx/sites-available/${SITE_NAME}"
ENABLED="/etc/nginx/sites-enabled/${SITE_NAME}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Запустите скрипт через sudo." >&2
  exit 1
fi

if ! command -v apt >/dev/null 2>&1; then
  echo "Нужен Ubuntu/Debian с apt. Этот скрипт не для macOS." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> Шаг 1. Устанавливаем Nginx"
apt update
apt install -y nginx
systemctl enable --now nginx
systemctl --no-pager --full status nginx | head -n 12

echo "==> Шаг 2. Настраиваем файрвол"
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw --force enable
  ufw status
else
  echo "ufw не установлен — пропускаем. Откройте порты 22, 80 и 443 в security group."
fi

PUBLIC_IP="$(curl -4 -fsS --max-time 10 icanhazip.com || true)"
SERVER_NAME="${DOMAIN:-${PUBLIC_IP:-_}}"
if [[ -z "${SERVER_NAME}" ]]; then
  SERVER_NAME="_"
fi

echo "==> Шаг 3. Создаём конфигурацию сайта (${SERVER_NAME})"
mkdir -p "${WEB_ROOT}"
if [[ ! -f "${WEB_ROOT}/index.html" ]]; then
  printf '<h1>It works!</h1>\n' > "${WEB_ROOT}/index.html"
fi

cat > "${AVAILABLE}" <<EOF
server {
    listen 80;
    server_name ${SERVER_NAME};

    root ${WEB_ROOT};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

echo "==> Шаг 4. Активируем конфигурацию"
ln -sfn "${AVAILABLE}" "${ENABLED}"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo
echo "Nginx слушает http://${PUBLIC_IP:-<ip>}/"
echo "Ожидаемая страница проверки: <h1>It works!</h1>"

if [[ -z "${DOMAIN}" ]]; then
  echo
  echo "Let's Encrypt пропущен: задайте DOMAIN и EMAIL и запустите скрипт снова."
  echo "Пример: sudo DOMAIN=example.ru EMAIL=you@mail.com $0"
  exit 0
fi

if [[ -z "${EMAIL}" ]]; then
  echo "Для сертификата нужен EMAIL (Let's Encrypt ToS)." >&2
  exit 1
fi

echo "==> Шаг 5. Сертификат Let's Encrypt для ${DOMAIN}"
apt install -y certbot python3-certbot-nginx
certbot --nginx \
  --non-interactive \
  --agree-tos \
  --redirect \
  -m "${EMAIL}" \
  -d "${DOMAIN}"
nginx -t
systemctl reload nginx
systemctl enable --now certbot.timer 2>/dev/null || true

echo
echo "HTTPS: https://${DOMAIN}/"
echo "Проверка обновления: certbot renew --dry-run"
