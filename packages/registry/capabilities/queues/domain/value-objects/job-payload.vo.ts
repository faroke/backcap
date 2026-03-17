// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { InvalidJobPayload } from "../errors/invalid-job-payload.error.js";

export class JobPayload {
  readonly value: Record<string, unknown>;

  private constructor(value: Record<string, unknown>) {
    this.value = value;
  }

  static create(
    value: unknown,
  ): Result<JobPayload, InvalidJobPayload> {
    if (value === null || value === undefined) {
      return Result.fail(InvalidJobPayload.create("Payload must not be null or undefined"));
    }

    if (typeof value !== "object" || Array.isArray(value)) {
      return Result.fail(InvalidJobPayload.create("Payload must be a plain object"));
    }

    return Result.ok(new JobPayload(value as Record<string, unknown>));
  }
}
