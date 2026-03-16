import { describe, it, expect, beforeEach } from "vitest";
import { EnqueueJob } from "../use-cases/enqueue-job.use-case.js";
import { InMemoryJobRepository } from "./mocks/job-repository.mock.js";

describe("EnqueueJob use case", () => {
  let jobRepo: InMemoryJobRepository;
  let enqueueJob: EnqueueJob;

  beforeEach(() => {
    jobRepo = new InMemoryJobRepository();
    enqueueJob = new EnqueueJob(jobRepo);
  });

  it("enqueues a job successfully", async () => {
    const result = await enqueueJob.execute({
      queue: "emails",
      payload: { to: "user@example.com" },
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.jobId).toBeDefined();

    const saved = await jobRepo.findById(output.jobId);
    expect(saved).not.toBeNull();
    expect(saved!.queue).toBe("emails");
    expect(saved!.status).toBe("pending");
  });

  it("rejects invalid priority", async () => {
    const result = await enqueueJob.execute({
      queue: "emails",
      payload: { to: "user@example.com" },
      priority: "ultra",
    });

    expect(result.isFail()).toBe(true);
  });
});
