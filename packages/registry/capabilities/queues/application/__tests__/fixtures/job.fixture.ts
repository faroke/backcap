import { Job } from "../../../domain/entities/job.entity.js";

export function createTestJob(
  overrides?: Partial<{
    id: string;
    type: string;
    payload: Record<string, unknown>;
    scheduledAt: Date;
  }>,
): Job {
  const result = Job.create({
    id: overrides?.id ?? "test-job-1",
    type: overrides?.type ?? "default",
    payload: overrides?.payload ?? { task: "test" },
    scheduledAt: overrides?.scheduledAt,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test job: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}

export function createTestPendingJob(
  overrides?: Partial<{
    id: string;
    type: string;
    payload: Record<string, unknown>;
  }>,
): Job {
  return createTestJob(overrides);
}
