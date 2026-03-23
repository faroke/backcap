import { describe, it, expect, beforeEach } from "vitest";
import { Result } from "../../shared/result.js";
import { ProcessJob } from "../use-cases/process-job.use-case.js";
import { InMemoryJobRepository } from "./mocks/in-memory-job-repository.mock.js";
import { createTestJob } from "./fixtures/job.fixture.js";
import { JobNotFound } from "../../domain/errors/job-not-found.error.js";
import { MaxAttemptsExceeded } from "../../domain/errors/max-attempts-exceeded.error.js";

describe("ProcessJob use case", () => {
  let jobRepo: InMemoryJobRepository;

  beforeEach(() => {
    jobRepo = new InMemoryJobRepository();
  });

  function createProcessJob(
    handler: (job: { type: string; payload: Record<string, unknown> }) => Promise<Result<void, Error>> = async () => Result.ok(undefined),
    maxAttempts = 3,
  ) {
    return new ProcessJob(jobRepo, handler, maxAttempts);
  }

  it("processes a job successfully", async () => {
    await jobRepo.save(createTestJob({ id: "job-1" }));
    const processJob = createProcessJob();

    const result = await processJob.execute({ jobId: "job-1" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.status).toBe("completed");
    expect(output.completedAt).toBeInstanceOf(Date);
    expect(output.event.constructor.name).toBe("JobCompleted");

    const saved = await jobRepo.findById("job-1");
    expect(saved!.status).toBe("completed");
  });

  it("marks job as failed when handler returns fail", async () => {
    await jobRepo.save(createTestJob({ id: "job-1" }));
    const processJob = createProcessJob(
      async () => Result.fail(new Error("Processing error")),
    );

    const result = await processJob.execute({ jobId: "job-1" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.status).toBe("failed");
    expect(output.completedAt).toBeNull();
    expect(output.event.constructor.name).toBe("JobFailed");

    const saved = await jobRepo.findById("job-1");
    expect(saved!.failureReason).toBe("Processing error");
  });

  it("marks job as failed when handler throws", async () => {
    await jobRepo.save(createTestJob({ id: "job-1" }));
    const processJob = createProcessJob(async () => {
      throw new Error("Unexpected crash");
    });

    const result = await processJob.execute({ jobId: "job-1" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.status).toBe("failed");
    expect(output.event.constructor.name).toBe("JobFailed");

    const saved = await jobRepo.findById("job-1");
    expect(saved!.failureReason).toBe("Unexpected crash");
  });

  it("fails when job not found", async () => {
    const processJob = createProcessJob();

    const result = await processJob.execute({ jobId: "nonexistent" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(JobNotFound);
  });

  it("fails when max attempts exceeded", async () => {
    const job = createTestJob({ id: "job-1" });
    job.start(3);
    job.fail("first");
    job.start(3);
    job.fail("second");
    job.start(3);
    job.fail("third");
    await jobRepo.save(job);

    const processJob = createProcessJob();
    const result = await processJob.execute({ jobId: "job-1" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(MaxAttemptsExceeded);
  });

  it("respects custom maxAttempts", async () => {
    const job = createTestJob({ id: "job-1" });
    job.start(1);
    job.fail("once");
    await jobRepo.save(job);

    const processJob = createProcessJob(async () => Result.ok(undefined), 1);
    const result = await processJob.execute({ jobId: "job-1" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(MaxAttemptsExceeded);
  });
});
