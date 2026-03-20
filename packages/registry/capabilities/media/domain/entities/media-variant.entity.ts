import { Result } from "../../shared/result.js";
import { Dimensions } from "../value-objects/dimensions.vo.js";
import { MediaPurpose } from "../value-objects/media-purpose.vo.js";

export class MediaVariant {
  readonly id: string;
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly format: string;
  readonly purpose: MediaPurpose;

  private constructor(
    id: string,
    url: string,
    width: number,
    height: number,
    format: string,
    purpose: MediaPurpose,
  ) {
    this.id = id;
    this.url = url;
    this.width = width;
    this.height = height;
    this.format = format;
    this.purpose = purpose;
  }

  static create(params: {
    id: string;
    url: string;
    width: number;
    height: number;
    format: string;
    purpose: string;
  }): Result<MediaVariant, Error> {
    const dimensionsResult = Dimensions.create(params.width, params.height);
    if (dimensionsResult.isFail()) {
      return Result.fail(dimensionsResult.unwrapError());
    }

    const purposeResult = MediaPurpose.from(params.purpose);
    if (purposeResult.isFail()) {
      return Result.fail(purposeResult.unwrapError());
    }

    if (!params.url || params.url.trim().length === 0) {
      return Result.fail(new Error("Variant URL cannot be empty"));
    }

    if (!params.format || params.format.trim().length === 0) {
      return Result.fail(new Error("Variant format cannot be empty"));
    }

    return Result.ok(
      new MediaVariant(
        params.id,
        params.url,
        dimensionsResult.unwrap().width,
        dimensionsResult.unwrap().height,
        params.format,
        purposeResult.unwrap(),
      ),
    );
  }
}
