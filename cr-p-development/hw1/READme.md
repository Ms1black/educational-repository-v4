# ДЗ — Разработка микросервисов (TIAR)

Сайт Tokyo Institute of Advanced Robotics — два раздела: Laboratories и Research Projects.

## Запуск

```bash
docker-compose up --build
```

Открыть: http://localhost

## Структура

```
hw1/
├── docker-compose.yml
├── nginx/
│   ├── Dockerfile          # multi-stage: build React → nginx
│   └── nginx.conf          # static files + reverse proxy + балансировка
├── frontend/               # ReactJS (Formik, axios, react-bootstrap)
│   ├── package.json
│   ├── public/index.html
│   └── src/
│       ├── App.jsx         # навигация через state (2 страницы)
│       ├── api/client.js   # axios instances (authClient, dataClient)
│       └── components/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── LabsPage.jsx       # таблица + форма Formik
│           └── ResearchPage.jsx   # таблица + форма Formik
├── auth-service/           # Flask — JWT авторизация
│   ├── app.py
│   ├── models.py           # User
│   └── blueprints/auth.py  # /register  /login
└── data-service/           # Flask — данные (2 blueprint'а)
    ├── app.py
    ├── models.py            # Lab, Research
    └── blueprints/
        ├── labs.py          # GET/POST/DELETE /labs/
        └── research.py      # GET/POST/DELETE /research/
```

## Соответствие требованиям

| Требование | Реализация |
|---|---|
| ReactJS | `frontend/src/` |
| Flask + blueprints | `auth-service/blueprints/`, `data-service/blueprints/` |
| nginx (только статика) | `nginx/nginx.conf` — `location /` отдаёт `build/` |
| Авторизация / регистрация | JWT через `auth-service` |
| PostgreSQL | сервис `db` в docker-compose |
| 2 смысловых раздела (state) | `App.jsx` — `page` state |
| Таблица + добавление | `LabsPage.jsx`, `ResearchPage.jsx` |
| Formik | все формы |
| axios | `api/client.js` |
| Обратное проксирование | `nginx.conf` — `proxy_pass` |
| Балансировка нагрузки | `upstream data_backend` (2 инстанса) |
| docker-compose | `docker-compose.yml` |
| Отдельный микросервис JWT | `auth-service/` |
