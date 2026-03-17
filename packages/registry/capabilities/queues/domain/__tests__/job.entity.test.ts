import { describe, it, expect } from "vitest";
import { Job } from "../entities/job.entity.js";
import { MaxAttemptsExceeded } from "../errors/max-attempts-exceeded.error.js";

describe("Job entity", () => {
  const validParams = {
    id: "job-1",
    type: "email",
    payload: { to: "user@example.com", subject: "Hello" },
  };

  it("creates a valid job with pending status", () => {
    const result = Job.create(validParams);
    expect(result.isOk()).toBe(true);
    const job = result.unwrap();
    expect(job.id).toBe("job-1");
    expect(job.type).toBe("email");
    expect(job.payload.value).toEqual({ to: "user@example.com", subject: "Hello" });
    expect(job.status).toBe("pending");
    expect(job.attempts).toBe(0);
    expect(job.scheduledAt).toBeInstanceOf(Date);
    expect(job.createdAt).toBeInstanceOf(Date);
    expect(job.failureReason).toBeUndefined();
  });

  it("creates job with custom scheduledAt", () => {
    const scheduled = new Date("2026-12-01");
    const result = Job.create({ ...validParams, scheduledAt: scheduled });
    expect(result.unwrap().scheduledAt).toEqual(scheduled);
  });

  it("fails with null payload", () => {
    const result = Job.create({ ...validParams, payload: null as any });
    expect(result.isFail()).toBe(true);
  });

  it("start increments attempts and sets status to processing", () => {
    const job = Job.create(validParams).unwrap();
    const result = job.start();
    expect(result.isOk()).toBe(true);
    expect(job.status).toBe("processing");
    expect(job.attempts).toBe(1);
  });

  it("start fails when max attempts exceeded", () => {
    const job = Job.create(validParams).unwrap();
    job.start(2);
    job.fail("first");
    job.start(2);
    job.fail("second");

    const result = job.start(2);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(MaxAttemptsExceeded);
  });

  it("start fails on completed job", () => {
    const job = Job.create(validParams).unwrap();
    job.start();
    job.complete();
    const result = job.start();
    expect(result.isFail()).toBe(true);
  });

  it("start fails on already processing job", () => {
    const job = Job.create(validParams).unwrap();
    job.start();
    const result = job.start();
    expect(result.isFail()).toBe(true);
  });

  it("complete sets status to completed", () => {
    const job = Job.create(validParams).unwrap();
    job.start();
    const result = job.complete();
    expect(result.isOk()).toBe(true);
    expect(job.status).toBe("completed");
  });

  it("complete fails if not processing", () => {
    const job = Job.create(validParams).unwrap();
    const result = job.complete();
    expect(result.isFail()).toBe(true);
  });

  it("fail sets status to failed and stores reason", () => {
    const job = Job.create(validParams).unwrap();
    job.start();
    const result = job.fail("some error");
    expect(result.isOk()).toBe(true);
    expect(job.status).toBe("failed");
    expect(job.failureReason).toBe("some error");
  });

  it("fail fails if not processing", () => {
    const job = Job.create(validParams).unwrap();
    const result = job.fail("error");
    expect(result.isFail()).toBe(true);
  });

  it("payload is preserved through state transitions", () => {
    const job = Job.create(validParams).unwrap();
    job.start();
    job.complete();
    expect(job.payload.value).toEqual({ to: "user@example.com", subject: "Hello" });
  });
});
