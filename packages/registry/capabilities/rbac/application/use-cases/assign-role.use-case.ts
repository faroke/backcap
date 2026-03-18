import { Result } from "../../shared/result.js";
import { RoleNotFound } from "../../domain/errors/role-not-found.error.js";
import { RoleAssigned } from "../../domain/events/role-assigned.event.js";
import type { IRoleRepository } from "../ports/role-repository.port.js";
import type { AssignRoleInput } from "../dto/assign-role-input.dto.js";

export class AssignRole {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(
    input: AssignRoleInput,
  ): Promise<Result<{ event: RoleAssigned }, Error>> {
    const role = await this.roleRepository.findById(input.roleId);
    if (!role) {
      return Result.fail(RoleNotFound.create(input.roleId));
    }

    await this.roleRepository.assignToUser(input.userId, input.roleId, input.organizationId);

    const event = new RoleAssigned(input.userId, input.roleId, input.organizationId);
    return Result.ok({ event });
  }
}
