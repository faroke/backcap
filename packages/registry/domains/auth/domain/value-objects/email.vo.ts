import { Result } from "../../shared/result.js";
import { InvalidEmail } from "../errors/invalid-email.error.js";

// RFC-5321 simplified: local-part@domain, no consecutive dots, proper TLD
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export class Email {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<Email, InvalidEmail> {
    if (!EMAIL_REGEX.test(value)) {
      return Result.fail(InvalidEmail.create(value));
    }
    return Result.ok(new Email(value));
  }
}
