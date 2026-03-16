// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { InvalidPriority } from "../errors/invalid-priority.error.js";

export type PriorityLevel = "low" | "normal" | "high" | "critical";

const VALID_PRIORITIES: PriorityLevel[] = ["low", "normal", "high", "critical"];

export class JobPriority {
  readonly value: PriorityLevel;

  private constructor(value: PriorityLevel) {
    this.value = value;
  }

  static create(value: string): Result<JobPriority, InvalidPriority> {
    if (!VALID_PRIORITIES.includes(value as PriorityLevel)) {
      return Result.fail(InvalidPriority.create(value));
    }
    return Result.ok(new JobPriority(value as PriorityLevel));
  }
}
