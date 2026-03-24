import { Result } from "../../../shared/result.js";

export class TrackingNumber {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<TrackingNumber, Error> {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return Result.fail(new Error("Tracking number cannot be empty"));
    }
    if (!/^[A-Za-z0-9-]+$/.test(trimmed)) {
      return Result.fail(new Error(`Invalid tracking number format: "${value}"`));
    }
    if (trimmed.length < 6 || trimmed.length > 40) {
      return Result.fail(new Error(`Tracking number must be between 6 and 40 characters: "${value}"`));
    }
    return Result.ok(new TrackingNumber(trimmed.toUpperCase()));
  }

  equals(other: TrackingNumber): boolean {
    return this.value === other.value;
  }
}
