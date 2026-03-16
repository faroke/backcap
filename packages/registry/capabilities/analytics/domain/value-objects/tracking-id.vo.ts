// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { InvalidTrackingId } from "../errors/invalid-tracking-id.error.js";

const TRACKING_ID_REGEX = /^[a-zA-Z0-9]{8,64}$/;

export class TrackingId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<TrackingId, InvalidTrackingId> {
    if (!TRACKING_ID_REGEX.test(value)) {
      return Result.fail(InvalidTrackingId.create(value));
    }
    return Result.ok(new TrackingId(value));
  }
}
