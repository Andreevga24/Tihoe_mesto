# -*- coding: utf-8 -*-
"""
The Quiet Place Project — клон.
Точка входа Flask-приложения.

ГЛАВНЫЙ ПРИНЦИП: полная приватность.
Сервер отдаёт только страницы и статические ресурсы. Текст пользователя
обрабатывается только в браузере: здесь нет POST-маршрутов, базы данных,
cookies, аналитики и логирования тел запросов.
"""

import logging

from flask import Flask, abort, redirect, render_template, request, url_for

from i18n import DEFAULT_LANGUAGE, LANGUAGES, LANGUAGE_NAMES, TRANSLATIONS

app = Flask(__name__)
app.logger.disabled = True
app.config.update(
    SEND_FILE_MAX_AGE_DEFAULT=0,
    TEMPLATES_AUTO_RELOAD=True,
)

# Страницы используют общие шаблоны с локализованным содержимым.
PAGES = {
    "quiet": {"template": "quiet.html"},
    "thoughts": {"template": "thoughts.html"},
    "comfort": {"template": "comfort.html"},
    "dawn": {"template": "dawn.html"},
}

# Темы живут в адресе, как и язык: сервер не запоминает выбор пользователя.
THEMES = ("dark", "light")
DEFAULT_THEME = "dark"


@app.after_request
def add_privacy_headers(response):
    """Заголовки приватности и запрет кэширования на каждый ответ."""
    response.headers["X-No-Data-Collection"] = "true"
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "interest-cohort=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; img-src 'self' data:; media-src 'self' blob:; "
        "style-src 'self'; script-src 'self'; connect-src 'none'; "
        "form-action 'none'; frame-ancestors 'none'; base-uri 'none'"
    )
    return response


@app.route("/")
def index():
    """Выбирает язык браузера, не записывая его в cookie или хранилище."""
    language = request.accept_languages.best_match(LANGUAGES) or DEFAULT_LANGUAGE
    return redirect(
        url_for("localized_page", language=language, theme=DEFAULT_THEME, room="quiet"),
        code=302,
    )


@app.route("/<room>")
def legacy_room(room):
    """Перенаправляет старые адреса на английскую локаль и тёмную тему."""
    if room not in PAGES:
        abort(404)
    return redirect(
        url_for("localized_page", language=DEFAULT_LANGUAGE, theme=DEFAULT_THEME, room=room),
        code=301,
    )


@app.route("/<language>/<room>")
def localized_room(language, room):
    """Совместимость с адресами без темы: они открываются в тёмной теме."""
    if language not in LANGUAGES or room not in PAGES:
        abort(404)
    return redirect(
        url_for("localized_page", language=language, theme=DEFAULT_THEME, room=room),
        code=301,
    )


@app.route("/<language>/<theme>/<room>")
def localized_page(language, theme, room):
    """Отдаёт комнату на одном из поддерживаемых языков и в выбранной теме."""
    if language not in LANGUAGES or room not in PAGES:
        abort(404)
    if theme not in THEMES:
        abort(404)

    translation = TRANSLATIONS[language]
    page = {
        **PAGES[room],
        **translation[room],
        "tab": room,
    }
    language_options = [
        {
            "code": code,
            "name": LANGUAGE_NAMES[code],
            "href": url_for("localized_page", language=code, theme=theme, room=room),
            "current": code == language,
        }
        for code in LANGUAGES
    ]
    theme_options = [
        {
            "code": name,
            "name": translation["themes"][name],
            "href": url_for("localized_page", language=language, theme=name, room=room),
            "current": name == theme,
        }
        for name in THEMES
    ]
    return render_template(
        page["template"],
        page=page,
        nav=tuple(PAGES),
        current=room,
        language=translation,
        language_code=language,
        language_options=language_options,
        theme=theme,
        theme_options=theme_options,
    )


if __name__ == "__main__":
    # Отключаем журнал запросов, чтобы не записывать историю посещений.
    logging.getLogger("werkzeug").disabled = True
    app.run(host="127.0.0.1", port=5000, debug=False)
