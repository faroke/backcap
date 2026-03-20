---
title: Express Adapter
description: Express.js route and middleware implementations for Backcap capabilities.
---

The Express adapter package provides HTTP route handlers and middleware for Backcap capability service interfaces using [Express.js](https://expressjs.com/). Each adapter wires a capability's public `IService` interface to Express routes.

## Install

Install the Express adapter for a specific capability:

```bash
npx @backcap/cli add auth-express
```

## auth-express

### What Gets Written

```
src/adapters/express/auth/
  auth.router.ts          # createAuthRouter() — POST /auth/register and /auth/login
  auth.middleware.ts      # createAuthMiddleware() — Bearer token verification
  __tests__/
    auth.router.test.ts
    auth.middleware.test.ts
```

### createAuthRouter

Creates and configures an Express router with registration and login routes.

```typescript
import express, { Router } from "express";
import { createAuthRouter } from "./adapters/express/auth/auth.router";
import { authService } from "./container";

const app = express();
app.use(express.json());

const router = Router();
createAuthRouter(authService, router);
app.use(router);
```

**Routes:**

| Method | Path | Request Body | Success Response | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | `{ email: string, password: string }` | `201 { userId: string }` | Register a new user |
| `POST` | `/auth/login` | `{ email: string, password: string }` | `200 { token: string, userId: string }` | Authenticate a user |

**Error responses:**

| Domain Error | HTTP Status | Response Body |
|---|---|---|
| `UserAlreadyExists` | `409 Conflict` | `{ "error": "User already exists with email: ..." }` |
| `InvalidCredentials` | `401 Unauthorized` | `{ "error": "Invalid credentials" }` |
| `UserNotFound` | `401 Unauthorized` | `{ "error": "Invalid credentials" }` |
| `InvalidEmail` | `400 Bad Request` | `{ "error": "Invalid email address: ..." }` |
| Unexpected | `500 Internal Server Error` | `{ "error": "Internal server error" }` |

`UserNotFound` and `InvalidCredentials` both map to `401` with a generic message to avoid leaking information about registered email addresses.

### Function Signature

```typescript
export function createAuthRouter(authService: IAuthService, router: Router): Router
```

The function accepts an `IAuthService` instance and an Express `Router`, registers the routes, and returns the router. This design allows you to:

- Mount the routes at any path by wrapping with `app.use("/api/v1", router)`
- Reuse an existing router with other routes
- Test the routes in isolation by passing a mock `IAuthService`

### createAuthMiddleware

Protects routes by verifying a Bearer token from the `Authorization` header.

```typescript
import { createAuthMiddleware } from "./adapters/express/auth/auth.middleware";

const authMiddleware = createAuthMiddleware(tokenService);

// Protect a specific route
app.get("/profile", authMiddleware, (req, res) => {
  // req.user.userId is available after successful authentication
  res.json({ userId: req.user.userId });
});

// Protect a group of routes
app.use("/api/protected", authMiddleware);
```

**Behavior:**

- Reads the `Authorization: Bearer <token>` header
- Verifies the token using the `ITokenService` port
- On success: sets `req.user = { userId, organizationId? }` and calls `next()`
- On failure: responds with `401 { "error": "..." }`

### TypeScript Request Interface

The middleware defines a local `Request` interface rather than augmenting the global Express namespace. This avoids side effects and keeps the adapter self-contained:

```typescript
// Defined in auth.middleware.ts
interface Request {
  headers: Record<string, string | undefined>;
  user?: { userId: string; organizationId?: string };
}
```

### Wiring Example

Complete example wiring auth routes and middleware:

```typescript
// src/app.ts
import express, { Router } from "express";
import { createAuthRouter } from "./adapters/express/auth/auth.router";
import { createAuthMiddleware } from "./adapters/express/auth/auth.middleware";
import { authService, tokenService } from "./container";

const app = express();
app.use(express.json());

// Auth routes (public)
const authRouter = Router();
createAuthRouter(authService, authRouter);
app.use(authRouter);

// Protected routes
const authMiddleware = createAuthMiddleware(tokenService);
app.get("/me", authMiddleware, (req, res) => {
  res.json({ userId: req.user.userId });
});

export default app;
```

## Writing Additional Express Adapters

When a new capability needs an Express HTTP layer:

1. Create the file at `src/adapters/express/<capability>/<name>.router.ts`
2. Import the public service interface from `../../capabilities/<capability>/contracts`
3. Import domain error classes from `../../capabilities/<capability>/domain/errors/`
4. Write a `createXxxRouter(service: IService, router: Router): Router` function
5. Map domain errors to HTTP status codes using a `toHttpError()` helper
6. Write route handler tests using a mock service

See the [Create an Adapter guide](/backcap/guides/create-adapter) for a detailed walkthrough.

## Capability Support

19 out of 20 capabilities ship with Express adapters. The `search` capability has no Express adapter because it defines its own search-engine port instead.

## Testing

The Express adapter tests use mock router and response objects (via `vi.fn()`) to test the HTTP layer in isolation — no real Express server is started:

```typescript
function createMockRouter() {
  const handlers = new Map<string, Function>();
  return {
    post: vi.fn((path: string, handler: Function) => handlers.set(path, handler)),
    getHandler: (path: string) => handlers.get(path)!,
  };
}

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function createMockAuthService() {
  return {
    register: vi.fn(),
    login: vi.fn(),
  };
}

describe("auth.router", () => {
  it("POST /auth/register returns 201 on success", async () => {
    const authService = createMockAuthService();
    authService.register.mockResolvedValue(Result.ok({ userId: "user-1" }));
    const router = createMockRouter();
    createAuthRouter(authService, router as any);

    const handler = router.getHandler("/auth/register");
    const res = createMockRes();
    await handler({ body: { email: "a@b.com", password: "pass1234" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ userId: "user-1" });
  });
});
```

## Dependencies

The Express adapter uses duck-typed interfaces for the `Router` and `Request`/`Response` objects rather than importing directly from the `express` package. This means the adapter file itself has no `express` npm dependency.

You will need `express` and `@types/express` in your project:

```bash
pnpm add express
pnpm add -D @types/express
```
