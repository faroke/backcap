import { Result } from "../../shared/result.js";
import { PermissionDenied } from "../errors/permission-denied.error.js";

export class ResourceType {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<ResourceType, PermissionDenied> {
    if (!value || value.trim().length === 0) {
      return Result.fail(
        new PermissionDenied(`Invalid resource type: resource type cannot be empty`),
      );
    }
    const trimmed = value.trim().toLowerCase();
    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(trimmed)) {
      return Result.fail(
        new PermissionDenied(
          `Invalid resource type: "${value}". Must start with a letter and contain only lowercase letters, numbers, and hyphens`,
        ),
      );
    }
    return Result.ok(new ResourceType(trimmed));
  }

  equals(other: ResourceType): boolean {
    return this.value === other.value;
  }
}
