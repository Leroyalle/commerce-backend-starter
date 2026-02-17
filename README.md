# E-commerce Backend Starter

Репозиторий предназначен для использования как стартовая точка под интернет-магазин.  
Проект предоставляет готовый backend-каркас: пользователи, продукты, заказы, поиск, авторизация (credentials + OAuth), очереди и уведомления.

---

## Stack

- Hono
- Drizzle ORM
- MeiliSearch
- Redis
- BullMQ
- OpenAPI
- Scalar (API documentation UI)
- Docker / Docker Compose

---

## Features

- Auth
  - Credentials (email + password)
  - OAuth (Yandex, GitHub)
  - Access / Refresh tokens
  - Account linking
- Users
- Products + MeiliSearch
- Orders (без оплаты)
- Redis caching
- Background jobs (BullMQ)
  - Admin Telegram notifications
  - User Email notifications
- API documentation
  - OpenAPI specification
  - Interactive documentation via Scalar

---

## Architecture

Модульная структура.

Каждый модуль содержит:

- routes — HTTP слой
- commands — write use cases
- queries — read use cases
- services — бизнес-логика
- repositories — доступ к данным

Модули изолированы друг от друга.  
Общая инфраструктура вынесена отдельно.

---

## Run

### Local (bun)

```bash
bun install
cp .env.example .env
bun run db:push
bun run seed
bun run dev
```
