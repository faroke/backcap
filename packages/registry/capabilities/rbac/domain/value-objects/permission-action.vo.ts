import { Result } from "../../shared/result.js";
import { PermissionDenied } from "../errors/permission-denied.error.js";

const VALID_ACTIONS = ["create", "read", "update", "delete", "manage"] as const;

export type PermissionActionType = (typeof VALID_ACTIONS)[number];

export class PermissionAction {
  readonly value: PermissionActionType;

  private constructor(value: PermissionActionType) {
    this.value = value;
  }

  static create(value: string): Result<PermissionAction, PermissionDenied> {
    if (!VALID_ACTIONS.includes(value as PermissionActionType)) {
      return Result.fail(
        new PermissionDenied(`Invalid permission action: "${value}". Valid actions: ${VALID_ACTIONS.join(", ")}`),
      );
    }
    return Result.ok(new PermissionAction(value as PermissionActionType));
  }

  equals(other: PermissionAction): boolean {
    return this.value === other.value;
  }

  includes(other: PermissionAction): boolean {
    if (this.value === "manage") return true;
    return this.value === other.value;
  }
}
