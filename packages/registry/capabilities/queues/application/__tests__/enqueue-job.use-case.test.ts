import { describe, it, expect, beforeEach } from "vitest";
import { EnqueueJob } from "../use-cases/enqueue-job.use-case.js";
import { InMemoryJobRepository } from "./mocks/in-memory-job-repository.mock.js";

describe("EnqueueJob use case", () => {
  let jobRepo: InMemoryJobRepository;
  let enqueueJob: EnqueueJob;

  beforeEach(() => {
    jobRepo = new InMemoryJobRepository();
    enqueueJob = new EnqueueJob(jobRepo);
  });

  it("enqueues a job successfully", async () => {
    const result = await enqueueJob.execute({
      type: "emails",
      payload: { to: "user@example.com" },
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.jobId).toBeDefined();
    expect(output.scheduledAt).toBeInstanceOf(Date);

    const saved = await jobRepo.findById(output.jobId);
    expect(saved).toBeDefined();
    expect(saved!.type).toBe("emails");
    expect(saved!.status).toBe("pending");
  });

  it("enqueues with custom scheduledAt", async () => {
    const scheduled = new Date("2026-12-01");
    const result = await enqueueJob.execute({
      type: "emails",
      payload: { to: "user@example.com" },
      scheduledAt: scheduled,
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().scheduledAt).toEqual(scheduled);
  });

  it("rejects invalid payload (null)", async () => {
    const result = await enqueueJob.execute({
      type: "emails",
      payload: null as any,
    });

    expect(result.isFail()).toBe(true);
  });
});
