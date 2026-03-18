import { Result } from "../../shared/result.js";
import { PermissionDenied } from "../../domain/errors/permission-denied.error.js";
import { PermissionAction } from "../../domain/value-objects/permission-action.vo.js";
import { ResourceType } from "../../domain/value-objects/resource-type.vo.js";
import type { IPermissionResolver } from "../ports/permission-resolver.port.js";
import type { CheckPermissionInput } from "../dto/check-permission-input.dto.js";

export class CheckPermission {
  constructor(private readonly permissionResolver: IPermissionResolver) {}

  async execute(
    input: CheckPermissionInput,
  ): Promise<Result<boolean, PermissionDenied>> {
    const actionResult = PermissionAction.create(input.action);
    if (actionResult.isFail()) {
      return Result.fail(
        PermissionDenied.create(input.userId, input.action, input.resource),
      );
    }

    const resourceResult = ResourceType.create(input.resource);
    if (resourceResult.isFail()) {
      return Result.fail(
        PermissionDenied.create(input.userId, input.action, input.resource),
      );
    }

    const normalizedAction = actionResult.unwrap().value;
    const normalizedResource = resourceResult.unwrap().value;

    const hasPermission = await this.permissionResolver.hasPermission(
      input.userId,
      normalizedAction,
      normalizedResource,
    );

    if (!hasPermission) {
      return Result.fail(
        PermissionDenied.create(input.userId, input.action, input.resource),
      );
    }

    return Result.ok(true);
  }
}
