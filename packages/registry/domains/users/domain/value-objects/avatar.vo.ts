import { Result } from "../../shared/result.js";
import { InvalidAvatarUrl } from "../errors/invalid-avatar-url.error.js";

export class Avatar {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<Avatar, InvalidAvatarUrl> {
    if (
      !value ||
      (!value.startsWith("https://") && !value.startsWith("http://")) ||
      value.length > 2048
    ) {
      return Result.fail(InvalidAvatarUrl.create(value));
    }
    return Result.ok(new Avatar(value));
  }
}
