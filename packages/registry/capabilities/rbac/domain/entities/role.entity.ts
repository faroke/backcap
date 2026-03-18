import { Result } from "../../shared/result.js";
import { Permission } from "./permission.entity.js";
import { InvalidRoleName } from "../errors/invalid-role-name.error.js";

export class Role {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly permissions: Permission[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    description: string,
    permissions: Permission[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.permissions = permissions;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(params: {
    id: string;
    name: string;
    description: string;
    permissions?: Permission[];
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<Role, InvalidRoleName> {
    if (!params.name || params.name.trim().length === 0) {
      return Result.fail(InvalidRoleName.create(params.name ?? ""));
    }

    const now = new Date();
    return Result.ok(
      new Role(
        params.id,
        params.name.trim(),
        params.description,
        params.permissions ?? [],
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }

  addPermission(permission: Permission): Role {
    return new Role(
      this.id,
      this.name,
      this.description,
      [...this.permissions, permission],
      this.createdAt,
      new Date(),
    );
  }

  removePermission(permissionId: string): Role {
    return new Role(
      this.id,
      this.name,
      this.description,
      this.permissions.filter((p) => p.id !== permissionId),
      this.createdAt,
      new Date(),
    );
  }
}
