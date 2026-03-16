import { describe, it, expect } from "vitest";
import { Job } from "../entities/job.entity.js";
import { MaxAttemptsExceeded } from "../errors/max-attempts-exceeded.error.js";

describe("Job entity", () => {
  const validParams = {
    id: "job-1",
    queue: "email",
    payload: { to: "user@example.com", subject: "Hello" },
  };

  it("creates a valid job with pending status", () => {
    const result = Job.create(validParams);
    expect(result.isOk()).toBe(true);
    const job = result.unwrap();
    expect(job.id).toBe("job-1");
    expect(job.queue).toBe("email");
    expect(job.payload).toEqual({ to: "user@example.com", subject: "Hello" });
    expect(job.status).toBe("pending");
    expect(job.attempts).toBe(0);
    expect(job.maxAttempts).toBe(3);
    expect(job.createdAt).toBeInstanceOf(Date);
    expect(job.processedAt).toBeNull();
  });

  it("creates job with custom maxAttempts", () => {
    const result = Job.create({ ...validParams, maxAttempts: 5 });
    expect(result.unwrap().maxAttempts).toBe(5);
  });

  it("markProcessing increments attempts and sets status to processing", () => {
    const job = Job.create(validParams).unwrap();
    const result = job.markProcessing();
    expect(result.isOk()).toBe(true);
    const processing = result.unwrap();
    expect(processing.status).toBe("processing");
    expect(processing.attempts).toBe(1);
    expect(processing.processedAt).toBeInstanceOf(Date);
    // Original unchanged
    expect(job.status).toBe("pending");
    expect(job.attempts).toBe(0);
  });

  it("markProcessing fails when max attempts exceeded", () => {
    let job = Job.create({ ...validParams, maxAttempts: 2 }).unwrap();
    // exhaust attempts
    job = job.markProcessing().unwrap();
    job = job.markFailed();
    job = job.markProcessing().unwrap();
    job = job.markFailed();

    const result = job.markProcessing();
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(MaxAttemptsExceeded);
  });

  it("markCompleted sets status to completed", () => {
    const job = Job.create(validParams).unwrap();
    const processing = job.markProcessing().unwrap();
    const completed = processing.markCompleted();
    expect(completed.status).toBe("completed");
    // Original unchanged
    expect(processing.status).toBe("processing");
  });

  it("markFailed sets status to failed", () => {
    const job = Job.create(validParams).unwrap();
    const processing = job.markProcessing().unwrap();
    const failed = processing.markFailed();
    expect(failed.status).toBe("failed");
    // Original unchanged
    expect(processing.status).toBe("processing");
  });

  it("job payload is preserved through state transitions", () => {
    const job = Job.create(validParams).unwrap();
    const processing = job.markProcessing().unwrap();
    const completed = processing.markCompleted();
    expect(completed.payload).toEqual({ to: "user@example.com", subject: "Hello" });
  });
});
