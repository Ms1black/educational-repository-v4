# Лабораторная работа 6 (Flask + FSD React)

## Что изменено

- Серверная часть переписана с PHP на Flask.
- Сохранены совместимые URL для фронта:
  - `api.php` (JSON API),
  - `admin.php` (страница админки),
  - `humanoid.php` (страница проекта и download JSON).
- Логика разделена по MVC на сервере:
  - контроллеры (`app/controllers`),
  - модели/репозитории (`app/models`),
  - сервисный слой (`app/services`),
  - шаблоны представлений (`templates`).
- Фронтенд `admin.php` переведен на React и разложен по FSD-слоям:
  - `frontend/shared`,
  - `frontend/entities`,
  - `frontend/features`,
  - `frontend/widgets`,
  - `frontend/pages`,
  - `frontend/app`.
- HTTP-клиент: встроенный `fetch` (без сторонних JS-библиотек).
- Файловое хранилище осталось прежним:
  - `storage/users.json`,
  - `storage/records.json`,
  - `storage/labs.json`,
  - `data/ghost-01.json`.

## Структура проекта

- `run.py` — точка входа Flask.
- `app/__init__.py` — фабрика приложения.
- `app/controllers/api_controller.py` — `api.php`, `/api/*`, `openapi.json`.
- `app/controllers/page_controller.py` — `admin.php`, `humanoid.php`, `docs`.
- `templates/admin.html` — подключение React+FSD frontend.
- `templates/docs.html` — Swagger UI.
- `frontend/*` — FSD-frontend для админки.

## Запуск

```bash
cd "/Users/osmuskadrevnihrusov./Desktop/educational-repository-v4/cr-p-development/lab6"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

Открыть:

- `http://127.0.0.1:5000/index.html` — основной сайт.
- `http://127.0.0.1:5000/admin.php` — вход/регистрация и админка.
- `http://127.0.0.1:5000/humanoid.php` — страница лабораторной.
- `http://127.0.0.1:5000/docs` — API документация (Swagger UI).

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
8. В `humanoid.php` добавить запись и проверить скачивание `ghost-01.json`.
9. Проверить API:
   - `GET /api.php?action=status`
   - `GET /api.php?action=labs_public`
   - `GET /api/status`
   - `GET /openapi.json`

## Соответствие требованиям React-ЛР

- Есть функциональные компоненты (`AuthPanel`, `AdminPanel`, `AdminPage`).
- Есть компонент на основе класса (`LabNavigatorClass`).
- Есть 2 части с переключением через state (`activePart`: auth/admin).
- Используются вложенные компоненты с передачей props.
- Применен условный рендеринг (`activePart === ...`, `showAdmin`).
