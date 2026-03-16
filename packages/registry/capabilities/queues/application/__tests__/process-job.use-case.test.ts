import { describe, it, expect, beforeEach } from "vitest";
import { ProcessJob } from "../use-cases/process-job.use-case.js";
import { InMemoryJobRepository } from "./mocks/job-repository.mock.js";
import { createTestJob } from "./fixtures/job.fixture.js";
import { JobNotFound } from "../../domain/errors/job-not-found.error.js";
import { MaxAttemptsExceeded } from "../../domain/errors/max-attempts-exceeded.error.js";

describe("ProcessJob use case", () => {
  let jobRepo: InMemoryJobRepository;
  let processJob: ProcessJob;

  beforeEach(() => {
    jobRepo = new InMemoryJobRepository();
    processJob = new ProcessJob(jobRepo);
  });

  it("processes a job successfully", async () => {
    await jobRepo.save(createTestJob({ id: "job-1" }));

    const result = await processJob.execute({
      jobId: "job-1",
      handler: async () => {},
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.status).toBe("completed");
    expect(output.event.constructor.name).toBe("JobCompleted");

    const saved = await jobRepo.findById("job-1");
    expect(saved!.status).toBe("completed");
  });

  it("marks job as failed when handler throws", async () => {
    await jobRepo.save(createTestJob({ id: "job-1" }));

    const result = await processJob.execute({
      jobId: "job-1",
      handler: async () => {
        throw new Error("Processing error");
      },
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.status).toBe("failed");
    expect(output.event.constructor.name).toBe("JobFailed");
  });

  it("fails when job not found", async () => {
    const result = await processJob.execute({
      jobId: "nonexistent",
      handler: async () => {},
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(JobNotFound);
  });

  it("fails when max attempts exceeded", async () => {
    await jobRepo.save(createTestJob({ id: "job-1", maxAttempts: 1 }));

    // First attempt succeeds in processing
    await processJob.execute({ jobId: "job-1", handler: async () => { throw new Error("fail"); } });

    // Second attempt should exceed max
    const result = await processJob.execute({
      jobId: "job-1",
      handler: async () => {},
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(MaxAttemptsExceeded);
  });
});
