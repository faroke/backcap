---
title: Queues Capability
description: Background job processing with configurable handlers, retry logic, and status tracking for TypeScript backends — domain model, use cases, ports, and adapters.
---

The `queues` capability provides **background job processing** with configurable handlers, retry logic, and status tracking for TypeScript backends. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add queues
```

## Domain Model

### Job Entity

The `Job` entity is the aggregate root. It tracks job lifecycle through guarded state transitions: `pending` → `processing` → `completed` | `failed`.

```typescript
import { Job } from "./capabilities/queues/domain/entities/job.entity";

const result = Job.create({
  id: crypto.randomUUID(),
  type: "emails",
  payload: { to: "user@example.com", subject: "Welcome!" },
});

if (result.isOk()) {
  const job = result.unwrap();
  console.log(job.status);   // "pending"
  console.log(job.attempts);  // 0

  job.start(3);               // maxAttempts = 3
  console.log(job.status);   // "processing"

  job.complete();
  console.log(job.status);   // "completed"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `type` | `string` | Job type (e.g. `"emails"`, `"reports"`) |
| `payload` | `JobPayload` | Validated payload value object |
| `status` | `"pending" \| "processing" \| "completed" \| "failed"` | Current job status |
| `attempts` | `number` | Number of processing attempts |
| `failureReason` | `string \| undefined` | Reason for failure (set on `fail()`) |
| `scheduledAt` | `Date` | When the job is scheduled to run |
| `createdAt` | `Date` | Timestamp of creation |

`Job.create()` returns `Result<Job, InvalidJobPayload>`.

**State transitions:**
- `start(maxAttempts)` — moves to `processing`, increments attempts. Only works from `pending` or `failed`. Returns `MaxAttemptsExceeded` if limit reached.
- `complete()` — moves to `completed`. Only works from `processing`.
- `fail(reason)` — moves to `failed`, stores the failure reason. Only works from `processing`.

### JobPayload Value Object

```typescript
import { JobPayload } from "./capabilities/queues/domain/value-objects/job-payload.vo";

const result = JobPayload.create({ to: "user@example.com" });
// Result<JobPayload, InvalidJobPayload>

if (result.isOk()) {
  const payload = result.unwrap();
  console.log(payload.value); // { to: "user@example.com" }
}
```

Validates: must be a non-null plain object.

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `JobNotFound` | No job found for the given ID | `Job not found with id: "<id>"` |
| `InvalidJobPayload` | Payload is null, undefined, or not a plain object | `Invalid job payload` |
| `MaxAttemptsExceeded` | Job has reached the maximum retry count | `Job "<id>" exceeded max attempts (<n>)` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `JobCompleted` | `ProcessJob` use case | `jobId`, `type`, `completedAt`, `occurredAt` |
| `JobFailed` | `ProcessJob` use case | `jobId`, `type`, `reason`, `attempts`, `occurredAt` |

## Application Layer

### Use Cases

#### EnqueueJob

Creates a new job entity, validates it, and persists it.

```typescript
import { EnqueueJob } from "./capabilities/queues/application/use-cases/enqueue-job.use-case";

const enqueueJob = new EnqueueJob(jobRepository);

const result = await enqueueJob.execute({
  type: "emails",
  payload: { to: "user@example.com", subject: "Welcome!" },
  scheduledAt: new Date("2025-01-01"),
});
// Result<{ jobId: string; scheduledAt: Date }, Error>
```

**Possible failures**: `InvalidJobPayload`

#### ProcessJob

Processes a job by invoking the configured handler. Handles success, failure, and crashes.

```typescript
import { ProcessJob } from "./capabilities/queues/application/use-cases/process-job.use-case";

const processJob = new ProcessJob(
  jobRepository,
  async (job) => {
    // Your processing logic here
    await sendEmail(job.payload);
    return Result.ok(undefined);
  },
  3, // maxAttempts (optional, default: 3)
);

const result = await processJob.execute({ jobId: "job-123" });
// Result<{ status: "completed" | "failed"; completedAt: Date | null; event: JobCompleted | JobFailed }, Error>
```

**Possible failures**: `JobNotFound`, `MaxAttemptsExceeded`

The handler is wrapped in a try/catch — if it throws, the job is marked as failed with the error message.

#### GetJobStatus

Retrieves a job's current status by ID.

```typescript
import { GetJobStatus } from "./capabilities/queues/application/use-cases/get-job-status.use-case";

const getJobStatus = new GetJobStatus(jobRepository);

const result = await getJobStatus.execute({ jobId: "job-123" });
// Result<{ id, type, payload, status, attempts, scheduledAt, createdAt, failureReason? }, Error>
```

**Possible failures**: `JobNotFound`

### Port Interfaces

#### IJobRepository

```typescript
export interface IJobRepository {
  save(job: Job): Promise<void>;
  findById(id: string): Promise<Job | undefined>;
  findPending(type: string): Promise<Job[]>;
}
```

## Public API (contracts/)

```typescript
import {
  createQueuesCapability,
  IQueuesService,
} from "./capabilities/queues/contracts";

const queuesService: IQueuesService = createQueuesCapability({
  jobRepository,
  processHandler: async (job) => {
    await sendEmail(job.payload);
    return Result.ok(undefined);
  },
  maxAttempts: 5, // optional, default: 3
});

// IQueuesService interface:
// enqueue(input): Promise<Result<QueuesEnqueueOutput, Error>>
// process(input): Promise<Result<QueuesProcessOutput, Error>>
// getStatus(input): Promise<Result<QueuesGetStatusOutput, Error>>
```

This is the only import consumers need. The internal use case classes are implementation details.

## Adapters

### queues-prisma

Provides `PrismaJobRepository` which implements `IJobRepository`.

```bash
npx @backcap/cli add queues-prisma
```

```typescript
import { PrismaJobRepository } from "./adapters/prisma/queues/prisma-job-repository";

const jobRepository = new PrismaJobRepository(prisma);
```

Requires a Prisma schema with a `JobRecord` model:

```prisma
model JobRecord {
  id            String   @id @default(uuid())
  type          String
  payload       Json
  status        String   @default("pending")
  attempts      Int      @default(0)
  scheduledAt   DateTime @default(now())
  createdAt     DateTime @default(now())
  failureReason String?

  @@map("jobs")
}
```

### queues-express

Provides `createQueuesRouter()` for HTTP access.

```bash
npx @backcap/cli add queues-express
```

```typescript
import { createQueuesRouter } from "./adapters/express/queues/queues.router";

const router = express.Router();
createQueuesRouter(queuesService, router);
app.use(router);
```

**Routes added:**

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/jobs` | `{ type, payload, scheduledAt? }` | `201 { jobId, scheduledAt }` or error |
| `POST` | `/jobs/:id/process` | — | `200 { status, completedAt }` or error |
| `GET` | `/jobs/:id` | — | `200 { id, type, status, ... }` or `404` |

**HTTP error mapping:**

| Domain Error | HTTP Status |
|---|---|
| `JobNotFound` | `404 Not Found` |
| `InvalidJobPayload` | `400 Bad Request` |
| `MaxAttemptsExceeded` | `429 Too Many Requests` |

## File Map

```
capabilities/queues/
  domain/
    entities/job.entity.ts
    value-objects/job-payload.vo.ts
    errors/job-not-found.error.ts
    errors/invalid-job-payload.error.ts
    errors/max-attempts-exceeded.error.ts
    events/job-completed.event.ts
    events/job-failed.event.ts
  application/
    use-cases/enqueue-job.use-case.ts
    use-cases/process-job.use-case.ts
    use-cases/get-job-status.use-case.ts
    ports/job-repository.port.ts
    dto/enqueue-job.dto.ts
    dto/process-job.dto.ts
    dto/get-job-status.dto.ts
  contracts/
    queues.contract.ts
    queues.factory.ts
    index.ts
  shared/
    result.ts
```
