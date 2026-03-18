import type { Membership } from "../../../domain/entities/membership.entity.js";
import type { IMembershipRepository } from "../../ports/membership-repository.port.js";

export class InMemoryMembershipRepository implements IMembershipRepository {
  private store = new Map<string, Membership>();

  async findById(id: string): Promise<Membership | null> {
    return this.store.get(id) ?? null;
  }

  async findByUserAndOrg(userId: string, organizationId: string): Promise<Membership | null> {
    return (
      [...this.store.values()].find(
        (m) => m.userId === userId && m.organizationId === organizationId,
      ) ?? null
    );
  }

  async findByOrganization(organizationId: string): Promise<Membership[]> {
    return [...this.store.values()].filter(
      (m) => m.organizationId === organizationId,
    );
  }

  async save(membership: Membership): Promise<void> {
    this.store.set(membership.id, membership);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
