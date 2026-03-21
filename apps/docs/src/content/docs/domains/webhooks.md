---
title: Webhooks Domain
description: Outbound HTTP event delivery with URL validation, SSRF protection, and delivery tracking for TypeScript backends — domain model, use cases, ports, and adapters.
---

The `webhooks` domain provides **outbound HTTP event delivery** with URL validation, SSRF protection, and delivery tracking for TypeScript backends. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add webhooks
```

## Domain Model

### Webhook Entity

The `Webhook` entity is the aggregate root. It tracks subscribed events, delivery secret, and active state through guarded mutations.

```typescript
import { Webhook } from "./domains/webhooks/domain/entities/webhook.entity";

const result = Webhook.create({
  id: crypto.randomUUID(),
  url: "https://example.com/hook",
  events: ["user.created", "order.completed"],
  secret: "whsec_abc123",
});

if (result.isOk()) {
  const webhook = result.unwrap();
  console.log(webhook.id, webhook.url.value, webhook.isActive); // true

  webhook.deactivate();
  console.log(webhook.isActive); // false
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `url` | `WebhookUrl` | Validated URL value object (rejects private IPs) |
| `events` | `string[]` | Event types this webhook subscribes to |
| `secret` | `string` | HMAC secret for payload signing |
| `isActive` | `boolean` | Whether the webhook is active |
| `createdAt` | `Date` | Timestamp of creation |

`Webhook.create()` returns `Result<Webhook, InvalidWebhookUrl | Error>`. Empty events arrays are rejected.

**State transitions:**
- `activate()` — marks the webhook as active (fails if already active)
- `deactivate()` — marks the webhook as inactive (fails if already inactive)

### WebhookUrl Value Object

```typescript
import { WebhookUrl } from "./domains/webhooks/domain/value-objects/webhook-url.vo";

const result = WebhookUrl.create("https://example.com/hook");
// Result<WebhookUrl, InvalidWebhookUrl>

if (result.isOk()) {
  const url = result.unwrap();
  console.log(url.value); // "https://example.com/hook"
}
```

Validates: must be a valid HTTPS/HTTP URL. Rejects private and reserved IPs (`127.x.x.x`, `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`, `0.0.0.0`, `169.254.x.x`, `::1`, `fe80:`, `fc00:`, `fd`). Pass `{ allowPrivate: true }` to bypass SSRF checks in development.

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `WebhookNotFound` | No webhook found for the given ID | `Webhook not found with id: "<id>"` |
| `InvalidWebhookUrl` | URL fails format or SSRF validation | `Invalid webhook URL: "<url>"` |
| `WebhookDeliveryFailed` | Delivery returned a non-success status | `Webhook delivery failed: "<reason>"` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `WebhookDelivered` | `TriggerWebhook` use case | `webhookId`, `eventType`, `statusCode`, `occurredAt` |
| `WebhookFailed` | `TriggerWebhook` use case | `webhookId`, `eventType`, `reason`, `occurredAt` |

## Application Layer

### Use Cases

#### RegisterWebhook

Creates a new webhook entity, validates the URL and events, and persists it.

```typescript
import { RegisterWebhook } from "./domains/webhooks/application/use-cases/register-webhook.use-case";

const registerWebhook = new RegisterWebhook(webhookRepository, webhookDelivery);

const result = await registerWebhook.execute({
  url: "https://example.com/hook",
  events: ["user.created"],
  secret: "whsec_abc123",
});
// Result<{ webhookId: string; createdAt: Date }, Error>
```

**Possible failures**: `InvalidWebhookUrl`, empty events

#### TriggerWebhook

Delivers a payload to a webhook endpoint. Only delivers if the webhook subscribes to the given event type.

```typescript
import { TriggerWebhook } from "./domains/webhooks/application/use-cases/trigger-webhook.use-case";

const triggerWebhook = new TriggerWebhook(webhookRepository, webhookDelivery);

const result = await triggerWebhook.execute({
  webhookId: "wh-123",
  eventType: "user.created",
  payload: { userId: "u-1", email: "user@example.com" },
});
// Result<{ deliveredAt: Date; statusCode: number; event: WebhookDelivered }, Error>
```

**Possible failures**: `WebhookNotFound`, `WebhookDeliveryFailed`, event type not subscribed

#### ListWebhooks

Lists webhooks with optional filtering and pagination.

```typescript
import { ListWebhooks } from "./domains/webhooks/application/use-cases/list-webhooks.use-case";

const listWebhooks = new ListWebhooks(webhookRepository, webhookDelivery);

const result = await listWebhooks.execute({ isActive: true, limit: 10, offset: 0 });
// Result<{ webhooks: Array<{ id, url, events, isActive, createdAt }>; total: number }, Error>
```

### Port Interfaces

#### IWebhookRepository

```typescript
export interface IWebhookRepository {
  save(webhook: Webhook): Promise<void>;
  findById(id: string): Promise<Webhook | undefined>;
  findAll(filters: WebhookFilters): Promise<{ webhooks: Webhook[]; total: number }>;
}
```

#### IWebhookDelivery

```typescript
export interface IWebhookDelivery {
  deliver(
    url: string,
    secret: string,
    eventType: string,
    payload: unknown,
  ): Promise<{ statusCode: number }>;
}
```

The delivery port dispatches the HTTP request to the webhook URL. It does not persist.

## Public API (contracts/)

```typescript
import {
  createWebhooksDomain,
  IWebhooksService,
} from "./domains/webhooks/contracts";

const webhooksService: IWebhooksService = createWebhooksDomain({
  webhookRepository,
  webhookDelivery,
});

// IWebhooksService interface:
// register(input): Promise<Result<WebhooksRegisterOutput, Error>>
// trigger(input): Promise<Result<WebhooksTriggerOutput, Error>>
// list(input): Promise<Result<WebhooksListOutput, Error>>
```

This is the only import consumers need. The internal use case classes are implementation details.

## Adapters

### webhooks-prisma

Provides `PrismaWebhookRepository` which implements `IWebhookRepository`.

```bash
npx @backcap/cli add webhooks-prisma
```

```typescript
import { PrismaWebhookRepository } from "./adapters/prisma/webhooks/prisma-webhook-repository";

const webhookRepository = new PrismaWebhookRepository(prisma);
```

Requires a Prisma schema with a `WebhookRecord` model:

```prisma
model WebhookRecord {
  id        String   @id @default(uuid())
  url       String
  events    Json
  secret    String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  @@map("webhooks")
}
```

### webhooks-express

Provides `createWebhooksRouter()` for HTTP access.

```bash
npx @backcap/cli add webhooks-express
```

```typescript
import { createWebhooksRouter } from "./adapters/express/webhooks/webhooks.router";

const router = express.Router();
createWebhooksRouter(webhooksService, router);
app.use(router);
```

**Routes added:**

| Method | Path | Body / Query | Response |
|---|---|---|---|
| `POST` | `/webhooks` | `{ url, events, secret }` | `201 { webhookId, createdAt }` or error |
| `POST` | `/webhooks/:id/trigger` | `{ eventType, payload }` | `200 { deliveredAt, statusCode }` or error |
| `GET` | `/webhooks` | `?isActive=true&limit=10&offset=0` | `200 { webhooks, total }` or error |

**HTTP error mapping:**

| Domain Error | HTTP Status |
|---|---|
| `WebhookNotFound` | `404 Not Found` |
| `InvalidWebhookUrl` | `400 Bad Request` |
| `WebhookDeliveryFailed` | `502 Bad Gateway` |

## File Map

```
domains/webhooks/
  domain/
    entities/webhook.entity.ts
    value-objects/webhook-url.vo.ts
    errors/webhook-not-found.error.ts
    errors/invalid-webhook-url.error.ts
    errors/webhook-delivery-failed.error.ts
    events/webhook-delivered.event.ts
    events/webhook-failed.event.ts
  application/
    use-cases/register-webhook.use-case.ts
    use-cases/trigger-webhook.use-case.ts
    use-cases/list-webhooks.use-case.ts
    ports/webhook-repository.port.ts
    ports/webhook-delivery.port.ts
    dto/register-webhook.dto.ts
    dto/trigger-webhook.dto.ts
    dto/list-webhooks.dto.ts
  contracts/
    webhooks.contract.ts
    webhooks.factory.ts
    index.ts
  shared/
    result.ts
```
