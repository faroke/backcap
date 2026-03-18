// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { Membership } from "../../domain/entities/membership.entity.js";
import { MemberJoined } from "../../domain/events/member-joined.event.js";
import { MemberAlreadyExists } from "../../domain/errors/member-already-exists.error.js";
import type { IMembershipRepository } from "../ports/membership-repository.port.js";
import type { IInvitationService } from "../ports/invitation-service.port.js";
import type { AcceptInvitationInput } from "../dto/accept-invitation-input.dto.js";

export class AcceptInvitation {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly invitationService: IInvitationService,
  ) {}

  async execute(
    input: AcceptInvitationInput,
  ): Promise<Result<{ membershipId: string; event: MemberJoined }, Error>> {
    const invitation = await this.invitationService.findByToken(input.token);
    if (!invitation) {
      return Result.fail(new Error("Invitation not found or expired"));
    }

    if (invitation.acceptedAt) {
      return Result.fail(new Error("Invitation has already been accepted"));
    }

    if (invitation.expiresAt < new Date()) {
      return Result.fail(new Error("Invitation has expired"));
    }

    // Check if user is already a member
    const existingMembership = await this.membershipRepository.findByUserAndOrg(
      input.userId,
      invitation.organizationId,
    );
    if (existingMembership) {
      return Result.fail(
        MemberAlreadyExists.create(input.userId, invitation.organizationId),
      );
    }

    const membershipId = crypto.randomUUID();
    const membershipResult = Membership.create({
      id: membershipId,
      userId: input.userId,
      organizationId: invitation.organizationId,
      role: invitation.role,
    });

    if (membershipResult.isFail()) {
      return Result.fail(membershipResult.unwrapError());
    }

    // Mark invitation accepted first to prevent concurrent re-acceptance
    await this.invitationService.markAccepted(invitation.id);
    try {
      await this.membershipRepository.save(membershipResult.unwrap());
    } catch (error) {
      // Best-effort: invitation marked but membership failed — caller should retry
      throw error;
    }

    const event = new MemberJoined(
      invitation.organizationId,
      input.userId,
      invitation.role,
    );

    return Result.ok({ membershipId, event });
  }
}
