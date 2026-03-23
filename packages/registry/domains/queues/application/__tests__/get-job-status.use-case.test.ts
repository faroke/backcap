import { describe, it, expect, beforeEach } from "vitest";
import { GetJobStatus } from "../use-cases/get-job-status.use-case.js";
import { InMemoryJobRepository } from "./mocks/in-memory-job-repository.mock.js";
import { createTestJob } from "./fixtures/job.fixture.js";
import { JobNotFound } from "../../domain/errors/job-not-found.error.js";

describe("GetJobStatus use case", () => {
  let jobRepo: InMemoryJobRepository;
  let getJobStatus: GetJobStatus;

  beforeEach(async () => {
    jobRepo = new InMemoryJobRepository();
    getJobStatus = new GetJobStatus(jobRepo);

    await jobRepo.save(createTestJob({ id: "job-1", type: "emails" }));
  });

  it("returns job status", async () => {
    const result = await getJobStatus.execute({ jobId: "job-1" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.id).toBe("job-1");
    expect(output.type).toBe("emails");
    expect(output.status).toBe("pending");
    expect(output.attempts).toBe(0);
    expect(output.scheduledAt).toBeInstanceOf(Date);
    expect(output.createdAt).toBeInstanceOf(Date);
    expect(output.failureReason).toBeUndefined();
  });

  it("fails when job not found", async () => {
    const result = await getJobStatus.execute({ jobId: "nonexistent" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(JobNotFound);
  });
});
