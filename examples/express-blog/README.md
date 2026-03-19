# Express Blog Example

A working blog API built with [Backcap](https://github.com/faroke/backcap) — demonstrating capabilities, adapters, bridges, and the CLI end-to-end.

## What's Inside

- **Blog capability** — CRUD operations for blog posts (create, publish, get, list)
- **Search capability** — Document indexing and full-text search
- **Blog-Search bridge** — Automatically indexes posts in search when published
- **Prisma adapter** — SQLite persistence via Prisma ORM
- **Express adapter** — HTTP routes (wired inline in this example)

## Prerequisites

- Node.js 20+
- pnpm 9+

## Setup

```bash
# Install dependencies
pnpm install

# Set up the database
npx prisma migrate dev --name init

# Start the development server
pnpm dev
```

The server starts at `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/posts` | Create a blog post |
| `GET` | `/api/posts` | List all posts |
| `GET` | `/api/posts/:id` | Get a single post |
| `PUT` | `/api/posts/:id/publish` | Publish a draft post |
| `GET` | `/api/search?q=...` | Search published posts |

## Usage

```bash
# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello Backcap", "content": "My first post!", "authorId": "user-1"}'

# List posts
curl http://localhost:3000/api/posts

# Publish (replace POST_ID with actual ID)
curl -X PUT http://localhost:3000/api/posts/POST_ID/publish

# Search (works after publishing)
curl "http://localhost:3000/api/search?q=backcap"
```

## How It Was Built

This example was built step-by-step using the Backcap CLI:

```bash
# 1. Initialize Backcap config
npx @backcap/cli init

# 2. Install blog capability (detects Express + Prisma adapters)
npx @backcap/cli add blog

# 3. Install search capability
npx @backcap/cli add search

# 4. Install blog-search bridge
npx @backcap/cli add blog-search

# 5. Set up Prisma
npx prisma init --datasource-provider sqlite
# Copy Post model from src/adapters/persistence/prisma/blog/blog.schema.prisma
npx prisma migrate dev --name init

# 6. Wire everything in src/server.ts
```

## Running Tests

```bash
pnpm test
```

## Project Structure

```
examples/express-blog/
├── src/
│   ├── server.ts                          # Application entry point
│   ├── capabilities/
│   │   ├── blog/                          # Blog capability (installed by CLI)
│   │   │   ├── domain/                    # Entities, value objects, events
│   │   │   ├── application/               # Use cases, DTOs, ports
│   │   │   └── contracts/                 # Service interface & factory
│   │   └── search/                        # Search capability (installed by CLI)
│   ├── adapters/
│   │   ├── http/express/blog/             # Express routes (installed by CLI)
│   │   ├── persistence/prisma/blog/       # Prisma repository (installed by CLI)
│   │   └── in-memory-search-engine.ts     # In-memory search for demo
│   ├── bridges/
│   │   └── blog-search/                   # Blog→Search bridge (installed by CLI)
│   ├── shared/                            # Event bus, Result type, Bridge interface
│   └── __tests__/                         # Tests
├── prisma/
│   └── schema.prisma                      # Database schema
├── backcap.json                           # Backcap configuration
├── FRICTION.md                            # Friction points encountered & fixes
└── package.json
```

## Friction Points

See [FRICTION.md](./FRICTION.md) for a detailed log of every issue encountered during development and the fixes applied to the Backcap codebase.
