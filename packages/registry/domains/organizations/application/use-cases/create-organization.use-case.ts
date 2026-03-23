import { Result } from "../../shared/result.js";
import { Organization } from "../../domain/entities/organization.entity.js";
import { Membership } from "../../domain/entities/membership.entity.js";
import { OrganizationCreated } from "../../domain/events/organization-created.event.js";
import { OrgSlugTaken } from "../../domain/errors/org-slug-taken.error.js";
import type { IOrganizationRepository } from "../ports/organization-repository.port.js";
import type { IMembershipRepository } from "../ports/membership-repository.port.js";
import type { CreateOrganizationInput } from "../dto/create-organization-input.dto.js";

export class CreateOrganization {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(
    input: CreateOrganizationInput,
  ): Promise<Result<{ organizationId: string; event: OrganizationCreated }, Error>> {
    const existing = await this.organizationRepository.findBySlug(input.slug);
    if (existing) {
      return Result.fail(OrgSlugTaken.create(input.slug));
    }

    const orgId = crypto.randomUUID();
    const orgResult = Organization.create({
      id: orgId,
      name: input.name,
      slug: input.slug,
      plan: input.plan,
      settings: input.settings,
    });

    if (orgResult.isFail()) {
      return Result.fail(orgResult.unwrapError());
    }

    const org = orgResult.unwrap();

    // Create owner membership before persisting
    const membershipId = crypto.randomUUID();
    const membershipResult = Membership.create({
      id: membershipId,
      userId: input.ownerId,
      organizationId: orgId,
      role: "owner",
    });

    if (membershipResult.isFail()) {
      return Result.fail(membershipResult.unwrapError());
    }

    // Persist both — rollback org if membership save fails
    await this.organizationRepository.save(org);
    try {
      await this.membershipRepository.save(membershipResult.unwrap());
    } catch (error) {
      await this.organizationRepository.delete(orgId);
      throw error;
    }

    const event = new OrganizationCreated(orgId, org.name, org.slug.value, input.ownerId);
    return Result.ok({ organizationId: orgId, event });
  }
}
