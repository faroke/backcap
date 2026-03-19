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
  // req.userId is available after successful authentication
  res.json({ userId: req.userId });
});

// Protect a group of routes
app.use("/api/protected", authMiddleware);
```

**Behavior:**

- Reads the `Authorization: Bearer <token>` header
- Verifies the token using the `ITokenService` port
- On success: sets `req.userId` and calls `next()`
- On failure: responds with `401 { "error": "Unauthorized" }`

### TypeScript Declaration Augmentation

The middleware adds `userId` to the Express `Request` type. The adapter includes a type augmentation:

```typescript
// Included in auth.middleware.ts
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
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
  res.json({ userId: req.userId });
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

## Testing

The Express adapter tests use a mock `IAuthService` to test the HTTP layer in isolation:

```typescript
describe("createAuthRouter — POST /auth/register", () => {
  it("returns 201 on success", async () => {
    const mockService: IAuthService = {
      register: async () => Result.ok({ userId: "user-1" }),
      login: async () => Result.ok({ token: "tok", userId: "user-1" }),
    };

    const app = express();
    app.use(express.json());
    const router = Router();
    createAuthRouter(mockService, router);
    app.use(router);

    const response = await request(app)
      .post("/auth/register")
      .send({ email: "test@example.com", password: "pass1234" });

    expect(response.status).toBe(201);
    expect(response.body.userId).toBe("user-1");
  });

  it("returns 409 when user already exists", async () => {
    const mockService: IAuthService = {
      register: async () => Result.fail(UserAlreadyExists.create("test@example.com")),
      login: async () => Result.ok({ token: "tok", userId: "user-1" }),
    };

    // ... test setup and assertions
    expect(response.status).toBe(409);
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
