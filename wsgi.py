# -*- coding: utf-8 -*-
"""Точка входа для WSGI-сервера (Gunicorn/uWSGI) на боевом сервере.

Локальный запуск по-прежнему делается через `python app.py`.
Пример запуска в проде:

    gunicorn --workers 2 --bind 127.0.0.1:8000 --access-logfile /dev/null --error-logfile /dev/null --log-level critical wsgi:application
"""

from app import app as application

# Некоторые панели управления ожидают имя `app`.
app = application

if __name__ == "__main__":
    # Прямой запуск файла нужен только для отладки; в проде используйте Gunicorn.
    application.run(host="127.0.0.1", port=8000, debug=False)
