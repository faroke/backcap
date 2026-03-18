import type { Result } from "../shared/result.js";

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
  createOrganization(input: OrgCreateInput): Promise<Result<{ organizationId: string }, Error>>;
  getOrganization(organizationId: string): Promise<Result<OrgOutput, Error>>;
  updateOrganization(input: OrgUpdateInput): Promise<Result<OrgOutput, Error>>;
  inviteMember(input: OrgInviteMemberInput): Promise<Result<{ invitationId: string }, Error>>;
  acceptInvitation(input: OrgAcceptInvitationInput): Promise<Result<{ membershipId: string }, Error>>;
  removeMember(input: OrgRemoveMemberInput): Promise<Result<void, Error>>;
  listMembers(organizationId: string): Promise<Result<OrgMemberOutput[], Error>>;
}
