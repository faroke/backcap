// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { Email } from "../value-objects/email.vo.js";
import { InvalidEmail } from "../errors/invalid-email.error.js";

export class User {
  readonly id: string;
  readonly email: Email;
  readonly passwordHash: string;
  readonly roles: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    email: Email,
    passwordHash: string,
    roles: string[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.roles = roles;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(params: {
    id: string;
    email: string;
    passwordHash: string;
    roles?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<User, InvalidEmail> {
    const emailResult = Email.create(params.email);
    if (emailResult.isFail()) {
      return Result.fail(emailResult.unwrapError());
    }

    const now = new Date();
    return Result.ok(
      new User(
        params.id,
        emailResult.unwrap(),
        params.passwordHash,
        params.roles ?? ["user"],
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }

  updateEmail(newEmail: string): Result<User, InvalidEmail> {
    const emailResult = Email.create(newEmail);
    if (emailResult.isFail()) {
      return Result.fail(emailResult.unwrapError());
    }

    return Result.ok(
      new User(
        this.id,
        emailResult.unwrap(),
        this.passwordHash,
        this.roles,
        this.createdAt,
        new Date(),
      ),
    );
  }
}
