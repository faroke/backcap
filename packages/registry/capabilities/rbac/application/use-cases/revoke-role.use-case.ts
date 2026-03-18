import { Result } from "../../shared/result.js";
import { RoleNotFound } from "../../domain/errors/role-not-found.error.js";
import { RoleRevoked } from "../../domain/events/role-revoked.event.js";
import type { IRoleRepository } from "../ports/role-repository.port.js";
import type { RevokeRoleInput } from "../dto/revoke-role-input.dto.js";

export class RevokeRole {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(
    input: RevokeRoleInput,
  ): Promise<Result<{ event: RoleRevoked }, Error>> {
    const role = await this.roleRepository.findById(input.roleId);
    if (!role) {
      return Result.fail(RoleNotFound.create(input.roleId));
    }

    const userRoles = await this.roleRepository.findByUserId(input.userId);
    const hasRole = userRoles.some((r) => r.id === input.roleId);
    if (!hasRole) {
      return Result.fail(RoleNotFound.create(input.roleId));
    }

    await this.roleRepository.revokeFromUser(input.userId, input.roleId);

    const event = new RoleRevoked(input.userId, input.roleId);
    return Result.ok({ event });
  }
}
