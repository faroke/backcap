// Template: import type { IAnalyticsStore, AnalyticsFilters, AnalyticsMetrics } from "{{cap_rel}}/analytics/application/ports/analytics-store.port.js";
import type { IAnalyticsStore, AnalyticsFilters, AnalyticsMetrics } from "../../../capabilities/analytics/application/ports/analytics-store.port.js";
// Template: import { AnalyticsEvent } from "{{cap_rel}}/analytics/domain/entities/analytics-event.entity.js";
import { AnalyticsEvent } from "../../../capabilities/analytics/domain/entities/analytics-event.entity.js";

interface PrismaAnalyticsEventRecord {
  id: string;
  trackingId: string;
  name: string;
  properties: Record<string, unknown> | null;
  userId: string | null;
  sessionId: string | null;
  occurredAt: Date;
}

interface PrismaAnalyticsEventDelegate {
  create(args: { data: PrismaAnalyticsEventRecord }): Promise<PrismaAnalyticsEventRecord>;
  findMany(args?: {
    where?: Record<string, unknown>;
    skip?: number;
    take?: number;
  }): Promise<PrismaAnalyticsEventRecord[]>;
  count(args?: { where?: Record<string, unknown> }): Promise<number>;
  groupBy(args: {
    by: string[];
    where?: Record<string, unknown>;
    _count: Record<string, boolean>;
  }): Promise<Array<Record<string, unknown>>>;
}

interface PrismaClient {
  analyticsEventRecord: PrismaAnalyticsEventDelegate;
}

export class PrismaAnalyticsStore implements IAnalyticsStore {
  constructor(private readonly prisma: PrismaClient) {}

  async record(event: AnalyticsEvent): Promise<void> {
    await this.prisma.analyticsEventRecord.create({
      data: {
        id: event.id,
        trackingId: event.trackingId.value,
        name: event.name,
        properties: event.properties ?? null,
        userId: event.userId ?? null,
        sessionId: event.sessionId ?? null,
        occurredAt: event.occurredAt,
      },
    });
  }

  async query(
    filters: AnalyticsFilters,
  ): Promise<{ events: AnalyticsEvent[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filters.trackingId) where.trackingId = filters.trackingId;
    if (filters.name) where.name = filters.name;
    if (filters.fromDate || filters.toDate) {
      where.occurredAt = {
        ...(filters.fromDate ? { gte: filters.fromDate } : {}),
        ...(filters.toDate ? { lte: filters.toDate } : {}),
      };
    }

    const [records, total] = await Promise.all([
      this.prisma.analyticsEventRecord.findMany({
        where,
        skip: filters.offset,
        take: filters.limit,
      }),
      this.prisma.analyticsEventRecord.count({ where }),
    ]);

    return {
      events: records.map((r) => this.toDomain(r)),
      total,
    };
  }

  async aggregate(
    trackingId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<AnalyticsMetrics> {
    const where = {
      trackingId,
      occurredAt: { gte: fromDate, lte: toDate },
    };

    const [records, breakdown] = await Promise.all([
      this.prisma.analyticsEventRecord.findMany({ where }),
      this.prisma.analyticsEventRecord.groupBy({
        by: ["name"],
        where,
        _count: { id: true },
      }),
    ]);

    const uniqueUsers = new Set(
      records.filter((r) => r.userId).map((r) => r.userId),
    ).size;

    return {
      totalEvents: records.length,
      uniqueUsers,
      eventBreakdown: breakdown.map((b) => ({
        name: b.name as string,
        count: (b._count as Record<string, number>).id,
      })),
    };
  }

  private toDomain(record: PrismaAnalyticsEventRecord): AnalyticsEvent {
    const result = AnalyticsEvent.create({
      id: record.id,
      trackingId: record.trackingId,
      name: record.name,
      properties: record.properties ?? undefined,
      userId: record.userId ?? undefined,
      sessionId: record.sessionId ?? undefined,
      occurredAt: record.occurredAt,
    });
    if (result.isFail()) {
      throw new Error(`Corrupted analytics event record ${record.id}: ${result.unwrapError().message}`);
    }
    return result.unwrap();
  }
}
