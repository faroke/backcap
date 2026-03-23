import type { Organization } from "../../../domain/entities/organization.entity.js";
import type { IOrganizationRepository } from "../../ports/organization-repository.port.js";

export class InMemoryOrganizationRepository implements IOrganizationRepository {
  private store = new Map<string, Organization>();

  async findById(id: string): Promise<Organization | null> {
    return this.store.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return [...this.store.values()].find((o) => o.slug.value === slug) ?? null;
  }

  async save(organization: Organization): Promise<void> {
    this.store.set(organization.id, organization);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
