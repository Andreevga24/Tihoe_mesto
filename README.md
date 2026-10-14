# The Quiet Place Project — тихое пространство без сбора данных

Небольшой локальный клон четырёх комнат проекта [The Quiet Place Project](https://thequietplaceproject.com), созданного Amitay Tweeto. Он сделан для моментов, когда хочется немного тишины, выписать мысли или получить мягкую поддержку.

## Философия и приватность

Приватность — основной принцип приложения. Текст в комнатах Thoughts и Comfort обрабатывается только в JavaScript внутри текущей вкладки браузера. Сервер не получает написанное, приложение не хранит его между сессиями и не использует базы данных, cookies, аналитику, внешние CDN, сторонние JS-библиотеки или шрифты. Язык и тема задаются URL, а не cookie или localStorage. Нет POST-маршрутов и HTML-форм для отправки текста. Сервер выдаёт только страницы и статические ресурсы.

Перед запуском можно проверить: локализованные GET-маршруты `/<язык>/<тема>/<комната>` отдают четыре комнаты. Корень `/` выбирает язык по заголовку браузера `Accept-Language`, при неизвестном языке использует английский; тема по умолчанию тёмная. Старые адреса `/quiet`, `/thoughts`, `/comfort`, `/dawn` и `/<язык>/<комната>` перенаправляют на тёмные версии. На каждый ответ добавляются `X-No-Data-Collection: true` и `Cache-Control: no-store`. Логи запросов отключены.

> Этот проект — самостоятельная реализация вдохновлённой оригиналом идеи, а не официальный сайт. Не вводите в браузер информацию, если устройство или сам браузер небезопасны: приложение не отправляет её серверу, но не защищает от программ, имеющих доступ к устройству.

## Языки и комнаты

Полный интерфейс — заголовки, навигация, подсказки, поддерживающие фразы и доступные подписи — доступен на английском, французском и русском. Переключатель EN / FR / RU находится в левом верхнем углу. Основное меню со ссылками на все четыре комнаты закреплено сверху и всегда видно; на мобильных устройствах ссылки расположены в две колонки. При прокрутке появляется кнопка возврата наверх. Язык и тема комнаты зафиксированы прямо в URL и сохраняются при переходах между комнатами, без cookies или browser storage.

- Тёмная тема: `/en/dark/quiet`, `/fr/dark/thoughts`, `/ru/dark/comfort` и другие сочетания.
- Светлая тема: `/en/light/quiet`, `/fr/light/thoughts`, `/ru/light/comfort` и другие сочетания.

Все четыре комнаты доступны во всех шести сочетаниях языка и темы (24 адреса). Тема по умолчанию — тёмная; переключатель ☾ / ☼ находится справа сверху. Корень `/` выбирает доступный язык из `Accept-Language`; если браузер не запрашивает английский, французский или русский, открывается английская версия в тёмной теме. Названия комнат проекта остаются переведёнными в меню каждой локали.

- **The Quiet Place** — короткие спокойные фразы по пробелу, музыка запускается после первого действия пользователя.
- **The Thoughts Room** — поле для свободной записи и локальная анимация растворения отдельных букв на Canvas. `Enter` добавляет строку, `Shift+Enter` запускает растворение.
- **The Comfort Spot** (`/en/dark/comfort`) — приватная заметка и кнопка `release`, после которой появляется поддерживающая фраза.
- **The Dawn Room** — медленно меняющаяся тёмно-синяя палитра и чередующиеся ободряющие фразы.

Уважена настройка `prefers-reduced-motion`; интерфейс адаптируется для небольших экранов и доступен с клавиатуры.

## Запуск локально

Требуется Python 3.10 или новее. Из корня проекта выполните:

```bash
python -m venv .venv
```

Активируйте виртуальное окружение:

- Windows PowerShell: `.venv\\Scripts\\Activate.ps1`
- macOS/Linux: `source .venv/bin/activate`

Установите единственную зависимость и запустите приложение:

```bash
python -m pip install -r requirements.txt
python app.py
```

Откройте <http://localhost:5000>. Сервер привязан к `127.0.0.1`; для локального использования это намеренное значение.

## Деплой на Ubuntu VPS с собственным доменом

Ниже — публикация для домена **gagroup24.ru** (ресурсы: `194.226.122.180`), репозиторий — `https://github.com/Andreevga24/Tihoe_mesto.git`. Готовые файлы лежат в `deploy/`, значения уже подставлены.

### 1. DNS и сеть

1. У регистратора добавьте DNS-записи `A` для `@` и `www`, указывающие на `194.226.122.180`. Запись `AAAA` добавляйте только если на VPS правильно настроен IPv6.
2. Откройте входящие порты 80 и 443. Оставьте SSH-порт открытым, чтобы не потерять доступ. Для UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

Включайте UFW только после проверки SSH-доступа и правил провайдера VPS. DNS должен разрешаться на адрес сервера до выпуска сертификата.

### 2. Установка и приложение

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip git nginx certbot
```

Репозиторий для этой инструкции уже указан: `https://github.com/Andreevga24/Tihoe_mesto.git`. Скрипт `deploy/deploy.sh` запускается после первичного клонирования и обновляет его при следующих запусках. Для приватного репозитория настройте SSH deploy key, не вставляйте GitHub-токен в скрипт или публичные файлы.

```bash
sudo mkdir -p /srv/quietplace
sudo chown "$USER":www-data /srv/quietplace
git clone https://github.com/Andreevga24/Tihoe_mesto.git /srv/quietplace
cd /srv/quietplace
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pip install gunicorn
```

Корневой `requirements.txt` сохраняет Flask как единственную зависимость приложения; Gunicorn устанавливается отдельно только как production WSGI-сервер. Дайте системной службе доступ на чтение и проход каталогов:

```bash
sudo chgrp -R www-data /srv/quietplace
sudo chmod -R g+rX /srv/quietplace
```

### 3. Служба Gunicorn

`deploy/quietplace.service` уже привязывает Gunicorn к `127.0.0.1:8000` и отключает access/error/stdout логи, содержащие сведения о запросах. Скопируйте его и проверьте каталог и пользователя (`www-data`, `/srv/quietplace`):

```bash
sudo cp deploy/quietplace.service /etc/systemd/system/quietplace.service
sudo systemctl daemon-reload
sudo systemctl enable --now quietplace
curl --fail http://127.0.0.1:8000/en/dark/quiet
```

### 4. Nginx и HTTPS

Сначала создайте каталог для ACME challenge и установите временный HTTP-only конфиг:

```bash
sudo mkdir -p /var/www/certbot
sudo cp deploy/nginx-bootstrap.conf /etc/nginx/sites-available/quietplace
```

В `/etc/nginx/sites-available/quietplace` уже указан домен `gagroup24.ru`; проверьте, что он остался на месте, включите сайт и выпустите сертификат:

```bash
sudo ln -s /etc/nginx/sites-available/quietplace /etc/nginx/sites-enabled/quietplace
sudo nginx -t
sudo systemctl reload nginx
sudo certbot certonly --webroot -w /var/www/certbot -d gagroup24.ru -d www.gagroup24.ru
```

Если `www.gagroup24.ru` не будете использовать, уберите его из `server_name` в обоих конфигах и из команды certbot. После выдачи сертификата замените временный файл полным HTTPS-конфигом:

```bash
sudo cp deploy/nginx-quietplace.conf /etc/nginx/sites-available/quietplace
sudo nginx -t && sudo systemctl reload nginx
sudo certbot renew --dry-run
```

Полный конфиг перенаправляет HTTP на HTTPS и проксирует сайт на `127.0.0.1:8000`. Пути сертификата — `/etc/letsencrypt/live/gagroup24.ru/...`; при смене домена поправьте их и `server_name`.

### 5. Отключение журналов запросов

В конфиге сайта access-логи Nginx отключены, ошибки направлены в `/dev/null`; Gunicorn также не пишет access/error-логи. Чтобы отключить access-логи и error-логи всех Nginx-сайтов на VPS, установите глобальный фрагмент:

```bash
sudo cp deploy/nginx-no-request-logs.conf /etc/nginx/conf.d/quietplace-no-request-logs.conf
sudo nginx -t && sudo systemctl reload nginx
```

Это снижает возможности диагностики. Фрагмент `conf.d` отключает журнал по умолчанию; если другие Nginx-сайты задают `access_log` в собственных `server`-блоках, удалите эти переопределения. Журналы самого VPS, DNS-провайдера и сетевой инфраструктуры провайдера находятся вне контроля приложения. Не включайте access-логи в других reverse proxy/CDN/панелях, если политика требует полностью не записывать запросы.

### 6. Обновление

После загрузки коммита в ветку `main` обновите сайт из `/srv/quietplace`:

```bash
bash deploy/deploy.sh
```

Скрипт использует remote репозитория `origin` из этой копии, ждёт DNS A-запись `gagroup24.ru → 194.226.122.180`, делает fast-forward pull (не удаляет локальные изменения), обновляет виртуальное окружение, устанавливает production-only Gunicorn, проверяет Python и перезапускает systemd-службу. Для другой ветки задайте `BRANCH=имя-ветки`.

Если репозиторий приватный, добавьте на сервере deploy-ключ и используйте SSH-адрес `git@github.com:Andreevga24/Tihoe_mesto.git`.

Первое развёртывание удобно сделать так:

```bash
sudo mkdir -p /srv/quietplace
sudo chown "$USER":www-data /srv/quietplace
cd /srv/quietplace
git clone https://github.com/Andreevga24/Tihoe_mesto.git .
bash deploy/deploy.sh
```

Не включайте Flask debug mode. Не добавляйте формы, POST-маршруты, стороннюю аналитику, CDN или мониторинг. Все языки и темы передаются в URL; текст остаётся в браузере.

## Аудио

В `static/audio/quiet-piano.mp3` размещается единственный аудиофайл для страниц Quiet и Thoughts. В этой сборке включён небольшой самостоятельно синтезированный мелодический луп; это не запись Marc Teichert и не его композиция. Оригинал использовал музыку Marc Teichert; здесь не распространяются его защищённые авторским правом композиции. Заменить файл можно на свой легально приобретённый MP3 с тем же именем. Громкость выставлена на 0.2, автозапуск отсутствует, а при уходе со страницы воспроизведение останавливается.

## Структура

```text
app.py
i18n.py
wsgi.py
requirements.txt
README.md
PROGRESS.md
deploy/
  quietplace.service
  nginx-bootstrap.conf
  nginx-quietplace.conf
  nginx-no-request-logs.conf
  deploy.sh
templates/
  base.html
  quiet.html
  thoughts.html
  comfort.html
  dawn.html
static/
  css/style.css
  js/base.js
  js/quiet.js
  js/thoughts.js
  js/comfort.js
  js/dawn.js
  audio/quiet-piano.mp3
```
