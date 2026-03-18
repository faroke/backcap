// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import type { Membership } from "../../domain/entities/membership.entity.js";
import { OrgNotFound } from "../../domain/errors/org-not-found.error.js";
import type { IOrganizationRepository } from "../ports/organization-repository.port.js";
import type { IMembershipRepository } from "../ports/membership-repository.port.js";

export class ListMembers {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(
    organizationId: string,
  ): Promise<Result<Membership[], Error>> {
    const org = await this.organizationRepository.findById(organizationId);
    if (!org) {
      return Result.fail(OrgNotFound.create(organizationId));
    }

    const members = await this.membershipRepository.findByOrganization(organizationId);
    return Result.ok(members);
  }
}
