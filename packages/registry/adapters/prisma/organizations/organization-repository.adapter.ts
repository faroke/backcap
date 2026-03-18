// Template: import type { IOrganizationRepository } from "{{capabilities_path}}/organizations/application/ports/organization-repository.port";
import type { IOrganizationRepository } from "../../../capabilities/organizations/application/ports/organization-repository.port.js";
import { Organization } from "../../../capabilities/organizations/domain/entities/organization.entity.js";

interface PrismaOrganizationRecord {
  id: string;
  name: string;
  slug: string;
  plan: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaOrganizationDelegate {
  findUnique(args: { where: { id?: string; slug?: string } }): Promise<PrismaOrganizationRecord | null>;
  create(args: { data: PrismaOrganizationRecord }): Promise<PrismaOrganizationRecord>;
  upsert(args: { where: { id: string }; create: PrismaOrganizationRecord; update: PrismaOrganizationRecord }): Promise<PrismaOrganizationRecord>;
  update(args: { where: { id: string }; data: Partial<PrismaOrganizationRecord> }): Promise<PrismaOrganizationRecord>;
  delete(args: { where: { id: string } }): Promise<PrismaOrganizationRecord>;
}

interface PrismaClient {
  organization: PrismaOrganizationDelegate;
}

export class PrismaOrganizationRepository implements IOrganizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Organization | null> {
    const record = await this.prisma.organization.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const record = await this.prisma.organization.findUnique({ where: { slug } });
    return record ? this.toDomain(record) : null;
  }

  async save(organization: Organization): Promise<void> {
    const data = this.toPrisma(organization);
    await this.prisma.organization.upsert({
      where: { id: organization.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({ where: { id } });
  }

  private toDomain(record: PrismaOrganizationRecord): Organization {
    const result = Organization.create({
      id: record.id,
      name: record.name,
      slug: record.slug,
      plan: record.plan,
      settings: record.settings,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
    return result.unwrap();
  }

  private toPrisma(organization: Organization): PrismaOrganizationRecord {
    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug.value,
      plan: organization.plan,
      settings: organization.settings,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }
}
