import { Result } from "../../shared/result.js";

export type MediaPurposeValue = "thumbnail" | "preview" | "original" | "optimized";

const VALID_PURPOSES: MediaPurposeValue[] = ["thumbnail", "preview", "original", "optimized"];

export class MediaPurpose {
  readonly value: MediaPurposeValue;

  private constructor(value: MediaPurposeValue) {
    this.value = value;
  }

  static thumbnail(): MediaPurpose {
    return new MediaPurpose("thumbnail");
  }

  static preview(): MediaPurpose {
    return new MediaPurpose("preview");
  }

  static original(): MediaPurpose {
    return new MediaPurpose("original");
  }

  static optimized(): MediaPurpose {
    return new MediaPurpose("optimized");
  }

  static from(value: string): Result<MediaPurpose, Error> {
    if (VALID_PURPOSES.includes(value as MediaPurposeValue)) {
      return Result.ok(new MediaPurpose(value as MediaPurposeValue));
    }
    return Result.fail(
      new Error(`Invalid media purpose: "${value}". Valid values: ${VALID_PURPOSES.join(", ")}`),
    );
  }

  equals(other: MediaPurpose): boolean {
    return this.value === other.value;
  }
}
