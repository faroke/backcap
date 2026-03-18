// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { MemberInvited } from "../../domain/events/member-invited.event.js";
import { OrgNotFound } from "../../domain/errors/org-not-found.error.js";
import { MemberRole } from "../../domain/value-objects/member-role.vo.js";
import type { IOrganizationRepository } from "../ports/organization-repository.port.js";
import type { IInvitationService } from "../ports/invitation-service.port.js";
import type { InviteMemberInput } from "../dto/invite-member-input.dto.js";

export class InviteMember {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    private readonly invitationService: IInvitationService,
  ) {}

  async execute(
    input: InviteMemberInput,
  ): Promise<Result<{ invitationId: string; event: MemberInvited }, Error>> {
    const org = await this.organizationRepository.findById(input.organizationId);
    if (!org) {
      return Result.fail(OrgNotFound.create(input.organizationId));
    }

    // Validate role — owner cannot be assigned via invitation
    const roleResult = MemberRole.create(input.role);
    if (roleResult.isFail()) {
      return Result.fail(roleResult.unwrapError());
    }
    if (roleResult.unwrap().isOwner()) {
      return Result.fail(new Error("Cannot invite with owner role"));
    }

    const invitation = await this.invitationService.create({
      organizationId: input.organizationId,
      email: input.email,
      role: input.role,
      invitedBy: input.invitedBy,
    });

    const event = new MemberInvited(
      input.organizationId,
      input.email,
      input.role,
      input.invitedBy,
    );

    return Result.ok({ invitationId: invitation.id, event });
  }
}
