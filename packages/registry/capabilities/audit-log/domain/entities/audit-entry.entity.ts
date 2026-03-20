import { Result } from "../../shared/result.js";
import { AuditAction } from "../value-objects/audit-action.vo.js";
import { InvalidAuditAction } from "../errors/invalid-audit-action.error.js";

export class AuditEntry {
  readonly id: string;
  readonly actor: string;
  readonly action: AuditAction;
  readonly resource: string;
  readonly metadata: Record<string, unknown> | undefined;
  readonly timestamp: Date;

  private constructor(
    id: string,
    actor: string,
    action: AuditAction,
    resource: string,
    metadata: Record<string, unknown> | undefined,
    timestamp: Date,
  ) {
    this.id = id;
    this.actor = actor;
    this.action = action;
    this.resource = resource;
    this.metadata = metadata;
    this.timestamp = timestamp;
  }

  static create(params: {
    id: string;
    actor: string;
    action: string;
    resource: string;
    metadata?: Record<string, unknown>;
    timestamp?: Date;
  }): Result<AuditEntry, InvalidAuditAction> {
    const actionResult = AuditAction.create(params.action);
    if (actionResult.isFail()) {
      return Result.fail(actionResult.unwrapError());
    }

    return Result.ok(
      new AuditEntry(
        params.id,
        params.actor,
        actionResult.unwrap(),
        params.resource,
        params.metadata,
        params.timestamp ?? new Date(),
      ),
    );
  }
}
