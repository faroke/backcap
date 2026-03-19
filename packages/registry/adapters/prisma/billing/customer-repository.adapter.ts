// Template: import type { ICustomerRepository } from "{{cap_rel}}/billing/application/ports/customer-repository.port.js";
import type { ICustomerRepository } from "../../../capabilities/billing/application/ports/customer-repository.port.js";
// Template: import { Customer } from "{{cap_rel}}/billing/domain/entities/customer.entity.js";
import { Customer } from "../../../capabilities/billing/domain/entities/customer.entity.js";

interface PrismaCustomerRecord {
  id: string;
  email: string;
  name: string;
  externalId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaCustomerDelegate {
  findUnique(args: { where: { id?: string; email?: string } }): Promise<PrismaCustomerRecord | null>;
  findFirst(args: { where: { externalId?: string } }): Promise<PrismaCustomerRecord | null>;
  create(args: { data: PrismaCustomerRecord }): Promise<PrismaCustomerRecord>;
  update(args: { where: { id: string }; data: Partial<PrismaCustomerRecord> }): Promise<PrismaCustomerRecord>;
  upsert(args: { where: { id: string }; create: PrismaCustomerRecord; update: PrismaCustomerRecord }): Promise<PrismaCustomerRecord>;
}

interface PrismaClient {
  billingCustomer: PrismaCustomerDelegate;
}

export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Customer | null> {
    const record = await this.prisma.billingCustomer.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByExternalId(externalId: string): Promise<Customer | null> {
    const record = await this.prisma.billingCustomer.findFirst({ where: { externalId } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const record = await this.prisma.billingCustomer.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  async save(customer: Customer): Promise<void> {
    const data = this.toPrisma(customer);
    await this.prisma.billingCustomer.upsert({
      where: { id: customer.id },
      create: data,
      update: data,
    });
  }

  private toDomain(record: PrismaCustomerRecord): Customer {
    const result = Customer.create({
      id: record.id,
      email: record.email,
      name: record.name,
      externalId: record.externalId ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
    if (result.isFail()) {
      throw new Error(`Failed to hydrate Customer from DB: ${result.unwrapError().message}`);
    }
    return result.unwrap();
  }

  private toPrisma(customer: Customer): PrismaCustomerRecord {
    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      externalId: customer.externalId ?? null,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
