# 🛒 E-commerce Backend Starter

![Runtime](https://img.shields.io/badge/runtime-bun-black)
![Framework](https://img.shields.io/badge/framework-hono-blue)
![Language](https://img.shields.io/badge/language-typescript-blue)
![Database](https://img.shields.io/badge/database-postgresql-blue)
![ORM](https://img.shields.io/badge/orm-drizzle-orange)
![Cache](https://img.shields.io/badge/cache-redis-red)
![Search](https://img.shields.io/badge/search-meilisearch-orange)
![Queue](https://img.shields.io/badge/queue-bullmq-yellow)
![Docs](https://img.shields.io/badge/docs-openapi-green)
![Docs UI](https://img.shields.io/badge/docs_ui-scalar-purple)
![Container](https://img.shields.io/badge/container-docker-blue)

## Backend starter для разработки интернет-магазина.

Проект предоставляет **готовую серверную инфраструктуру**, чтобы можно было сразу начинать писать бизнес-логику, не тратя время на базовую настройку backend.

В проект уже включены основные компоненты e-commerce системы:

- 🔐 аутентификация пользователей
- 👤 управление пользователями
- 📦 каталог товаров
- 🧾 система заказов
- 🔎 полнотекстовый поиск
- ⚙️ фоновые задачи
- ⚡ кеширование
- 📬 уведомления
- 🤖 Telegram интерфейс для управления товарами
- 📚 API документация

Проект можно использовать как **стартовую точку для backend интернет-магазина**.

---

# 📚 Содержание

- [Обзор](#-обзор)
- [Технологический стек](#-технологический-стек)
- [Функциональность](#-функциональность)
- [Архитектура](#-архитектура)
- [Структура проекта](#-структура-проекта)
- [Документация API](#-документация-api)
- [Quick Start](#-quick-start)
- [Docker](#-docker)

---

# 📖 Обзор

Этот репозиторий представляет собой **готовую backend основу для e-commerce приложения**.

В проекте уже реализованы базовые модули, которые встречаются почти в любом интернет-магазине:

- пользователи и авторизация
- каталог товаров
- заказы
- поиск
- уведомления
- фоновые задачи

Архитектура проекта построена модульно, поэтому новые функции можно добавлять без изменения существующих модулей.

Каждый модуль содержит собственные:

- HTTP маршруты
- use-cases
- слой доступа к данным

---

# 🧰 Технологический стек

### Runtime

- **Bun**
- **Hono**

### Database

- **PostgreSQL**
- **Drizzle ORM**

### Infrastructure

- **Redis**
- **BullMQ**
- **MeiliSearch**

### API

- **OpenAPI**
- **Scalar**

### DevOps

- **Docker**
- **Docker Compose**

---

# ✨ Функциональность

| Модуль      | Описание                           |
| ----------- | ---------------------------------- |
| 🔐 Auth     | Email/password + OAuth             |
| 👤 Users    | Управление пользователями          |
| 📦 Products | Каталог товаров                    |
| 🧾 Orders   | Создание и управление заказами     |
| 🔎 Search   | Поиск товаров через MeiliSearch    |
| ⚡ Cache    | Кеширование через Redis            |
| ⚙️ Jobs     | Фоновые задачи через BullMQ        |
| 🤖 Telegram | Управление товарами через Telegram |
| 📚 API Docs | OpenAPI + Scalar                   |

---

# 🏗 Архитектура

Общий поток обработки запроса:

```text
Client
  │
  ▼
HTTP Routes
  │
  ▼
Commands / Queries
  │
  ├── Repositories
  └── Services
  │
  ▼
PostgreSQL / Redis / MeiliSearch
```

Commands отвечают за операции изменения данных.
Queries используются для получения данных.

---

# 📂 Структура проекта

```text
src
 ├ modules
 │
 │  ├ auth
 │  ├ users
 │  ├ products
 │  └ orders
 │
 │  module structure
 │
 │  ├ routes
 │  ├ commands
 │  ├ queries
 │  ├ services
 │  └ repositories
 │
 ├ infrastructure
 │  ├ database
 │  ├ redis
 │  └ search
 │
 ├ jobs
 │
 └ shared
```

Каждый модуль содержит:

```text
routes
commands
queries
services
repositories
```

Это позволяет держать код модуля изолированным и упрощает развитие проекта.

---

# 📚 Документация API

Проект содержит встроенную API документацию.

### Scalar UI

После запуска сервера документация доступна по адресу:

```
http://localhost:3000/docs
```

Через интерфейс можно:

- просматривать маршруты
- изучать схемы данных
- отправлять тестовые HTTP запросы

---

# ⚡ Quick Start

```bash
git clone https://github.com/Leroyalle/commerce-backend-starter.git

cd commerce-backend-starter

bun install

cp .env.example .env

bun run db:push
bun run seed

bun run dev
```

После запуска:

```
API:  http://localhost:3000
Docs: http://localhost:3000/docs
```

---

# 🐳 Docker

Можно запустить всю инфраструктуру через Docker.

```bash
docker compose up -d
```

Будут подняты сервисы:

- PostgreSQL
- Redis
- MeiliSearch
- API сервер
