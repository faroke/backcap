import { Result } from "../../shared/result.js";

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

const MIN_LENGTH = 8;
const NON_ALPHA_REGEX = /[^a-zA-Z]/;

export class Password {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<Password, DomainError> {
    if (value.length < MIN_LENGTH) {
      return Result.fail(
        new DomainError(`Password must be at least ${MIN_LENGTH} characters`),
      );
    }
    if (!NON_ALPHA_REGEX.test(value)) {
      return Result.fail(
        new DomainError("Password must contain at least one non-alphabetic character"),
      );
    }
    return Result.ok(new Password(value));
  }
}
