// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { InvalidFlagKey } from "../errors/invalid-flag-key.error.js";

const FLAG_KEY_REGEX = /^[a-z][a-z0-9_-]{1,63}$/;

export class FlagKey {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<FlagKey, InvalidFlagKey> {
    if (!FLAG_KEY_REGEX.test(value)) {
      return Result.fail(
        InvalidFlagKey.create(
          `Flag key "${value}" must be lowercase, start with a letter, contain only letters, digits, underscores, or hyphens, and be 2-64 characters`,
        ),
      );
    }
    return Result.ok(new FlagKey(value));
  }
}
