import { Result } from "../../shared/result.js";
import { InvalidDisplayName } from "../errors/invalid-display-name.error.js";

export class DisplayName {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<DisplayName, InvalidDisplayName> {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
      return Result.fail(InvalidDisplayName.create(value));
    }
    return Result.ok(new DisplayName(trimmed));
  }
}
