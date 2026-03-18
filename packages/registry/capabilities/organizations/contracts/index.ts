export type {
  OrgCreateInput,
  OrgInviteMemberInput,
  OrgAcceptInvitationInput,
  OrgRemoveMemberInput,
  OrgUpdateInput,
  OrgOutput,
  OrgMemberOutput,
  IOrganizationService,
} from "./organizations.contract.js";

export { createOrganizationService } from "./organizations.factory.js";
export type { OrganizationServiceDeps } from "./organizations.factory.js";
