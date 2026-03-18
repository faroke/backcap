import { Result } from "../../shared/result.js";
import type { Role } from "../../domain/entities/role.entity.js";
import type { IRoleRepository } from "../ports/role-repository.port.js";

export class ListRoles {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(): Promise<Result<Role[], Error>> {
    const roles = await this.roleRepository.findAll();
    return Result.ok(roles);
  }
}
