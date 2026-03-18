import { Result } from "../../shared/result.js";
import { Role } from "../../domain/entities/role.entity.js";
import { Permission } from "../../domain/entities/permission.entity.js";
import { DuplicateRole } from "../../domain/errors/duplicate-role.error.js";
import { PermissionGranted } from "../../domain/events/permission-granted.event.js";
import type { IRoleRepository } from "../ports/role-repository.port.js";
import type { CreateRoleInput } from "../dto/create-role-input.dto.js";

export class CreateRole {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(
    input: CreateRoleInput,
  ): Promise<Result<{ roleId: string; events: PermissionGranted[] }, Error>> {
    const existing = await this.roleRepository.findByName(input.name);
    if (existing) {
      return Result.fail(DuplicateRole.create(input.name));
    }

    const permissions: Permission[] = [];
    if (input.permissions) {
      for (const p of input.permissions) {
        const permResult = Permission.create({
          id: crypto.randomUUID(),
          action: p.action,
          resource: p.resource,
          conditions: p.conditions,
        });
        if (permResult.isFail()) {
          return Result.fail(permResult.unwrapError());
        }
        permissions.push(permResult.unwrap());
      }
    }

    const id = crypto.randomUUID();
    const roleResult = Role.create({
      id,
      name: input.name,
      description: input.description,
      permissions,
    });

    if (roleResult.isFail()) {
      return Result.fail(roleResult.unwrapError());
    }

    await this.roleRepository.save(roleResult.unwrap());

    const events = permissions.map(
      (p) => new PermissionGranted(id, p.id, p.action.value, p.resource.value),
    );

    return Result.ok({ roleId: id, events });
  }
}
