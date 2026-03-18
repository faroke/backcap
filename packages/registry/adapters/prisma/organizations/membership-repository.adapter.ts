// Template: import type { IMembershipRepository } from "{{capabilities_path}}/organizations/application/ports/membership-repository.port";
import type { IMembershipRepository } from "../../../capabilities/organizations/application/ports/membership-repository.port.js";
import { Membership } from "../../../capabilities/organizations/domain/entities/membership.entity.js";

interface PrismaMembershipRecord {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  joinedAt: Date;
}

interface PrismaMembershipDelegate {
  findUnique(args: { where: { id?: string } }): Promise<PrismaMembershipRecord | null>;
  findFirst(args: { where: { userId: string; organizationId: string } }): Promise<PrismaMembershipRecord | null>;
  findMany(args: { where: { organizationId: string } }): Promise<PrismaMembershipRecord[]>;
  create(args: { data: PrismaMembershipRecord }): Promise<PrismaMembershipRecord>;
  upsert(args: { where: { id: string }; create: PrismaMembershipRecord; update: PrismaMembershipRecord }): Promise<PrismaMembershipRecord>;
  delete(args: { where: { id: string } }): Promise<PrismaMembershipRecord>;
}

interface PrismaClient {
  membership: PrismaMembershipDelegate;
}

export class PrismaMembershipRepository implements IMembershipRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Membership | null> {
    const record = await this.prisma.membership.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByUserAndOrg(userId: string, organizationId: string): Promise<Membership | null> {
    const record = await this.prisma.membership.findFirst({
      where: { userId, organizationId },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByOrganization(organizationId: string): Promise<Membership[]> {
    const records = await this.prisma.membership.findMany({
      where: { organizationId },
    });
    return records.map((r) => this.toDomain(r));
  }

  async save(membership: Membership): Promise<void> {
    const data = this.toPrisma(membership);
    await this.prisma.membership.upsert({
      where: { id: membership.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.membership.delete({ where: { id } });
  }

  private toDomain(record: PrismaMembershipRecord): Membership {
    const result = Membership.create({
      id: record.id,
      userId: record.userId,
      organizationId: record.organizationId,
      role: record.role,
      joinedAt: record.joinedAt,
    });
    return result.unwrap();
  }

  private toPrisma(membership: Membership): PrismaMembershipRecord {
    return {
      id: membership.id,
      userId: membership.userId,
      organizationId: membership.organizationId,
      role: membership.role.value,
      joinedAt: membership.joinedAt,
    };
  }
}
