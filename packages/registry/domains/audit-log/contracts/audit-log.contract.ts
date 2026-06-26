import type { Result } from "../shared/result.js";
import type { RecordEntryInput, RecordEntryOutput } from "../application/dto/record-entry.dto.js";
import type { QueryAuditLogInput, QueryAuditLogOutput } from "../application/dto/query-audit-log.dto.js";
import type { InvalidAuditAction } from "../domain/errors/invalid-audit-action.error.js";
import type { AuditQueryFailed } from "../domain/errors/audit-query-failed.error.js";

export interface IAuditLogService {
  record(input: RecordEntryInput): Promise<Result<RecordEntryOutput, InvalidAuditAction>>;
  query(input: QueryAuditLogInput): Promise<Result<QueryAuditLogOutput, AuditQueryFailed>>;
}
