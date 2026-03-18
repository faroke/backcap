import { Result } from "../../shared/result.js";
import { PermissionAction } from "../value-objects/permission-action.vo.js";
import { ResourceType } from "../value-objects/resource-type.vo.js";
import { PermissionDenied } from "../errors/permission-denied.error.js";

export class Permission {
  readonly id: string;
  readonly action: PermissionAction;
  readonly resource: ResourceType;
  readonly conditions: Record<string, unknown>;
  readonly createdAt: Date;

  private constructor(
    id: string,
    action: PermissionAction,
    resource: ResourceType,
    conditions: Record<string, unknown>,
    createdAt: Date,
  ) {
    this.id = id;
    this.action = action;
    this.resource = resource;
    this.conditions = conditions;
    this.createdAt = createdAt;
  }

  static create(params: {
    id: string;
    action: string;
    resource: string;
    conditions?: Record<string, unknown>;
    createdAt?: Date;
  }): Result<Permission, PermissionDenied> {
    const actionResult = PermissionAction.create(params.action);
    if (actionResult.isFail()) {
      return Result.fail(actionResult.unwrapError());
    }

    const resourceResult = ResourceType.create(params.resource);
    if (resourceResult.isFail()) {
      return Result.fail(resourceResult.unwrapError());
    }

    return Result.ok(
      new Permission(
        params.id,
        actionResult.unwrap(),
        resourceResult.unwrap(),
        params.conditions ?? {},
        params.createdAt ?? new Date(),
      ),
    );
  }

  matches(action: PermissionAction, resource: ResourceType): boolean {
    return this.action.includes(action) && this.resource.equals(resource);
  }
}
