import type { IOrganizationRepository } from "../application/ports/organization-repository.port.js";
import type { IMembershipRepository } from "../application/ports/membership-repository.port.js";
import type { IInvitationService } from "../application/ports/invitation-service.port.js";
import { CreateOrganization } from "../application/use-cases/create-organization.use-case.js";
import { GetOrganization } from "../application/use-cases/get-organization.use-case.js";
import { UpdateOrganization } from "../application/use-cases/update-organization.use-case.js";
import { InviteMember } from "../application/use-cases/invite-member.use-case.js";
import { AcceptInvitation } from "../application/use-cases/accept-invitation.use-case.js";
import { RemoveMember } from "../application/use-cases/remove-member.use-case.js";
import { ListMembers } from "../application/use-cases/list-members.use-case.js";
import type { IOrganizationService } from "./organizations.contract.js";

export type OrganizationServiceDeps = {
  organizationRepository: IOrganizationRepository;
  membershipRepository: IMembershipRepository;
  invitationService: IInvitationService;
};

export function createOrganizationService(
  deps: OrganizationServiceDeps,
): IOrganizationService {
  const createOrg = new CreateOrganization(deps.organizationRepository, deps.membershipRepository);
  const getOrg = new GetOrganization(deps.organizationRepository);
  const updateOrg = new UpdateOrganization(deps.organizationRepository);
  const inviteMember = new InviteMember(deps.organizationRepository, deps.invitationService);
  const acceptInvitation = new AcceptInvitation(deps.membershipRepository, deps.invitationService);
  const removeMember = new RemoveMember(deps.organizationRepository, deps.membershipRepository);
  const listMembersUC = new ListMembers(deps.organizationRepository, deps.membershipRepository);

  return {
    createOrganization: (input) => createOrg.execute(input),
    getOrganization: async (organizationId) => {
      const result = await getOrg.execute(organizationId);
      return result.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug.value,
        plan: org.plan,
        settings: org.settings,
      }));
    },
    updateOrganization: async (input) => {
      const result = await updateOrg.execute(input);
      return result.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug.value,
        plan: org.plan,
        settings: org.settings,
      }));
    },
    inviteMember: (input) => inviteMember.execute(input),
    acceptInvitation: (input) => acceptInvitation.execute(input),
    removeMember: async (input) => {
      const result = await removeMember.execute(input);
      return result.map(() => undefined as void);
    },
    listMembers: async (organizationId) => {
      const result = await listMembersUC.execute(organizationId);
      return result.map((members) =>
        members.map((m) => ({
          id: m.id,
          userId: m.userId,
          organizationId: m.organizationId,
          role: m.role.value,
          joinedAt: m.joinedAt,
        })),
      );
    },
  };
}
