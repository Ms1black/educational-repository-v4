# TIAR — Tokyo Institute for Advanced Robotics


## Архитектура

```
Browser
  └── nginx :80
        ├── /              → frontend (React, CRA dev server)
        ├── /api/auth/     → auth-service :5000  (Flask, JWT)
        └── /api/data/     → data-service-1 :5001  ┐ Round-robin
                           → data-service-2 :5001  ┘ load balancing
                                    └── PostgreSQL :5432
```

| Сервис | Технологии |
|---|---|
| `frontend` | React 18, Formik, axios |
| `auth-service` | Flask, Flask-JWT-Extended, SQLAlchemy |
| `data-service` | Flask, Flask-JWT-Extended, SQLAlchemy |
| `db` | PostgreSQL 15 |
| `nginx` | reverse proxy + load balancer |

## Быстрый запуск

### Требования

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose

### Запуск

```bash
git clone <repo-url>
cd cr-p-development/hw1

docker-compose up --build
```

Приложение будет доступно по адресу: **http://localhost**

### Остановка

```bash
docker-compose down
```

Удалить вместе с базой данных:

```bash
docker-compose down -v
```

## Переменные окружения

Все переменные задаются в `docker-compose.yml`.

| Переменная | Сервис | Описание |
|---|---|---|
| `DATABASE_URL` | auth, data | Строка подключения к PostgreSQL |
| `JWT_SECRET` | auth, data | Секрет для подписи JWT-токенов |
| `POSTGRES_DB` | db | Имя базы данных |
| `POSTGRES_USER` | db | Пользователь БД |
| `POSTGRES_PASSWORD` | db | Пароль БД |

> Перед деплоем обязательно смените `JWT_SECRET` и `POSTGRES_PASSWORD`.

## Swagger UI

После запуска интерактивная документация доступна по адресам:

| Сервис | URL |
|---|---|
| Auth Service | http://localhost/api/auth/apidocs |
| Data Service | http://localhost/api/data/apidocs |

> Swagger UI позволяет просматривать все эндпоинты и отправлять запросы прямо из браузера без Postman.

Чтобы тестировать защищённые эндпоинты в Swagger:
1. Выполните `POST /login` и скопируйте `token` из ответа
2. Нажмите кнопку **Authorize** в правом верхнем углу
3. Введите значение в формате: `Bearer <token>`
4. Теперь все запросы будут отправляться с JWT-токеном

## API

### Auth Service — `/api/auth`

| Метод | Путь | Тело | Описание |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ username, password }` | Регистрация |
| `POST` | `/api/auth/login` | `{ username, password }` | Вход, возвращает JWT-токен |

Пример ответа на логин:
```json
{ "token": "eyJ...", "username": "john" }
```

### Data Service — `/api/data`

Все эндпоинты требуют заголовок:
```
Authorization: Bearer <token>
```

| Метод | Путь | Тело | Описание |
|---|---|---|---|
| `GET` | `/api/data/lab-works/` | — | Получить все лаб. работы |
| `POST` | `/api/data/lab-works/` | см. ниже | Добавить лаб. работу |
| `DELETE` | `/api/data/lab-works/:id` | — | Удалить лаб. работу |
| `GET` | `/api/data/categories/` | — | Получить категории и статусы |

Тело POST `/api/data/lab-works/`:
```json
{
  "title": "Haptic Feedback System",
  "description": "Description at least 10 chars",
  "category": "Neural Haptics",
  "status": "Not Started",
  "due_date": "2025-12-31"
}
```

Допустимые значения `status`: `Not Started`, `In Progress`, `Completed`

Допустимые значения `category`: `Neural Haptics`, `Kinetic Logic`, `Fluid Dynamics`, `Autonomous Flight`, `Bio-Cybernetics`, `Soft Robotics`

## Структура проекта

```
hw1/
├── auth-service/          # Flask микросервис авторизации
│   ├── blueprints/
│   │   └── auth.py        # /register, /login
│   ├── app.py
│   ├── models.py
│   ├── extensions.py
│   └── requirements.txt
├── data-service/          # Flask микросервис данных
│   ├── blueprints/
│   │   ├── lab_works.py   # CRUD лаб. работ
│   │   └── categories.py  # список категорий
│   ├── app.py
│   ├── models.py
│   ├── extensions.py
│   └── requirements.txt
├── frontend/              # React приложение
│   └── src/
│       ├── app/           # App.jsx, роутинг через state
│       ├── pages/         # LabWorksPage, OverviewPage, AuthPage
│       ├── features/      # Formik-формы
│       ├── entities/      # LabWorkCard, константы
│       ├── widgets/       # AppHeader, AppFooter
│       └── shared/        # axios-клиенты, UI-компоненты
├── nginx/
│   └── nginx.conf         # reverse proxy + load balancing
├── docker-compose.yml
└── setup.md
```
