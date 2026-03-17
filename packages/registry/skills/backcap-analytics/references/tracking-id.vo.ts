import { Result } from "../../shared/result.js";
import { InvalidTrackingId } from "../errors/invalid-tracking-id.error.js";

const TRACKING_ID_REGEX = /^[a-zA-Z0-9-]+$/;

export class TrackingId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<TrackingId, InvalidTrackingId> {
    if (
      !value ||
      value.length < 8 ||
      value.length > 64 ||
      !TRACKING_ID_REGEX.test(value)
    ) {
      return Result.fail(InvalidTrackingId.create(value));
    }
    return Result.ok(new TrackingId(value));
  }
}
