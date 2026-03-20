import { Result } from "../../shared/result.js";
import { InvalidAuditAction } from "../errors/invalid-audit-action.error.js";

const AUDIT_ACTION_REGEX = /^[A-Z][A-Z0-9_]+\.[A-Z][A-Z0-9_]+$/;

export class AuditAction {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<AuditAction, InvalidAuditAction> {
    if (!AUDIT_ACTION_REGEX.test(value)) {
      return Result.fail(InvalidAuditAction.create(value));
    }
    return Result.ok(new AuditAction(value));
  }
}
