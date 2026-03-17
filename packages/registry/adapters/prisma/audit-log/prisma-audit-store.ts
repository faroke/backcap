import type {
  IAuditStore,
  AuditFilters,
} from "../../../capabilities/audit-log/application/ports/audit-store.port.js";
import { AuditEntry } from "../../../capabilities/audit-log/domain/entities/audit-entry.entity.js";

interface AuditEntryRecord {
  id: string;
  actor: string;
  action: string;
  resource: string;
  metadata: unknown | null;
  timestamp: Date;
}

interface WhereClause {
  actor?: string;
  action?: string;
  resource?: string;
  timestamp?: { gte?: Date; lte?: Date };
}

interface PrismaAuditEntryDelegate {
  create(args: { data: AuditEntryRecord }): Promise<AuditEntryRecord>;
  findMany(args: {
    where?: WhereClause;
    skip?: number;
    take?: number;
    orderBy?: { timestamp: "asc" | "desc" };
  }): Promise<AuditEntryRecord[]>;
  count(args: { where?: WhereClause }): Promise<number>;
}

interface PrismaClient {
  auditEntryRecord: PrismaAuditEntryDelegate;
}

export class PrismaAuditStore implements IAuditStore {
  constructor(private readonly prisma: PrismaClient) {}

  async append(entry: AuditEntry): Promise<void> {
    await this.prisma.auditEntryRecord.create({
      data: {
        id: entry.id,
        actor: entry.actor,
        action: entry.action.value,
        resource: entry.resource,
        metadata: entry.metadata ?? null,
        timestamp: entry.timestamp,
      },
    });
  }

  async query(
    filters: AuditFilters,
  ): Promise<{ entries: AuditEntry[]; total: number }> {
    const where = this.buildWhere(filters);

    const [records, total] = await Promise.all([
      this.prisma.auditEntryRecord.findMany({
        where,
        skip: filters.offset,
        take: filters.limit,
        orderBy: { timestamp: "desc" },
      }),
      this.prisma.auditEntryRecord.count({ where }),
    ]);

    return {
      entries: records.map((r) => this.toDomain(r)),
      total,
    };
  }

  private buildWhere(filters: AuditFilters): WhereClause {
    const where: WhereClause = {};

    if (filters.actor) where.actor = filters.actor;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;

    if (filters.fromDate || filters.toDate) {
      where.timestamp = {};
      if (filters.fromDate) where.timestamp.gte = filters.fromDate;
      if (filters.toDate) where.timestamp.lte = filters.toDate;
    }

    return where;
  }

  private toDomain(record: AuditEntryRecord): AuditEntry {
    const result = AuditEntry.create({
      id: record.id,
      actor: record.actor,
      action: record.action,
      resource: record.resource,
      metadata: record.metadata as Record<string, unknown> | undefined,
      timestamp: record.timestamp,
    });
    if (result.isFail()) {
      throw new Error(
        `Corrupted AuditEntryRecord in database (id="${record.id}"): ${result.unwrapError().message}`,
      );
    }
    return result.unwrap();
  }
}
