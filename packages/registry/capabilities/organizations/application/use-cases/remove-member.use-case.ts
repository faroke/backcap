// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { MemberRemoved } from "../../domain/events/member-removed.event.js";
import { OrgNotFound } from "../../domain/errors/org-not-found.error.js";
import { CannotRemoveOwner } from "../../domain/errors/cannot-remove-owner.error.js";
import type { IOrganizationRepository } from "../ports/organization-repository.port.js";
import type { IMembershipRepository } from "../ports/membership-repository.port.js";
import type { RemoveMemberInput } from "../dto/remove-member-input.dto.js";

export class RemoveMember {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(
    input: RemoveMemberInput,
  ): Promise<Result<{ event: MemberRemoved }, Error>> {
    const org = await this.organizationRepository.findById(input.organizationId);
    if (!org) {
      return Result.fail(OrgNotFound.create(input.organizationId));
    }

    const membership = await this.membershipRepository.findByUserAndOrg(
      input.userId,
      input.organizationId,
    );
    if (!membership) {
      return Result.fail(new Error(`User "${input.userId}" is not a member of this organization`));
    }

    if (membership.role.isOwner()) {
      return Result.fail(CannotRemoveOwner.create(input.organizationId));
    }

    await this.membershipRepository.delete(membership.id);

    const event = new MemberRemoved(
      input.organizationId,
      input.userId,
      input.removedBy,
    );

    return Result.ok({ event });
  }
}
