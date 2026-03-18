import type { Organization } from "../../domain/entities/organization.entity.js";

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  save(organization: Organization): Promise<void>;
  delete(id: string): Promise<void>;
}
