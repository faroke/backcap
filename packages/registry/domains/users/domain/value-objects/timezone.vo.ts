import { Result } from "../../shared/result.js";
import { InvalidTimezone } from "../errors/invalid-timezone.error.js";

const VALID_TIMEZONES = new Set(Intl.supportedValuesOf("timeZone"));

export class Timezone {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<Timezone, InvalidTimezone> {
    if (value === "UTC" || VALID_TIMEZONES.has(value)) {
      return Result.ok(new Timezone(value));
    }
    return Result.fail(InvalidTimezone.create(value));
  }
}
