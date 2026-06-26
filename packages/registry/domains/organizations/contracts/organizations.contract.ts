import type { Result } from "../shared/result.js";
import type { OrgNotFound } from "../domain/errors/org-not-found.error.js";
import type { OrgSlugTaken } from "../domain/errors/org-slug-taken.error.js";
import type { MemberAlreadyExists } from "../domain/errors/member-already-exists.error.js";
import type { CannotRemoveOwner } from "../domain/errors/cannot-remove-owner.error.js";
import type { InvalidOrganizationName } from "../domain/errors/invalid-organization-name.error.js";
import type { InvalidOrgSlug } from "../domain/errors/invalid-org-slug.error.js";
import type { InvalidMemberRole } from "../domain/errors/invalid-member-role.error.js";
import type { OrganizationSettingsTooLarge } from "../domain/errors/organization-settings-too-large.error.js";
import type { CannotInviteOwner } from "../domain/errors/cannot-invite-owner.error.js";
import type { InvitationNotFound } from "../domain/errors/invitation-not-found.error.js";
import type { InvitationAlreadyAccepted } from "../domain/errors/invitation-already-accepted.error.js";
import type { InvitationExpired } from "../domain/errors/invitation-expired.error.js";
import type { NotAMember } from "../domain/errors/not-a-member.error.js";

export interface OrgCreateInput {
  name: string;
  slug: string;
  ownerId: string;
  plan?: string;
  settings?: Record<string, unknown>;
}

export interface OrgInviteMemberInput {
  organizationId: string;
  email: string;
  role: string;
  invitedBy: string;
}

export interface OrgAcceptInvitationInput {
  token: string;
  userId: string;
}

export interface OrgRemoveMemberInput {
  organizationId: string;
  userId: string;
  removedBy: string;
}

export interface OrgUpdateInput {
  organizationId: string;
  name?: string;
  settings?: Record<string, unknown>;
}

export interface OrgOutput {
  id: string;
  name: string;
  slug: string;
  plan: string;
  settings: Record<string, unknown>;
}

export interface OrgMemberOutput {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  joinedAt: Date;
}

export interface IOrganizationService {
  createOrganization(
    input: OrgCreateInput,
  ): Promise<
    Result<
      { organizationId: string },
      OrgSlugTaken | InvalidOrganizationName | InvalidOrgSlug | InvalidMemberRole
    >
  >;
  getOrganization(organizationId: string): Promise<Result<OrgOutput, OrgNotFound>>;
  updateOrganization(
    input: OrgUpdateInput,
  ): Promise<
    Result<OrgOutput, OrgNotFound | InvalidOrganizationName | OrganizationSettingsTooLarge>
  >;
  inviteMember(
    input: OrgInviteMemberInput,
  ): Promise<
    Result<{ invitationId: string }, OrgNotFound | InvalidMemberRole | CannotInviteOwner>
  >;
  acceptInvitation(
    input: OrgAcceptInvitationInput,
  ): Promise<
    Result<
      { membershipId: string },
      | InvitationNotFound
      | InvitationAlreadyAccepted
      | InvitationExpired
      | MemberAlreadyExists
      | InvalidMemberRole
    >
  >;
  removeMember(
    input: OrgRemoveMemberInput,
  ): Promise<Result<void, OrgNotFound | NotAMember | CannotRemoveOwner>>;
  listMembers(organizationId: string): Promise<Result<OrgMemberOutput[], OrgNotFound>>;
}
