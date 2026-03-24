---
name: backcap-webhooks
description: Webhooks domain for Backcap — domain-first clean architecture for outbound HTTP event delivery. Provides webhook registration, triggering with delivery tracking, URL validation with private IP rejection, and configurable delivery providers. Use when building webhook integrations, event-driven HTTP notifications, or third-party callback systems.
metadata:
  author: backcap
  version: 0.1.0
---

# Webhooks Domain

## Domain Map

```
domains/webhooks/
├── domain/
│   ├── entities/webhook.entity.ts       → Webhook (id, url, events, secret, isActive, createdAt)
│   ├── value-objects/webhook-url.vo.ts  → WebhookUrl (validates URL, rejects private IPs)
│   ├── events/
│   │   ├── webhook-delivered.event.ts   → WebhookDelivered (webhookId, eventType, statusCode)
│   │   └── webhook-failed.event.ts      → WebhookFailed (webhookId, eventType, reason)
│   ├── errors/
│   │   ├── webhook-not-found.error.ts
│   │   ├── invalid-webhook-url.error.ts
│   │   └── webhook-delivery-failed.error.ts
│   └── __tests__/
├── application/
│   ├── use-cases/
│   │   ├── register-webhook.use-case.ts → RegisterWebhook
│   │   ├── trigger-webhook.use-case.ts  → TriggerWebhook
│   │   └── list-webhooks.use-case.ts    → ListWebhooks
│   ├── dto/
│   │   ├── register-webhook.dto.ts
│   │   ├── trigger-webhook.dto.ts
│   │   └── list-webhooks.dto.ts
│   ├── ports/
│   │   ├── webhook-delivery.port.ts     → IWebhookDelivery
│   │   └── webhook-repository.port.ts   → IWebhookRepository
│   └── __tests__/
├── contracts/
│   ├── webhooks.contract.ts             → IWebhooksService
│   ├── webhooks.factory.ts              → createWebhooksDomain()
│   └── index.ts
└── shared/result.ts
```

## Extension Guide

### Adding a new use case

1. Create DTO in `application/dto/your-use-case.dto.ts` with Input/Output interfaces
2. Create use case in `application/use-cases/your-use-case.use-case.ts`
   - Constructor accepts ports (IWebhookRepository, IWebhookDelivery)
   - `execute()` returns `Promise<Result<Output, Error>>`
3. Add tests in `application/__tests__/your-use-case.use-case.test.ts`
4. Wire in `contracts/webhooks.factory.ts`
5. Export from `contracts/webhooks.contract.ts` and `contracts/index.ts`

### Swapping the delivery provider

Replace the `IWebhookDelivery` implementation:
- Default: fetch-based HTTP delivery
- Alternative: queue-backed retry system (enqueue delivery, retry on failure)

Implement `IWebhookDelivery.deliver(url, secret, eventType, payload)` → `{ statusCode }`.

## Conventions

- All domain types are pure TypeScript — zero framework imports
- Use `Result<T, E>` for all business logic returns
- Errors extend `Error` with static `create()` factories
- Events use `public readonly` properties with `occurredAt` default
- File naming: kebab-case with typed suffix (.entity.ts, .vo.ts, etc.)
- Tests co-located in `__tests__/` within each layer

## CLI Commands

| Command | Description |
|---------|-------------|
| `backcap add webhooks` | Install webhooks domain |
| `backcap list` | View all available domains |
