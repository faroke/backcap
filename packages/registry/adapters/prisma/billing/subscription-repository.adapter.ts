import type { ISubscriptionRepository } from "../../../capabilities/billing/application/ports/subscription-repository.port.js";
import { Subscription } from "../../../capabilities/billing/domain/entities/subscription.entity.js";

interface PrismaSubscriptionRecord {
  id: string;
  customerId: string;
  planId: string;
  status: string;
  priceAmount: number;
  priceCurrency: string;
  billingInterval: string;
  billingStartDate: Date;
  billingEndDate: Date;
  externalId: string | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaSubscriptionDelegate {
  findUnique(args: { where: { id: string } }): Promise<PrismaSubscriptionRecord | null>;
  findFirst(args: { where: { externalId?: string } }): Promise<PrismaSubscriptionRecord | null>;
  findMany(args: { where: { customerId: string } }): Promise<PrismaSubscriptionRecord[]>;
  create(args: { data: PrismaSubscriptionRecord }): Promise<PrismaSubscriptionRecord>;
  update(args: { where: { id: string }; data: Partial<PrismaSubscriptionRecord> }): Promise<PrismaSubscriptionRecord>;
  upsert(args: { where: { id: string }; create: PrismaSubscriptionRecord; update: PrismaSubscriptionRecord }): Promise<PrismaSubscriptionRecord>;
}

interface PrismaClient {
  billingSubscription: PrismaSubscriptionDelegate;
}

export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Subscription | null> {
    const record = await this.prisma.billingSubscription.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByExternalId(externalId: string): Promise<Subscription | null> {
    const record = await this.prisma.billingSubscription.findFirst({ where: { externalId } });
    return record ? this.toDomain(record) : null;
  }

  async findByCustomerId(customerId: string): Promise<Subscription[]> {
    const records = await this.prisma.billingSubscription.findMany({ where: { customerId } });
    return records.map((r) => this.toDomain(r));
  }

  async save(subscription: Subscription): Promise<void> {
    const data = this.toPrisma(subscription);
    await this.prisma.billingSubscription.upsert({
      where: { id: subscription.id },
      create: data,
      update: data,
    });
  }

  private toDomain(record: PrismaSubscriptionRecord): Subscription {
    const result = Subscription.create({
      id: record.id,
      customerId: record.customerId,
      planId: record.planId,
      status: record.status,
      priceAmount: record.priceAmount,
      priceCurrency: record.priceCurrency,
      billingInterval: record.billingInterval as "monthly" | "yearly",
      billingStartDate: record.billingStartDate,
      billingEndDate: record.billingEndDate,
      externalId: record.externalId ?? undefined,
      canceledAt: record.canceledAt ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
    if (result.isFail()) {
      throw new Error(`Failed to hydrate Subscription from DB: ${result.unwrapError().message}`);
    }
    return result.unwrap();
  }

  private toPrisma(subscription: Subscription): PrismaSubscriptionRecord {
    return {
      id: subscription.id,
      customerId: subscription.customerId,
      planId: subscription.planId,
      status: subscription.status.value,
      priceAmount: subscription.price.amount,
      priceCurrency: subscription.price.currency,
      billingInterval: subscription.billingPeriod.interval,
      billingStartDate: subscription.billingPeriod.startDate,
      billingEndDate: subscription.billingPeriod.endDate,
      externalId: subscription.externalId ?? null,
      canceledAt: subscription.canceledAt ?? null,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
