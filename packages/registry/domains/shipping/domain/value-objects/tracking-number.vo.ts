import { Result } from "../../shared/result.js";
import { InvalidTrackingNumber } from "../errors/invalid-tracking-number.error.js";

export class TrackingNumber {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<TrackingNumber, InvalidTrackingNumber> {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return Result.fail(InvalidTrackingNumber.empty());
    }
    if (!/^[A-Za-z0-9-]+$/.test(trimmed)) {
      return Result.fail(InvalidTrackingNumber.invalidFormat(value));
    }
    if (trimmed.length < 6 || trimmed.length > 40) {
      return Result.fail(InvalidTrackingNumber.invalidLength(value));
    }
    return Result.ok(new TrackingNumber(trimmed.toUpperCase()));
  }

  equals(other: TrackingNumber): boolean {
    return this.value === other.value;
  }
}
