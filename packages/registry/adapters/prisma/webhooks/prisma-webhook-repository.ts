import type {
  IWebhookRepository,
  WebhookFilters,
} from "../../../capabilities/webhooks/application/ports/webhook-repository.port.js";
import { Webhook } from "../../../capabilities/webhooks/domain/entities/webhook.entity.js";

interface PrismaWebhookRecord {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: Date;
}

interface PrismaWebhookDelegate {
  findUnique(args: {
    where: { id: string };
  }): Promise<PrismaWebhookRecord | null>;
  findMany(args?: {
    where?: { isActive?: boolean };
    skip?: number;
    take?: number;
  }): Promise<PrismaWebhookRecord[]>;
  count(args?: { where?: { isActive?: boolean } }): Promise<number>;
  create(args: { data: PrismaWebhookRecord }): Promise<PrismaWebhookRecord>;
  update(args: {
    where: { id: string };
    data: Partial<PrismaWebhookRecord>;
  }): Promise<PrismaWebhookRecord>;
  upsert(args: {
    where: { id: string };
    create: PrismaWebhookRecord;
    update: Partial<PrismaWebhookRecord>;
  }): Promise<PrismaWebhookRecord>;
}

interface PrismaClient {
  webhookRecord: PrismaWebhookDelegate;
}

export class PrismaWebhookRepository implements IWebhookRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(webhook: Webhook): Promise<void> {
    const data = this.toPrisma(webhook);
    await this.prisma.webhookRecord.upsert({
      where: { id: webhook.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Webhook | undefined> {
    const record = await this.prisma.webhookRecord.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : undefined;
  }

  async findAll(
    filters: WebhookFilters,
  ): Promise<{ webhooks: Webhook[]; total: number }> {
    const where: { isActive?: boolean } = {};
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [records, total] = await Promise.all([
      this.prisma.webhookRecord.findMany({
        where,
        skip: filters.offset,
        take: filters.limit,
      }),
      this.prisma.webhookRecord.count({ where }),
    ]);

    return {
      webhooks: records.map((r) => this.toDomain(r)),
      total,
    };
  }

  private toDomain(record: PrismaWebhookRecord): Webhook {
    const result = Webhook.create({
      id: record.id,
      url: record.url,
      events: record.events,
      secret: record.secret,
      isActive: record.isActive,
      createdAt: record.createdAt,
      allowPrivateUrl: true,
    });
    if (result.isFail()) {
      throw new Error(`Corrupted webhook record ${record.id}: ${result.unwrapError().message}`);
    }
    return result.unwrap();
  }

  private toPrisma(webhook: Webhook): PrismaWebhookRecord {
    return {
      id: webhook.id,
      url: webhook.url.value,
      events: webhook.events,
      secret: webhook.secret,
      isActive: webhook.isActive,
      createdAt: webhook.createdAt,
    };
  }
}
