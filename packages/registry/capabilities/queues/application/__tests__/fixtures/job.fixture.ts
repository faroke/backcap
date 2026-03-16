import { Job } from "../../../domain/entities/job.entity.js";

export function createTestJob(
  overrides?: Partial<{
    id: string;
    queue: string;
    payload: Record<string, unknown>;
    maxAttempts: number;
  }>,
): Job {
  const result = Job.create({
    id: overrides?.id ?? "test-job-1",
    queue: overrides?.queue ?? "default",
    payload: overrides?.payload ?? { task: "test" },
    maxAttempts: overrides?.maxAttempts ?? 3,
  });

  return result.unwrap();
}
