# Hono Blog Example

A working blog API built with [Backcap](https://github.com/faroke/backcap) — demonstrating capabilities, adapters, bridges, and the CLI end-to-end with Hono.

## What's Inside

- **Blog capability** — CRUD operations for blog posts (create, publish, get, list)
- **Search capability** — Document indexing and full-text search
- **Blog-Search bridge** — Automatically indexes posts in search when published
- **Prisma adapter** — SQLite persistence via Prisma ORM
- **Hono adapter** — HTTP routes via Hono's lightweight, edge-ready pattern

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

# 2. Install blog capability (detects Hono + Prisma adapters)
npx @backcap/cli add blog

# 3. Install search capability
npx @backcap/cli add search

# 4. Install blog-search bridge
npx @backcap/cli add blog-search

# 5. Set up Prisma
npx prisma migrate dev --name init

# 6. Wire everything in src/server.ts
```

## Hono vs Express vs Fastify

This example validates that Backcap adapters are truly swappable:

- **Domain and application layers are identical** — same capability code as the Express and Fastify examples
- **Only the HTTP adapter and server wiring differ** — Hono uses sub-apps (`app.route()`) instead of Express routers or Fastify plugins
- **The Hono adapter** exports `createBlogRoutes()` which registers routes on a Hono-like app instance
- **Edge-ready** — Hono's adapter uses no Node-specific APIs; the adapter can run on Node, Bun, Deno, or Cloudflare Workers

## Multi-Runtime Support

Hono is designed for multiple runtimes. This example uses Node.js with `@hono/node-server`:

| Runtime | Status | Notes |
|---------|--------|-------|
| Node.js | Tested | Requires `@hono/node-server` |
| Bun | Not tested | Should work with `Bun.serve({ fetch: app.fetch })` |
| Deno | Not tested | Should work with `Deno.serve(app.fetch)` |

## Running Tests

```bash
pnpm test
```

## Project Structure

```
examples/hono-blog/
├── src/
│   ├── server.ts                          # Application entry point (Hono + Node)
│   ├── capabilities/
│   │   ├── blog/                          # Blog capability (installed by CLI)
│   │   │   ├── domain/                    # Entities, value objects, events
│   │   │   ├── application/               # Use cases, DTOs, ports
│   │   │   └── contracts/                 # Service interface & factory
│   │   └── search/                        # Search capability (installed by CLI)
│   ├── adapters/
│   │   ├── http/hono/blog/               # Hono routes
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

See [FRICTION.md](./FRICTION.md) for a detailed log of every issue encountered during development and the fixes applied.
