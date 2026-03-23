import { Result } from "../../shared/result.js";
import type { Organization } from "../../domain/entities/organization.entity.js";
import { OrgNotFound } from "../../domain/errors/org-not-found.error.js";
import type { IOrganizationRepository } from "../ports/organization-repository.port.js";

export class GetOrganization {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(
    organizationId: string,
  ): Promise<Result<Organization, Error>> {
    const org = await this.organizationRepository.findById(organizationId);
    if (!org) {
      return Result.fail(OrgNotFound.create(organizationId));
    }

    return Result.ok(org);
  }
}
