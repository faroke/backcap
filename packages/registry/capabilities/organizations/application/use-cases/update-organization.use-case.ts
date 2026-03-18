// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import type { Organization } from "../../domain/entities/organization.entity.js";
import { OrgNotFound } from "../../domain/errors/org-not-found.error.js";
import type { IOrganizationRepository } from "../ports/organization-repository.port.js";
import type { UpdateOrganizationInput } from "../dto/update-organization-input.dto.js";

export class UpdateOrganization {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(
    input: UpdateOrganizationInput,
  ): Promise<Result<Organization, Error>> {
    const org = await this.organizationRepository.findById(input.organizationId);
    if (!org) {
      return Result.fail(OrgNotFound.create(input.organizationId));
    }

    if (input.name === undefined && input.settings === undefined) {
      return Result.ok(org);
    }

    let updated = org;

    if (input.name !== undefined) {
      const nameResult = updated.updateName(input.name);
      if (nameResult.isFail()) {
        return Result.fail(nameResult.unwrapError());
      }
      updated = nameResult.unwrap();
    }

    if (input.settings !== undefined) {
      const settingsResult = updated.updateSettings(input.settings);
      if (settingsResult.isFail()) {
        return Result.fail(settingsResult.unwrapError());
      }
      updated = settingsResult.unwrap();
    }

    await this.organizationRepository.save(updated);
    return Result.ok(updated);
  }
}
