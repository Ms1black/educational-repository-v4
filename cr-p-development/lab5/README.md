# Лабораторная работа 5 (Flask + MVC)

## Что изменено

- Серверная часть переписана с PHP на Flask.
- Основные URL переведены на clean paths:
  - `api` (JSON API),
  - `admin` (страница админки),
  - `humanoid` (страница проекта и download JSON).
- Алиасы `*.php` сохранены для обратной совместимости.
- Логика разделена по MVC:
  - контроллеры (`app/controllers`),
  - модели/репозитории (`app/models`),
  - сервисный слой (`app/services`),
  - шаблоны представлений (`templates`).
- Файловое хранилище осталось прежним:
  - `storage/users.json`,
  - `storage/records.json`,
  - `storage/labs.json`,
  - `data/ghost-01.json`.

## Структура серверной части

- `run.py` — точка входа Flask.
- `app/__init__.py` — фабрика приложения.
- `app/controllers/api_controller.py` — API-роут `api` (+ legacy alias `api.php`).
- `app/controllers/page_controller.py` — страницы `admin`/`humanoid` (+ legacy aliases `*.php`).
- `app/models/repositories.py` — JSON-репозитории.
- `app/services/*` — бизнес-логика и валидация.
- `templates/humanoid.html` — Jinja2-представление для страницы проекта.

## Запуск

```bash
cd "/Users/osmuskadrevnihrusov./Desktop/educational-repository-v4/cr-p-development/lab5"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

Открыть:

- `http://127.0.0.1:5000/index.html` — основной сайт.
- `http://127.0.0.1:5000/admin` — вход/регистрация и админка.
- `http://127.0.0.1:5000/humanoid` — страница лабораторной.
- `http://127.0.0.1:5000/docs` — Swagger UI.
- `http://127.0.0.1:5000/openapi.json` — OpenAPI-спецификация.

## Как проверить

1. Открыть `index.html`, убедиться, что сайт отображается корректно.
2. Перейти в `ADMIN`.
3. Зарегистрировать `admin` (первый `admin` получает роль администратора).
4. Выполнить вход под `admin`.
5. Добавить лабораторную и выбрать изображение.
6. Проверить, что:
   - запись появилась в таблице админки;
   - файл изображения появился в `img/`;
   - данные сохранены в `storage/labs.json`.
7. Открыть `labs.html` и убедиться, что новая карточка отображается.
8. В `humanoid` добавить запись и проверить скачивание `ghost-01.json`.
