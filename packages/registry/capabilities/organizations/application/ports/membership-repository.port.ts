import type { Membership } from "../../domain/entities/membership.entity.js";

export interface IMembershipRepository {
  findById(id: string): Promise<Membership | null>;
  findByUserAndOrg(userId: string, organizationId: string): Promise<Membership | null>;
  findByOrganization(organizationId: string): Promise<Membership[]>;
  save(membership: Membership): Promise<void>;
  delete(id: string): Promise<void>;
}
