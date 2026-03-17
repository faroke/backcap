---
name: backcap-queues
description: Queues capability for Backcap — domain-first clean architecture for asynchronous job processing. Provides job enqueuing, processing with configurable handlers, status tracking, and pluggable queue providers. Use when building background job systems, task queues, or async workload processing.
metadata:
  author: backcap
  version: 0.1.0
---

# Queues Capability

## Domain Map

```
capabilities/queues/
├── domain/
│   ├── entities/job.entity.ts           → Job (id, type, payload, status, attempts, failureReason, scheduledAt, createdAt)
│   ├── value-objects/job-payload.vo.ts  → JobPayload (validates non-null plain object)
│   ├── events/
│   │   ├── job-completed.event.ts       → JobCompleted (jobId, type, completedAt)
│   │   └── job-failed.event.ts          → JobFailed (jobId, type, reason, attempts)
│   ├── errors/
│   │   ├── job-not-found.error.ts
│   │   ├── invalid-job-payload.error.ts
│   │   └── max-attempts-exceeded.error.ts
│   └── __tests__/
├── application/
│   ├── use-cases/
│   │   ├── enqueue-job.use-case.ts      → EnqueueJob
│   │   ├── process-job.use-case.ts      → ProcessJob
│   │   └── get-job-status.use-case.ts   → GetJobStatus
│   ├── dto/
│   │   ├── enqueue-job.dto.ts
│   │   ├── process-job.dto.ts
│   │   └── get-job-status.dto.ts
│   ├── ports/
│   │   ├── queue-provider.port.ts       → IQueueProvider (for adapter layer)
│   │   └── job-repository.port.ts       → IJobRepository
│   └── __tests__/
├── contracts/
│   ├── queues.contract.ts               → IQueuesService
│   ├── queues.factory.ts                → createQueuesCapability()
│   └── index.ts
└── shared/result.ts
```

## Extension Guide

### Adding a new use case

1. Create DTO in `application/dto/your-use-case.dto.ts` with Input/Output interfaces
2. Create use case in `application/use-cases/your-use-case.use-case.ts`
   - Constructor accepts ports (IJobRepository) and optionally a process handler + maxAttempts
   - `execute()` returns `Promise<Result<Output, Error>>`
3. Add tests in `application/__tests__/your-use-case.use-case.test.ts`
4. Wire in `contracts/queues.factory.ts`
5. Export from `contracts/queues.contract.ts` and `contracts/index.ts`

### Swapping the queue provider

Replace the `IQueueProvider` implementation:
- Default: in-memory Map-based queue (one queue per job type)
- Alternative: BullMQ (Redis-backed, supports delayed jobs, retries, priorities)
- Alternative: Inngest (event-driven, serverless-friendly, built-in observability)

Implement `IQueueProvider.enqueue(type, payload, scheduledAt?)` → `{ jobId }` and `IQueueProvider.dequeue(type)` → `{ jobId, payload } | undefined`.

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
| `backcap add queues` | Install queues capability |
| `backcap add queues --yes` | Install without prompts |
| `backcap list` | View all available capabilities |
| `backcap bridges` | View compatible bridges |
