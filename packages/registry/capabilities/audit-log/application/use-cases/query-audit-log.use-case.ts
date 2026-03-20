import { Result } from "../../shared/result.js";
import { AuditQueryFailed } from "../../domain/errors/audit-query-failed.error.js";
import type { IAuditStore } from "../ports/audit-store.port.js";
import type { QueryAuditLogInput } from "../dto/query-audit-log.dto.js";
import type { QueryAuditLogOutput } from "../dto/query-audit-log.dto.js";

export class QueryAuditLog {
  constructor(private readonly auditStore: IAuditStore) {}

  async execute(
    input: QueryAuditLogInput,
  ): Promise<Result<QueryAuditLogOutput, Error>> {
    try {
      const { entries, total } = await this.auditStore.query({
        actor: input.actor,
        action: input.action,
        resource: input.resource,
        fromDate: input.fromDate,
        toDate: input.toDate,
        limit: input.limit,
        offset: input.offset,
      });

      return Result.ok({
        entries: entries.map((entry) => ({
          id: entry.id,
          actor: entry.actor,
          action: entry.action.value,
          resource: entry.resource,
          metadata: entry.metadata,
          timestamp: entry.timestamp,
        })),
        total,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(AuditQueryFailed.create(message));
    }
  }
}
