#!/usr/bin/env bash
# Обновление кода на боевом сервере (gagroup24.ru, 194.226.122.180).
# Запуск после первичного git clone: bash deploy/deploy.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/srv/quietplace}"
SERVICE="${SERVICE:-quietplace}"
BRANCH="${BRANCH:-main}"
VENV_DIR="$APP_DIR/.venv"

if [ ! -d "$APP_DIR/.git" ]; then
    echo "В $APP_DIR нет git-репозитория. Сначала выполните git clone из README.md." >&2
    exit 1
fi
cd "$APP_DIR"

# Проверяем, что публичная DNS-запись уже указывает на этот VPS.
dns_matches="$(getent ahostsv4 gagroup24.ru | awk '$1 == "194.226.122.180" {print $1}' || true)"
if [ -z "$dns_matches" ]; then
    echo "DNS gagroup24.ru ещё не указывает на 194.226.122.180; настройте A-запись и повторите." >&2
    exit 1
fi

# Обновляем только fast-forward; локальные изменения скрипт не удаляет.
git fetch origin "$BRANCH"
git pull --ff-only origin "$BRANCH"

# Виртуальное окружение приложения.
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
fi
"$VENV_DIR/bin/python" -m pip install --upgrade pip
"$VENV_DIR/bin/python" -m pip install --requirement "$APP_DIR/requirements.txt"
# Gunicorn нужен только production-серверу и не добавлен к зависимостям приложения.
"$VENV_DIR/bin/python" -m pip install gunicorn

# Доступ службы www-data к файлам проекта.
sudo chgrp -R www-data "$APP_DIR"
sudo chmod -R g+rX "$APP_DIR"

# Проверка синтаксиса и перезапуск службы.
"$VENV_DIR/bin/python" -m py_compile "$APP_DIR/app.py" "$APP_DIR/i18n.py" "$APP_DIR/wsgi.py"
sudo systemctl restart "$SERVICE"
sudo systemctl --no-pager --lines=5 status "$SERVICE" || true

# Проверка домена и локального WSGI-сервера.
curl --fail --silent --show-error --output /dev/null --write-out 'https://gagroup24.ru HTTP %{http_code}\n' https://gagroup24.ru/en/dark/quiet || true
curl --fail --silent --show-error --output /dev/null --write-out 'локальный Gunicorn HTTP %{http_code}\n' http://127.0.0.1:8000/en/dark/quiet
